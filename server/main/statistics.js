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

  // Handle Current Metadata Updates
  this.handleMetadata = function(miners, workers, total, blockType) {

    // Calculate Features of Metadata
    const algorithm = _this.config.primary.coin.algorithm || 'sha256d';
    const multiplier = Math.pow(2, 32) / _this.template.algorithms[algorithm].multiplier;
    const hashrate = (multiplier * total) / _this.config.settings.hashrateWindow;

    // Return Metadata Updates
    return {
      timestamp: Date.now(),
      hashrate: hashrate,
      miners: miners,
      type: blockType,
      workers: workers,
    };
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

  // Handle Primary Updates
  this.handlePrimary = function(lookups, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Handle Metadata Hashrate Updates
    if (lookups[1].rows[0] && lookups[2].rows[0] && lookups[5].rows[0]) {
      const primaryMinersMetadata = (lookups[1].rows[0] || {}).count || 0;
      const primaryWorkersMetadata = (lookups[2].rows[0] || {}).count || 0;
      const primaryCurrentMetadata = (lookups[5].rows[0] || {}).current_work || 0;
      const primaryMetadataUpdates = _this.handleMetadata(
        primaryMinersMetadata, primaryWorkersMetadata, primaryCurrentMetadata, 'primary');
      transaction.push(_this.current.metadata.insertPoolMetadataHashrateUpdate(
        _this.pool, [primaryMetadataUpdates]));
    }

    // Handle Historical Metadata Updates
    if (lookups[6].rows[0]) {
      const primaryHistoricalMetadata = lookups[6].rows[0] || {};
      const primaryHistoricalMetadataUpdates = _this.handleHistoricalMetadata(primaryHistoricalMetadata);
      transaction.push(_this.historical.metadata.insertHistoricalMetadataCurrentUpdate(
        _this.pool, [primaryHistoricalMetadataUpdates]));
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Auxiliary Updates
  this.handleAuxiliary = function(lookups, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Handle Metadata Hashrate Updates
    if (lookups[1].rows[0] && lookups[2].rows[0] && lookups[5].rows[0]) {
      const auxiliaryMinersMetadata = (lookups[1].rows[0] || {}).count || 0;
      const auxiliaryWorkersMetadata = (lookups[2].rows[0] || {}).count || 0;
      const auxiliaryCurrentMetadata = (lookups[5].rows[0] || {}).current_work || 0;
      const auxiliaryMetadataUpdates = _this.handleMetadata(
        auxiliaryMinersMetadata, auxiliaryWorkersMetadata, auxiliaryCurrentMetadata, 'auxiliary');
      transaction.push(_this.current.metadata.insertPoolMetadataHashrateUpdate(
        _this.pool, [auxiliaryMetadataUpdates]));
    }

    // Handle Historical Metadata Updates
    if (lookups[6].rows[0]) {
      const auxiliaryHistoricalMetadata = lookups[6].rows[0] || {};
      const auxiliaryHistoricalMetadataUpdates = _this.handleHistoricalMetadata(auxiliaryHistoricalMetadata);
      transaction.push(_this.historical.metadata.insertHistoricalMetadataCurrentUpdate(
        _this.pool, [auxiliaryHistoricalMetadataUpdates]));
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
      'COMMIT;'];

    // Establish Separate Behavior
    switch (blockType) {

    // Primary Behavior
    case 'primary':
      _this.executor(transaction, (lookups) => {
        _this.handlePrimary(lookups, () => {});
      });
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.executor(transaction, (lookups) => {
        _this.handleAuxiliary(lookups, () => {});
      });
      break;

    // Default Behavior
    default:
      break;
    }
  };

  // Start Statistics Interval Management
  this.handleInterval = function() {
    const random = Math.floor(Math.random() * (120 - 60) + 60);
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
