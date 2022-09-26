const Text = require('../../locales/index');

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

  // Database Variables
  this.executor = _this.client.commands.executor;
  this.current = _this.client.commands.current;
  this.historical = _this.client.commands.historical;

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
    const current = Date.now();
    const algorithm = _this.config.primary.coin.algorithm || 'sha256d';
    const multiplier = Math.pow(2, 32) / _this.template.algorithms[algorithm].multiplier;
    const section = _this.config.settings.window.hashrate;

    // Return Miners Updates
    return miners.map((miner) => {
      const filtered = hashrate.filter((share) => share.miner === miner.miner);
      const minerHash = filtered[0] || { current_work: 0 };
      return {
        timestamp: current,
        miner: miner.miner,
        hashrate: (multiplier * minerHash.current_work * 1000) / section,
        type: blockType,
      };
    });
  };

  // Handle Workers Updates
  this.handleCurrentWorkers = function(hashrate, workers, blockType) {

    // Calculate Features of Workers
    const current = Date.now();
    const algorithm = _this.config.primary.coin.algorithm || 'sha256d';
    const multiplier = Math.pow(2, 32) / _this.template.algorithms[algorithm].multiplier;
    const section = _this.config.settings.window.hashrate;

    // Return Workers Updates
    return workers.map((worker) => {
      const filtered = hashrate.filter((share) => share.worker === worker.worker);
      const workerHash = filtered[0] || { current_work: 0 };
      return {
        timestamp: current,
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
    const current = Date.now();
    const recent = Math.round(current / 600000) * 600000;

    // Return Metadata Updates
    return {
      timestamp: current,
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
    const current = Date.now();
    const recent = Math.round(current / 600000) * 600000;

    // Return Miners Updates
    return miners.map((miner) => {
      return {
        timestamp: current,
        recent: recent,
        miner: miner.miner,
        efficiency: miner.efficiency,
        effort: miner.effort,
        hashrate: miner.hashrate,
        type: miner.type,
      };
    });
  };

  // Handle Historical Network Updates
  this.handleHistoricalNetwork = function(network) {

    // Calculate Features of Network
    const current = Date.now();
    const recent = Math.round(current / 600000) * 600000;

    // Return Network Updates
    return {
      timestamp: current,
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
    const current = Date.now();
    const recent = Math.round(current / 600000) * 600000;

    // Return Workers Updates
    return workers.map((worker) => {
      return {
        timestamp: current,
        recent: recent,
        miner: worker.miner,
        worker: worker.worker,
        efficiency: worker.efficiency,
        effort: worker.effort,
        hashrate: worker.hashrate,
        solo: worker.solo,
        type: worker.type,
      };
    });
  };

  // Handle Primary Updates
  this.handlePrimary = function(lookups, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Handle Historical Metadata Updates
    if (lookups[7].rows[0]) {
      const historicalMetadata = lookups[7].rows[0] || {};
      const historicalMetadataUpdates = _this.handleHistoricalMetadata(historicalMetadata);
      transaction.push(_this.historical.metadata.insertHistoricalMetadataMain(
        _this.pool, [historicalMetadataUpdates]));
    }

    // Handle Historical Miners Updates
    if (lookups[9].rows.length >= 1) {
      const historicalMiners = lookups[9].rows || [];
      const historicalMinersUpdates = _this.handleHistoricalMiners(historicalMiners);
      transaction.push(_this.historical.miners.insertHistoricalMinersMain(
        _this.pool, historicalMinersUpdates));
    }

    // Handle Historical Network Updates
    if (lookups[10].rows[0]) {
      const historicalNetwork = lookups[10].rows[0] || {};
      const historicalNetworkUpdates = _this.handleHistoricalNetwork(historicalNetwork);
      transaction.push(_this.historical.network.insertHistoricalNetworkMain(
        _this.pool, [historicalNetworkUpdates]));
    }

    // Handle Historical Workers Updates
    if (lookups[13].rows.length >= 1) {
      const historicalWorkers = lookups[13].rows || [];
      const historicalWorkersUpdates = _this.handleHistoricalWorkers(historicalWorkers);
      transaction.push(_this.historical.workers.insertHistoricalWorkersMain(
        _this.pool, historicalWorkersUpdates));
    }

    // Handle Metadata Hashrate Updates
    if (lookups[2].rows[0] && lookups[3].rows[0] && lookups[6].rows[0]) {
      const minersMetadata = (lookups[2].rows[0] || {}).count || 0;
      const workersMetadata = (lookups[3].rows[0] || {}).count || 0;
      const currentMetadata = (lookups[6].rows[0] || {}).current_work || 0;
      const metadataUpdates = _this.handleCurrentMetadata(
        minersMetadata, workersMetadata, currentMetadata, 'primary');
      transaction.push(_this.current.metadata.insertCurrentMetadataHashrate(
        _this.pool, [metadataUpdates]));
    }

    // Handle Miners Hashrate Updates
    if (lookups[9].rows.length >= 1) {
      const hashrate = lookups[4].rows || [];
      const miners = lookups[9].rows || [];
      const minersUpdates = _this.handleCurrentMiners(hashrate, miners, 'primary');
      transaction.push(_this.current.miners.insertCurrentMinersHashrate(
        _this.pool, minersUpdates));
    }


    // Handle Workers Hashrate Updates
    if (lookups[13].rows.length >= 1) {
      const hashrate = lookups[5].rows || [];
      const workers = lookups[13].rows || [];
      const workersUpdates = _this.handleCurrentWorkers(hashrate, workers, 'primary');
      transaction.push(_this.current.workers.insertCurrentWorkersHashrate(
        _this.pool, workersUpdates));
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Auxiliary Updates
  this.handleAuxiliary = function(lookups, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Handle Historical Metadata Updates
    if (lookups[7].rows[0]) {
      const historicalMetadata = lookups[7].rows[0] || {};
      const historicalMetadataUpdates = _this.handleHistoricalMetadata(historicalMetadata);
      transaction.push(_this.historical.metadata.insertHistoricalMetadataMain(
        _this.pool, [historicalMetadataUpdates]));
    }

    // Handle Historical Miners Updates
    if (lookups[9].rows.length >= 1) {
      const historicalMiners = lookups[9].rows || [];
      const historicalMinersUpdates = _this.handleHistoricalMiners(historicalMiners);
      transaction.push(_this.historical.miners.insertHistoricalMinersMain(
        _this.pool, historicalMinersUpdates));
    }

    // Handle Historical Network Updates
    if (lookups[10].rows[0]) {
      const historicalNetwork = lookups[10].rows[0] || {};
      const historicalNetworkUpdates = _this.handleHistoricalNetwork(historicalNetwork);
      transaction.push(_this.historical.network.insertHistoricalNetworkMain(
        _this.pool, [historicalNetworkUpdates]));
    }

    // Handle Historical Workers Updates
    if (lookups[13].rows.length >= 1) {
      const historicalWorkers = lookups[13].rows || [];
      const historicalWorkersUpdates = _this.handleHistoricalWorkers(historicalWorkers);
      transaction.push(_this.historical.workers.insertHistoricalWorkersMain(
        _this.pool, historicalWorkersUpdates));
    }

    // Handle Metadata Hashrate Updates
    if (lookups[2].rows[0] && lookups[3].rows[0] && lookups[6].rows[0]) {
      const minersMetadata = (lookups[2].rows[0] || {}).count || 0;
      const workersMetadata = (lookups[3].rows[0] || {}).count || 0;
      const currentMetadata = (lookups[6].rows[0] || {}).current_work || 0;
      const metadataUpdates = _this.handleCurrentMetadata(
        minersMetadata, workersMetadata, currentMetadata, 'auxiliary');
      transaction.push(_this.current.metadata.insertCurrentMetadataHashrate(
        _this.pool, [metadataUpdates]));
    }

    // Handle Miners Hashrate Updates
    if (lookups[9].rows.length >= 1) {
      const hashrate = lookups[4].rows || [];
      const miners = lookups[9].rows || [];
      const minersUpdates = _this.handleCurrentMiners(hashrate, miners, 'auxiliary');
      transaction.push(_this.current.miners.insertCurrentMinersHashrate(
        _this.pool, minersUpdates));
    }

    // Handle Workers Hashrate Updates
    if (lookups[13].rows.length >= 1) {
      const hashrate = lookups[5].rows || [];
      const workers = lookups[13].rows || [];
      const workersUpdates = _this.handleCurrentWorkers(hashrate, workers, 'auxiliary');
      transaction.push(_this.current.workers.insertCurrentWorkersHashrate(
        _this.pool, workersUpdates));
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Statistics Updates
  this.handleStatistics = function(minerType, blockType, callback) {

    // Handle Initial Logging
    const minerTypeStr = minerType ? 'solo' : 'shared';
    const starting = [_this.text.databaseStartingText1(blockType, minerTypeStr)];
    _this.logger.log('Statistics', _this.config.name, starting);

    // Calculate Statistics Features
    const hashrateWindow = Date.now() - _this.config.settings.window.hashrate;
    const inactiveWindow = Date.now() - _this.config.settings.window.inactive;
    const updateWindow = Date.now() - _this.config.settings.window.updates;

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.hashrate.deleteCurrentHashrateInactive(_this.pool, hashrateWindow),
      _this.current.hashrate.countCurrentHashrateMiner(_this.pool, hashrateWindow, false, blockType),
      _this.current.hashrate.countCurrentHashrateWorker(_this.pool, hashrateWindow, false, blockType),
      _this.current.hashrate.sumCurrentHashrateMiner(_this.pool, hashrateWindow, minerType, blockType),
      _this.current.hashrate.sumCurrentHashrateWorker(_this.pool, hashrateWindow, minerType, blockType),
      _this.current.hashrate.sumCurrentHashrateType(_this.pool, hashrateWindow, false, blockType),
      _this.current.metadata.selectCurrentMetadataMain(_this.pool, { type: blockType }),
      _this.current.miners.deleteCurrentMinersInactive(_this.pool, inactiveWindow),
      _this.current.miners.selectCurrentMinersMain(_this.pool, { type: blockType }),
      _this.current.network.selectCurrentNetworkMain(_this.pool, { type: blockType }),
      _this.current.transactions.deleteCurrentTransactionsInactive(_this.pool, updateWindow),
      _this.current.workers.deleteCurrentWorkersInactive(_this.pool, inactiveWindow),
      _this.current.workers.selectCurrentWorkersMain(_this.pool, { solo: minerType, type: blockType }),
      'COMMIT;'];

    // Establish Separate Behavior
    switch (blockType) {

    // Primary Behavior
    case 'primary':
      _this.executor(transaction, (lookups) => {
        _this.handlePrimary(lookups, () => {
          const updates = [_this.text.databaseUpdatesText1(blockType, minerTypeStr)];
          _this.logger.log('Statistics', _this.config.name, updates);
          callback();
        });
      });
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.executor(transaction, (lookups) => {
        _this.handleAuxiliary(lookups, () => {
          const updates = [_this.text.databaseUpdatesText1(blockType, minerTypeStr)];
          _this.logger.log('Statistics', _this.config.name, updates);
          callback();
        });
      });
      break;

    // Default Behavior
    default:
      break;
    }
  };

  // Start Statistics Interval Management
  /* istanbul ignore next */
  this.handleInterval = function(minerType) {
    const minInterval = _this.config.settings.interval.statistics * 0.75;
    const maxInterval = _this.config.settings.interval.statistics * 1.25;
    const random = Math.floor(Math.random() * (maxInterval - minInterval) + minInterval);
    setTimeout(() => {
      _this.handleInterval(minerType);
      _this.handleStatistics(minerType, 'primary', () => {});
      if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
        _this.handleStatistics(minerType, 'auxiliary', () => {});
      }
    }, random);
  };

  // Start Statistics Capabilities
  /* istanbul ignore next */
  this.setupStatistics = function(callback) {
    _this.handleInterval(true);
    _this.handleInterval(false);
    callback();
  };
};

module.exports = Statistics;
