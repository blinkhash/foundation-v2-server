const Text = require('../../locales/index');
const utils = require('./utils');

////////////////////////////////////////////////////////////////////////////////

// Main Statistics Function
const Statistics = function (logger, client, config, configMain, template) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.config = config;
  this.configMain = configMain;
  this.pool = config.name;
  this.template = template;
  this.text = Text[configMain.language];

  // Stratum Variables
  process.setMaxListeners(0);
  this.forkId = process.env.forkId;

  // Client Handlers
  this.master = {
    executor: _this.client.master.commands.executor,
    current: _this.client.master.commands.current,
    historical: _this.client.master.commands.historical };

  // Handle Current Metadata Updates
  this.handleCurrentMetadata = function(miners, workers, total, blockType) {

    // Calculate Features of Metadata
    const algorithm = _this.config.primary.coin.algorithm || 'sha256d';
    const multiplier = Math.pow(2, 32) / _this.template.algorithms[algorithm].multiplier;
    const section = _this.config.settings.window.hashrate;

    // Return Metadata Updates
    return {
      timestamp: Date.now(),
      hashrate: (multiplier * total * 1000) / section,
      miners: miners,
      type: blockType,
      workers: workers,
    };
  };

  // Handle Current Miners Updates
  this.handleCurrentMiners = function(hashrate, miners, blockType) {

    // Calculate Features of Miners
    const timestamp = Date.now();
    const algorithm = _this.config.primary.coin.algorithm || 'sha256d';
    const multiplier = Math.pow(2, 32) / _this.template.algorithms[algorithm].multiplier;
    const section = _this.config.settings.window.hashrate;

    // Return Miners Updates
    return miners.map((miner) => {
      const filtered = hashrate.filter((share) => share.miner === miner.miner);
      const minerHash = filtered[0] || { current_work: 0 };
      return {
        timestamp: timestamp,
        miner: miner.miner,
        hashrate: (multiplier * minerHash.current_work * 1000) / section,
        type: blockType,
      };
    });
  };

  // Handle Workers Updates
  this.handleCurrentWorkers = function(hashrate, workers, blockType) {

    // Calculate Features of Workers
    const timestamp = Date.now();
    const algorithm = _this.config.primary.coin.algorithm || 'sha256d';
    const multiplier = Math.pow(2, 32) / _this.template.algorithms[algorithm].multiplier;
    const section = _this.config.settings.window.hashrate;

    // Return Workers Updates
    return workers.map((worker) => {
      const filtered = hashrate.filter((share) => share.worker === worker.worker);
      const workerHash = filtered[0] || { current_work: 0 };
      return {
        timestamp: timestamp,
        miner: (worker.worker || '').split('.')[0],
        worker: worker.worker,
        hashrate: (multiplier * workerHash.current_work * 1000) / section,
        solo: worker.solo,
        type: blockType,
      };
    });
  };

  // Handle Historical Metadata Updates
  this.handleHistoricalMetadata = function(metadata) {

    // Calculate Features of Metadata
    const timestamp = Date.now();
    const interval = _this.config.settings.interval.historical;
    const recent = Math.round(timestamp / interval) * interval;

    // Return Metadata Updates
    return {
      timestamp: timestamp,
      recent: recent,
      blocks: metadata.blocks,
      efficiency: metadata.efficiency,
      effort: metadata.effort,
      hashrate: metadata.hashrate,
      invalid: metadata.invalid,
      miners: metadata.miners,
      stale: metadata.stale,
      type: metadata.type,
      valid: metadata.valid,
      work: metadata.work,
      workers: metadata.workers,
    };
  };

  // Handle Historical Miners Updates
  this.handleHistoricalMiners = function(miners) {

    // Calculate Features of Miners
    const timestamp = Date.now();
    const interval = _this.config.settings.interval.historical;
    const recent = Math.round(timestamp / interval) * interval;

    // Return Miners Updates
    return miners.map((miner) => {
      return {
        timestamp: timestamp,
        recent: recent,
        miner: miner.miner,
        efficiency: miner.efficiency,
        effort: miner.effort,
        hashrate: miner.hashrate,
        invalid: miner.invalid,
        stale: miner.stale,
        type: miner.type,
        valid: miner.valid,
        work: miner.work,
      };
    });
  };

  // Handle Historical Network Updates
  this.handleHistoricalNetwork = function(network) {

    // Calculate Features of Network
    const timestamp = Date.now();
    const interval = _this.config.settings.interval.historical;
    const recent = Math.round(timestamp / interval) * interval;

    // Return Network Updates
    return {
      timestamp: timestamp,
      recent: recent,
      difficulty: network.difficulty,
      hashrate: network.hashrate,
      height: network.height,
      type: network.type,
    };
  };

  // Handle Historical Workers Updates
  this.handleHistoricalWorkers = function(workers) {

    // Calculate Features of Workers
    const timestamp = Date.now();
    const interval = _this.config.settings.interval.historical;
    const recent = Math.round(timestamp / interval) * interval;

    // Return Workers Updates
    return workers.map((worker) => {
      return {
        timestamp: timestamp,
        recent: recent,
        miner: worker.miner,
        worker: worker.worker,
        efficiency: worker.efficiency,
        effort: worker.effort,
        hashrate: worker.hashrate,
        invalid: worker.invalid,
        solo: worker.solo,
        stale: worker.stale,
        type: worker.type,
        valid: worker.valid,
        work: worker.work,
      };
    });
  };

  // Handle Primary Updates
  this.handlePrimary = function(lookups, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Handle Metadata Hashrate Updates
    if (lookups[2].rows[0] && lookups[3].rows[0] && lookups[4].rows[0] && lookups[8].rows[0]) {
      const minersMetadata = lookups[2].rows[0].count || 0;
      const soloWorkersMetadata = lookups[3].rows[0].count || 0;
      const sharedWorkersMetadata = lookups[4].rows[0].count || 0;
      const workersMetadata = soloWorkersMetadata + sharedWorkersMetadata;
      const currentMetadata = lookups[8].rows[0].current_work || 0;
      const metadataUpdates = _this.handleCurrentMetadata(
        minersMetadata, workersMetadata, currentMetadata, 'primary');
      transaction.push(_this.master.current.metadata.insertCurrentMetadataHashrate(
        _this.pool, [metadataUpdates]));
    }

    // Handle Miners Hashrate Updates
    if (lookups[11].rows.length >= 1) {
      const hashrate = lookups[5].rows;
      const miners = lookups[11].rows;
      const minersUpdates = _this.handleCurrentMiners(hashrate, miners, 'primary');
      transaction.push(_this.master.current.miners.insertCurrentMinersHashrate(
        _this.pool, minersUpdates));
    }

    // Handle Workers Solo Hashrate Updates
    if (lookups[15].rows.length >= 1) {
      const hashrate = lookups[6].rows;
      const soloWorkers = lookups[15].rows;
      const soloWorkersUpdates = _this.handleCurrentWorkers(hashrate, soloWorkers, 'primary');
      transaction.push(_this.master.current.workers.insertCurrentWorkersHashrate(
        _this.pool, soloWorkersUpdates));
    }

    // Handle Workers Shared Hashrate Updates
    if (lookups[16].rows.length >= 1) {
      const hashrate = lookups[7].rows;
      const sharedWorkers = lookups[16].rows;
      const sharedWorkersUpdates = _this.handleCurrentWorkers(hashrate, sharedWorkers, 'primary');
      transaction.push(_this.master.current.workers.insertCurrentWorkersHashrate(
        _this.pool, sharedWorkersUpdates));
    }

    // Handle Historical Metadata Updates
    if (lookups[9].rows[0]) {
      const historicalMetadata = lookups[9].rows[0];
      const historicalMetadataUpdates = _this.handleHistoricalMetadata(historicalMetadata);
      transaction.push(_this.master.historical.metadata.insertHistoricalMetadataMain(
        _this.pool, [historicalMetadataUpdates]));
    }

    // Handle Historical Miners Updates
    if (lookups[11].rows.length >= 1) {
      const historicalMiners = lookups[11].rows;
      const historicalMinersUpdates = _this.handleHistoricalMiners(historicalMiners);
      transaction.push(_this.master.historical.miners.insertHistoricalMinersMain(
        _this.pool, historicalMinersUpdates));
    }

    // Handle Historical Network Updates
    if (lookups[12].rows[0]) {
      const historicalNetwork = lookups[12].rows[0];
      const historicalNetworkUpdates = _this.handleHistoricalNetwork(historicalNetwork);
      transaction.push(_this.master.historical.network.insertHistoricalNetworkMain(
        _this.pool, [historicalNetworkUpdates]));
    }

    // Handle Historical Solo Workers Updates
    if (lookups[15].rows.length >= 1) {
      const historicalSoloWorkers = lookups[15].rows;
      const historicalSoloWorkersUpdates = _this.handleHistoricalWorkers(historicalSoloWorkers);
      transaction.push(_this.master.historical.workers.insertHistoricalWorkersMain(
        _this.pool, historicalSoloWorkersUpdates));
    }

    // Handle Historical Shared Workers Updates
    if (lookups[16].rows.length >= 1) {
      const historicalSharedWorkers = lookups[16].rows;
      const historicalSharedWorkersUpdates = _this.handleHistoricalWorkers(historicalSharedWorkers);
      transaction.push(_this.master.historical.workers.insertHistoricalWorkersMain(
        _this.pool, historicalSharedWorkersUpdates));
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.master.executor(transaction, () => callback());
  };

  // Handle Auxiliary Updates
  this.handleAuxiliary = function(lookups, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Handle Metadata Hashrate Updates
    if (lookups[2].rows[0] && lookups[3].rows[0] && lookups[4].rows[0] && lookups[8].rows[0]) {
      const minersMetadata = lookups[2].rows[0].count || 0;
      const soloWorkersMetadata = lookups[3].rows[0].count || 0;
      const sharedWorkersMetadata = lookups[4].rows[0].count || 0;
      const workersMetadata = soloWorkersMetadata + sharedWorkersMetadata;
      const currentMetadata = lookups[8].rows[0].current_work || 0;
      const metadataUpdates = _this.handleCurrentMetadata(
        minersMetadata, workersMetadata, currentMetadata, 'auxiliary');
      transaction.push(_this.master.current.metadata.insertCurrentMetadataHashrate(
        _this.pool, [metadataUpdates]));
    }

    // Handle Miners Hashrate Updates
    if (lookups[11].rows.length >= 1) {
      const hashrate = lookups[5].rows;
      const miners = lookups[11].rows;
      const minersUpdates = _this.handleCurrentMiners(hashrate, miners, 'auxiliary');
      transaction.push(_this.master.current.miners.insertCurrentMinersHashrate(
        _this.pool, minersUpdates));
    }

    // Handle Workers Solo Hashrate Updates
    if (lookups[15].rows.length >= 1) {
      const hashrate = lookups[6].rows;
      const soloWorkers = lookups[15].rows;
      const soloWorkersUpdates = _this.handleCurrentWorkers(hashrate, soloWorkers, 'auxiliary');
      transaction.push(_this.master.current.workers.insertCurrentWorkersHashrate(
        _this.pool, soloWorkersUpdates));
    }

    // Handle Workers Shared Hashrate Updates
    if (lookups[16].rows.length >= 1) {
      const hashrate = lookups[7].rows;
      const sharedWorkers = lookups[16].rows;
      const sharedWorkersUpdates = _this.handleCurrentWorkers(hashrate, sharedWorkers, 'auxiliary');
      transaction.push(_this.master.current.workers.insertCurrentWorkersHashrate(
        _this.pool, sharedWorkersUpdates));
    }

    // Handle Historical Metadata Updates
    if (lookups[9].rows[0]) {
      const historicalMetadata = lookups[9].rows[0];
      const historicalMetadataUpdates = _this.handleHistoricalMetadata(historicalMetadata);
      transaction.push(_this.master.historical.metadata.insertHistoricalMetadataMain(
        _this.pool, [historicalMetadataUpdates]));
    }

    // Handle Historical Miners Updates
    if (lookups[11].rows.length >= 1) {
      const historicalMiners = lookups[11].rows;
      const historicalMinersUpdates = _this.handleHistoricalMiners(historicalMiners);
      transaction.push(_this.master.historical.miners.insertHistoricalMinersMain(
        _this.pool, historicalMinersUpdates));
    }

    // Handle Historical Network Updates
    if (lookups[12].rows[0]) {
      const historicalNetwork = lookups[12].rows[0];
      const historicalNetworkUpdates = _this.handleHistoricalNetwork(historicalNetwork);
      transaction.push(_this.master.historical.network.insertHistoricalNetworkMain(
        _this.pool, [historicalNetworkUpdates]));
    }

    // Handle Historical Solo Workers Updates
    if (lookups[15].rows.length >= 1) {
      const historicalSoloWorkers = lookups[15].rows;
      const historicalSoloWorkersUpdates = _this.handleHistoricalWorkers(historicalSoloWorkers);
      transaction.push(_this.master.historical.workers.insertHistoricalWorkersMain(
        _this.pool, historicalSoloWorkersUpdates));
    }

    // Handle Historical Shared Workers Updates
    if (lookups[16].rows.length >= 1) {
      const historicalSharedWorkers = lookups[16].rows;
      const historicalSharedWorkersUpdates = _this.handleHistoricalWorkers(historicalSharedWorkers);
      transaction.push(_this.master.historical.workers.insertHistoricalWorkersMain(
        _this.pool, historicalSharedWorkersUpdates));
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.master.executor(transaction, () => callback());
  };

  // Handle Statistics Updates
  this.handleStatistics = function(blockType, callback) {

    // Handle Initial Logging
    const starting = [_this.text.databaseStartingText1(blockType)];
    _this.logger.debug('Statistics', _this.config.name, starting);

    // Calculate Statistics Features
    const hashrateWindow = Date.now() - _this.config.settings.window.hashrate;
    const inactiveWindow = Date.now() - _this.config.settings.window.inactive;
    const updateWindow = Date.now() - _this.config.settings.window.updates;

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.master.current.hashrate.deleteCurrentHashrateInactive(_this.pool, hashrateWindow),
      _this.master.current.hashrate.countCurrentHashrateMiner(_this.pool, hashrateWindow, blockType),
      _this.master.current.hashrate.countCurrentHashrateWorker(_this.pool, hashrateWindow, true, blockType),
      _this.master.current.hashrate.countCurrentHashrateWorker(_this.pool, hashrateWindow, false, blockType),
      _this.master.current.hashrate.sumCurrentHashrateMiner(_this.pool, hashrateWindow, blockType),
      _this.master.current.hashrate.sumCurrentHashrateWorker(_this.pool, hashrateWindow, true, blockType),
      _this.master.current.hashrate.sumCurrentHashrateWorker(_this.pool, hashrateWindow, false, blockType),
      _this.master.current.hashrate.sumCurrentHashrateType(_this.pool, hashrateWindow, false, blockType),
      _this.master.current.metadata.selectCurrentMetadataMain(_this.pool, { type: blockType }),
      _this.master.current.miners.deleteCurrentMinersInactive(_this.pool, inactiveWindow),
      _this.master.current.miners.selectCurrentMinersMain(_this.pool, { type: blockType }),
      _this.master.current.network.selectCurrentNetworkMain(_this.pool, { type: blockType }),
      _this.master.current.transactions.deleteCurrentTransactionsInactive(_this.pool, updateWindow),
      _this.master.current.workers.deleteCurrentWorkersInactive(_this.pool, inactiveWindow),
      _this.master.current.workers.selectCurrentWorkersMain(_this.pool, { solo: true, type: blockType }),
      _this.master.current.workers.selectCurrentWorkersMain(_this.pool, { solo: false, type: blockType }),
      'COMMIT;'];

    // Establish Separate Behavior
    switch (blockType) {

    // Primary Behavior
    case 'primary':
      _this.master.executor(transaction, (lookups) => {
        _this.handlePrimary(lookups, () => {
          const updates = [_this.text.databaseUpdatesText1(blockType)];
          _this.logger.debug('Statistics', _this.config.name, updates);
          callback();
        });
      });
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.master.executor(transaction, (lookups) => {
        _this.handleAuxiliary(lookups, () => {
          const updates = [_this.text.databaseUpdatesText1(blockType)];
          _this.logger.debug('Statistics', _this.config.name, updates);
          callback();
        });
      });
      break;

    // Default Behavior
    default:
      callback();
      break;
    }
  };

  // Start Statistics Interval Management
  /* istanbul ignore next */
  this.handleInterval = function() {
    const interval = _this.config.settings.interval.statistics;
    setTimeout(() => {
      _this.handleInterval();
      if (_this.config.primary.checks.enabled) _this.handleStatistics('primary', () => {});
      if (_this.config.auxiliary && _this.config.auxiliary.enabled && _this.config.auxiliary.checks.enabled) {
        _this.handleStatistics('auxiliary', () => {});
      }
    }, interval);
  };

  // Start Statistics Capabilities
  /* istanbul ignore next */
  this.setupStatistics = function(callback) {
    const interval = _this.config.settings.interval.statistics;
    const numForks = utils.countProcessForks(_this.configMain);
    const timing = parseFloat(_this.forkId) * interval / numForks;
    setTimeout(() => _this.handleInterval(), timing);
    callback();
  };
};

module.exports = Statistics;
