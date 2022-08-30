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
  this.current = _this.client.commands.pool;
  this.historical = _this.client.commands.historical;

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
        type: worker.type,
      };
    });
  };

  // Handle Current Metadata Updates
  this.handleMetadata = function(miners, workers, total, blockType) {

    // Calculate Features of Metadata
    const algorithm = _this.config.primary.coin.algorithm || 'sha256d';
    const multiplier = Math.pow(2, 32) / _this.template.algorithms[algorithm].multiplier;
    const section = _this.config.settings.hashrateWindow;

    // Return Metadata Updates
    return {
      timestamp: Date.now(),
      hashrate: (multiplier * total * 1000) / section,
      miners: miners,
      type: blockType,
      workers: workers,
    };
  };

  // Handle Miners Updates
  this.handleMiners = function(miners, blockType) {

    // Calculate Features of Miners
    const current = Date.now();
    const algorithm = _this.config.primary.coin.algorithm || 'sha256d';
    const multiplier = Math.pow(2, 32) / _this.template.algorithms[algorithm].multiplier;
    const section = _this.config.settings.hashrateWindow;

    // Return Miners Updates
    return miners.map((miner) => {
      return {
        timestamp: current,
        miner: miner.miner,
        hashrate: (multiplier * miner.current_work * 1000) / section,
        type: blockType,
      };
    });
  };

  // Handle Workers Updates
  this.handleWorkers = function(workers, blockType) {

    // Calculate Features of Workers
    const current = Date.now();
    const algorithm = _this.config.primary.coin.algorithm || 'sha256d';
    const multiplier = Math.pow(2, 32) / _this.template.algorithms[algorithm].multiplier;
    const section = _this.config.settings.hashrateWindow;

    // Return Workers Updates
    return workers.map((worker) => {
      return {
        timestamp: current,
        miner: (worker.worker || '').split('.')[0],
        worker: worker.worker,
        hashrate: (multiplier * worker.current_work * 1000) / section,
        type: blockType,
      };
    });
  };

  // Handle Primary Updates
  this.handlePrimary = function(lookups, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Handle Historical Metadata Updates
    if (lookups[6].rows[0]) {
      const historicalMetadata = lookups[6].rows[0] || {};
      const historicalMetadataUpdates = _this.handleHistoricalMetadata(historicalMetadata);
      transaction.push(_this.historical.metadata.insertHistoricalMetadataCurrent(
        _this.pool, [historicalMetadataUpdates]));
    }

    // Handle Historical Miners Updates
    if (lookups[7].rows.length >= 1) {
      const historicalMiners = lookups[7].rows || [];
      const historicalMinersUpdates = _this.handleHistoricalMiners(historicalMiners);
      transaction.push(_this.historical.miners.insertHistoricalMinersCurrent(
        _this.pool, historicalMinersUpdates));
    }

    // Handle Historical Network Updates
    if (lookups[8].rows[0]) {
      const historicalNetwork = lookups[8].rows[0] || {};
      const historicalNetworkUpdates = _this.handleHistoricalNetwork(historicalNetwork);
      transaction.push(_this.historical.network.insertHistoricalNetworkCurrent(
        _this.pool, [historicalNetworkUpdates]));
    }

    // Handle Historical Workers Updates
    if (lookups[9].rows.length >= 1) {
      const historicalWorkers = lookups[9].rows || [];
      const historicalWorkersUpdates = _this.handleHistoricalWorkers(historicalWorkers);
      transaction.push(_this.historical.workers.insertHistoricalWorkersCurrent(
        _this.pool, historicalWorkersUpdates));
    }

    // Handle Metadata Hashrate Updates
    if (lookups[1].rows[0] && lookups[2].rows[0] && lookups[5].rows[0]) {
      const minersMetadata = (lookups[1].rows[0] || {}).count || 0;
      const workersMetadata = (lookups[2].rows[0] || {}).count || 0;
      const currentMetadata = (lookups[5].rows[0] || {}).current_work || 0;
      const metadataUpdates = _this.handleMetadata(
        minersMetadata, workersMetadata, currentMetadata, 'primary');
      transaction.push(_this.current.metadata.insertPoolMetadataHashrate(
        _this.pool, [metadataUpdates]));
    }

    // Handle Miners Hashrate Updates
    if (lookups[3].rows.length >= 1) {
      const miners = lookups[3].rows || [];
      const minersUpdates = _this.handleMiners(miners, 'primary');
      transaction.push(_this.current.miners.insertPoolMinersHashrate(
        _this.pool, minersUpdates));
    }

    // Handle Workers Hashrate Updates
    if (lookups[4].rows.length >= 1) {
      const workers = lookups[4].rows || [];
      const workersUpdates = _this.handleWorkers(workers, 'primary');
      transaction.push(_this.current.workers.insertPoolWorkersHashrate(
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
    if (lookups[6].rows[0]) {
      const historicalMetadata = lookups[6].rows[0] || {};
      const historicalMetadataUpdates = _this.handleHistoricalMetadata(historicalMetadata);
      transaction.push(_this.historical.metadata.insertHistoricalMetadataCurrent(
        _this.pool, [historicalMetadataUpdates]));
    }

    // Handle Historical Miners Updates
    if (lookups[7].rows.length >= 1) {
      const historicalMiners = lookups[7].rows || [];
      const historicalMinersUpdates = _this.handleHistoricalMiners(historicalMiners);
      transaction.push(_this.historical.miners.insertHistoricalMinersCurrent(
        _this.pool, historicalMinersUpdates));
    }

    // Handle Historical Network Updates
    if (lookups[8].rows[0]) {
      const historicalNetwork = lookups[8].rows[0] || {};
      const historicalNetworkUpdates = _this.handleHistoricalNetwork(historicalNetwork);
      transaction.push(_this.historical.network.insertHistoricalNetworkCurrent(
        _this.pool, [historicalNetworkUpdates]));
    }

    // Handle Historical Workers Updates
    if (lookups[9].rows.length >= 1) {
      const historicalWorkers = lookups[9].rows || [];
      const historicalWorkersUpdates = _this.handleHistoricalWorkers(historicalWorkers);
      transaction.push(_this.historical.workers.insertHistoricalWorkersCurrent(
        _this.pool, historicalWorkersUpdates));
    }

    // Handle Metadata Hashrate Updates
    if (lookups[1].rows[0] && lookups[2].rows[0] && lookups[5].rows[0]) {
      const minersMetadata = (lookups[1].rows[0] || {}).count || 0;
      const workersMetadata = (lookups[2].rows[0] || {}).count || 0;
      const currentMetadata = (lookups[5].rows[0] || {}).current_work || 0;
      const metadataUpdates = _this.handleMetadata(
        minersMetadata, workersMetadata, currentMetadata, 'auxiliary');
      transaction.push(_this.current.metadata.insertPoolMetadataHashrate(
        _this.pool, [metadataUpdates]));
    }

    // Handle Miners Hashrate Updates
    if (lookups[3].rows.length >= 1) {
      const miners = lookups[3].rows || [];
      const minersUpdates = _this.handleMiners(miners, 'auxiliary');
      transaction.push(_this.current.miners.insertPoolMinersHashrate(
        _this.pool, minersUpdates));
    }

    // Handle Workers Hashrate Updates
    if (lookups[4].rows.length >= 1) {
      const workers = lookups[4].rows || [];
      const workersUpdates = _this.handleWorkers(workers, 'auxiliary');
      transaction.push(_this.current.workers.insertPoolWorkersHashrate(
        _this.pool, workersUpdates));
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Statistics Updates
  this.handleStatistics = function(blockType) {

    // Calculate Statistics Features
    const hashrateWindow = Date.now() - _this.config.settings.hashrateWindow;

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.hashrate.countPoolHashrateMiner(_this.pool, hashrateWindow, blockType),
      _this.current.hashrate.countPoolHashrateWorker(_this.pool, hashrateWindow, blockType),
      _this.current.hashrate.sumPoolHashrateMiner(_this.pool, hashrateWindow, blockType),
      _this.current.hashrate.sumPoolHashrateWorker(_this.pool, hashrateWindow, blockType),
      _this.current.hashrate.sumPoolHashrateType(_this.pool, hashrateWindow, blockType),
      _this.current.metadata.selectPoolMetadataType(_this.pool, blockType),
      _this.current.miners.selectPoolMinersType(_this.pool, blockType),
      _this.current.network.selectPoolNetworkType(_this.pool, blockType),
      _this.current.workers.selectPoolWorkersType(_this.pool, blockType),
      'COMMIT;'];

    // Establish Separate Behavior
    switch (blockType) {

    // Primary Behavior
    case 'primary':
      _this.executor(transaction, (lookups) => {
        _this.handlePrimary(lookups, () => {
          const lines = [_this.text.historicalUpdatesText1()];
          _this.logger.log('Statistics', _this.config.name, lines);
        });
      });
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.executor(transaction, (lookups) => {
        _this.handleAuxiliary(lookups, () => {
          const lines = [_this.text.historicalUpdatesText2()];
          _this.logger.log('Statistics', _this.config.name, lines);
        });
      });
      break;

    // Default Behavior
    default:
      break;
    }
  };

  // Start Statistics Interval Management
  this.handleInterval = function() {
    const random = Math.floor(Math.random() * (600 - 60) + 60);
    setTimeout(() => {
      _this.handleInterval();
      _this.handleStatistics('primary');
      if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
        _this.handleStatistics('auxiliary');
      }
    }, random * 1000);
  };

  // Start Statistics Capabilities
  /* istanbul ignore next */
  this.setupStatistics = function(callback) {
    _this.handleInterval();
    callback();
  };
};

module.exports = Statistics;
