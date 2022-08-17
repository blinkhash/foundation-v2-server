const Text = require('../../locales/index');
const utils = require('./utils');

////////////////////////////////////////////////////////////////////////////////

// Main Shares Function
const Shares = function (logger, client, config, configMain) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.config = config;
  this.configMain = configMain;
  this.pool = config.name;
  this.text = Text[configMain.language];

  // Stratum Variables
  process.setMaxListeners(0);
  this.forkId = process.env.forkId;

  // Database Variables
  this.executor = _this.client.commands.executor;
  this.connection = _this.client.commands.pool;

  // Handle Efficiency Updates
  this.handleEfficiency = function(poolData, shareType) {
    const valid = shareType === 'valid' ? poolData.valid || 0 + 1 : poolData.valid || 0;
    const total = poolData.valid || 0 + poolData.stale || 0 + poolData.invalid || 0 + 1;
    return ((valid / total) || 0) * 100;
  };

  // Handle Effort Updates
  this.handleEffort = function(work, shareData, shareType, difficulty) {
    const total = shareType === 'valid' ? work + shareData.difficulty || 0 : work;
    return ((total / difficulty) || 0) * 100;
  };

  // Handle Times Updates
  this.handleTimes = function(sharePrevious) {
    let times = sharePrevious.times || 0;
    const lastTime = sharePrevious.timestamp || Date.now();
    const timeChange = utils.roundTo(Math.max(Date.now() - lastTime, 0) / 1000, 4);
    if (timeChange < 900) times = times + timeChange;
    return times;
  };

  // Handle Hashrate Updates
  this.handleHashrate = function(shareData, shareType) {

    // Calculate Features of Hashrate
    const current = shareType === 'valid' ? shareData.difficulty : 0;

    // Return Hashrate Updates
    return {
      timestamp: Date.now(),
      miner: (shareData.addrPrimary || '').split('.')[0],
      worker: shareData.addrPrimary,
      work: current,
    };
  };

  // Handle Metadata Updates
  this.handleMetadata = function(work, difficulty, poolData, shareData, shareType, minerType, blockType) {

    // Calculate Features of Metadata
    const invalid = shareType === 'invalid' ? 1 : 0;
    const stale = shareType === 'stale' ? 1 : 0;
    const valid = shareType === 'valid' ? 1 : 0;
    const current = shareType === 'valid' ? shareData.difficulty : -shareData.difficulty;

    // Calculate Efficiency/Effort Metadata
    const efficiency = _this.handleEfficiency(poolData, shareType);
    const effort = _this.handleEffort(work, shareData, shareType, difficulty);

    // Return Metadata Updates
    return {
      timestamp: Date.now(),
      efficiency: efficiency,
      effort: effort,
      invalid: minerType ? 0 : invalid,
      stale: minerType ? 0 : stale,
      type: blockType,
      valid: minerType ? 0 : valid,
      work: minerType ? 0 : current,
    };
  };

  // Handle Round Updates
  this.handleRounds = function(worker, workerData, shareData, shareType, minerType, blockType) {

    // Calculate Features of Round Share [1]
    const invalid = shareType === 'invalid' ? 1 : 0;
    const stale = shareType === 'stale' ? 1 : 0;
    const valid = shareType === 'valid' ? 1 : 0;

    // Calculate Features of Round Share [2]
    const identifier = shareData.identifier || 'master';
    const times = (Object.keys(workerData).length >= 1 && shareType === 'valid') ?
      _this.handleTimes(workerData) : 0;
    const current = shareType === 'valid' ? shareData.difficulty : -shareData.difficulty;

    // Return Round Updates
    return {
      timestamp: Date.now(),
      miner: (worker || '').split('.')[0],
      worker: worker,
      height: -1,
      identifier: identifier,
      invalid: invalid,
      solo: minerType,
      stale: stale,
      times: times,
      type: blockType,
      valid: valid,
      work: current,
    };
  };

  // Handle Share Updates
  this.handleShares = function(lookups, shareData, shareType, minerType, callback) {

    // Establish Specific Lookups
    const primaryMetadata = lookups[2].rows[0] || {};
    const auxiliaryMetadata = lookups[3].rows[0] || {};
    const primaryWorker = lookups[4].rows[0] || {};
    const auxiliaryWorker = lookups[5].rows[0] || {};

    // Calculate Current Round Work
    const primaryWork = minerType ? primaryWorker.work || 0 : primaryMetadata.work || 0;
    const auxiliaryWork = minerType ? auxiliaryWorker.work || 0 : auxiliaryMetadata.work || 0;

    // Handle Metadata Updates
    const hashrateUpdates = _this.handleHashrate(shareData, shareType);
    const primaryMetadataUpdates = _this.handleMetadata(
      primaryWork, shareData.blockDiffPrimary, primaryMetadata, shareData, shareType, minerType, 'primary');
    const auxiliaryMetadataUpdates = _this.handleMetadata(
      auxiliaryWork, shareData.blockDiffAuxiliary, auxiliaryMetadata, shareData, shareType, minerType, 'auxiliary');

    // Handle Worker Updates
    const primaryWorkerUpdates = _this.handleRounds(
      shareData.addrPrimary, primaryWorker, shareData, shareType, minerType, 'primary');
    const auxiliaryWorkerUpdates = _this.handleRounds(
      shareData.addrAuxiliary, auxiliaryWorker, shareData, shareType, minerType, 'auxiliary');

    // Build Initial Transaction
    const transaction = [
      'BEGIN;',
      _this.connection.hashrate.insertPoolHashrateCurrent(_this.pool, hashrateUpdates),
      _this.connection.metadata.insertPoolMetadataRoundUpdate(_this.pool, primaryMetadataUpdates),
      _this.connection.rounds.insertPoolRoundCurrent(_this.pool, primaryWorkerUpdates)];

    // Add Support for Auxiliary Handling
    if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
      transaction.push(_this.connection.metadata.insertPoolMetadataRoundUpdate(_this.pool, auxiliaryMetadataUpdates));
      transaction.push(_this.connection.rounds.insertPoolRoundCurrent(_this.pool, auxiliaryWorkerUpdates));
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Share/Block Submissions
  this.handleSubmissions = function(shareData, shareValid) {

    // Calculate Share Features
    let shareType = 'valid';
    const minerType = utils.checkSoloMining(_this.config, shareData);
    const windowTime = Date.now() - _this.config.settings.hashrateWindow;
    if (shareData.error && shareData.error === 'job not found') shareType = 'stale';
    else if (!shareValid || shareData.error) shareType = 'invalid';

    // Build Initial Transaction
    const transaction = [
      'BEGIN;',
      _this.connection.hashrate.deletePoolHashrateCurrent(_this.pool, windowTime),
      _this.connection.metadata.selectPoolMetadataCurrent(_this.pool, 'primary'),
      _this.connection.metadata.selectPoolMetadataCurrent(_this.pool, 'auxiliary'),
      _this.connection.rounds.selectPoolRoundCombinedCurrent(_this.pool, shareData.addrPrimary, minerType, 'primary'),
      _this.connection.rounds.selectPoolRoundCombinedCurrent(_this.pool, shareData.addrAuxiliary, minerType, 'auxiliary'),
      'COMMIT;'];

    // Establish Separate Behavior
    switch (shareData.blockType) {

    // Accepted Behavior
    case 'primary':
    case 'auxiliary':
      _this.executor(transaction, () => {

      });
      break;

    // Share Behavior
    case 'share':
      _this.executor(transaction, (lookups) => {
        _this.handleShares(lookups, shareData, shareType, minerType, () => {});
      });
      break;

    // Default Behavior
    default:
      break;
    }
  };
};

module.exports = Shares;
