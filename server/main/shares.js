const Text = require('../../locales/index');
const utils = require('./utils');
const uuid = require('uuid');

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
  this.current = _this.client.commands.pool;

  // Handle Efficiency Updates
  this.handleEfficiency = function(roundData, shareType) {
    const valid = shareType === 'valid' ? (roundData.valid || 0) + 1 : (roundData.valid || 0);
    const total = (roundData.valid || 0) + (roundData.stale || 0) + (roundData.invalid || 0) + 1;
    return ((valid / total) || 0) * 100;
  };

  // Handle Effort Updates
  this.handleEffort = function(work, shareData, shareType, difficulty) {
    const total = shareType === 'valid' ? work + (shareData.difficulty || 0) : work;
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

  // Handle Blocks Updates
  this.handleBlocks = function(work, worker, difficulty, round, shareData, shareType, minerType, blockType) {

    // Calculate Features of Blocks
    const identifier = shareData.identifier || 'master';
    const luck = _this.handleEffort(work, shareData, shareType, difficulty);

    // Return Blocks Updates
    return {
      timestamp: Date.now(),
      miner: (worker || '').split('.')[0],
      worker: worker,
      difficulty: difficulty,
      hash: shareData.hash,
      height: shareData.height,
      identifier: identifier,
      luck: luck,
      orphan: false,
      reward: shareData.reward,
      round: round,
      solo: minerType,
      type: blockType,
    };
  };

  // Handle Hashrate Updates
  this.handleHashrate = function(worker, difficulty, shareType, blockType) {

    // Calculate Features of Hashrate
    const current = shareType === 'valid' ? difficulty : 0;

    // Return Hashrate Updates
    return {
      timestamp: Date.now(),
      miner: (worker || '').split('.')[0],
      worker: worker,
      type: blockType,
      work: current,
    };
  };

  // Handle Metadata Updates
  this.handleMetadata = function(work, difficulty, poolData, shareData, shareType, minerType, blockType) {

    // Calculate Features of Metadata
    const invalid = shareType === 'invalid' ? 1 : 0;
    const stale = shareType === 'stale' ? 1 : 0;
    const valid = shareType === 'valid' ? 1 : 0;
    const current = shareType === 'valid' ? shareData.difficulty : 0;

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

  // Handle Miner Updates
  this.handleMiners = function(worker, difficulty, roundData, shareData, shareType, blockType) {

    // Calculate Efficiency/Effort Metadata
    const efficiency = _this.handleEfficiency(roundData, shareType);
    const effort = _this.handleEffort(roundData.work, shareData, shareType, difficulty);

    // Return Miner Updates
    return {
      miner: (worker || '').split('.')[0],
      timestamp: Date.now(),
      efficiency: efficiency,
      effort: effort,
      type: blockType
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
      round: 'current',
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

  // Handle Worker Updates
  this.handleWorkers = function(worker, difficulty, roundData, shareData, shareType, blockType) {

    // Calculate Efficiency/Effort Metadata
    const efficiency = _this.handleEfficiency(roundData, shareType);
    const effort = _this.handleEffort(roundData.work, shareData, shareType, difficulty);

    // Return Miner Updates
    return {
      worker: worker,
      miner: (worker || '').split('.')[0],
      timestamp: Date.now(),
      efficiency: efficiency,
      effort: effort,
      type: blockType
    };
  };

  // Handle Primary Updates
  this.handlePrimary = function(lookups, shareData, shareType, minerType, callback) {

    // Build Round Update Data
    const round = uuid.v4();
    const miner = (shareData.addrPrimary || '').split('.')[0];

    // Establish Specific Lookups
    const primaryMetadata = lookups[2].rows[0] || {};
    const primaryRound = lookups[4].rows[0] || {};
    const primaryWork = minerType ? (primaryRound.work || 0) : (primaryMetadata.work || 0);

    // Build Round Block to Submit
    const primaryBlocks = _this.handleBlocks(
      primaryWork, shareData.addrPrimary, shareData.blockDiffPrimary, round, shareData,
      shareType, minerType, 'primary');

    // Build Round Update Transactions
    const primaryMetadataBlocks = { timestamp: Date.now(), blocks: 1, type: 'primary' };
    const primaryMetadataReset = { timestamp: Date.now(), type: 'primary' };
    const primaryUpdate = (minerType) ? (
      _this.current.rounds.updatePoolRoundsCurrentSolo(_this.pool, miner, round, 'primary')) : (
      _this.current.rounds.updatePoolRoundsCurrentShared(_this.pool, round, 'primary'));

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.blocks.insertPoolBlocksCurrent(_this.pool, [primaryBlocks]),
      _this.current.metadata.insertPoolMetadataBlocksUpdate(_this.pool, [primaryMetadataBlocks]),
      _this.current.metadata.insertPoolMetadataRoundsReset(_this.pool, [primaryMetadataReset]),
      primaryUpdate,
      'COMMIT;'];

    // Insert Work into Database
    _this.executor(transaction, () => callback());
  };

  // Handle Auxiliary Updates
  this.handleAuxiliary = function(lookups, shareData, shareType, minerType, callback) {

    // Build Round Update Data
    const round = uuid.v4();
    const miner = (shareData.addrAuxiliary || '').split('.')[0];

    // Establish Specific Lookups
    const auxiliaryMetadata = lookups[3].rows[0] || {};
    const auxiliaryRound = lookups[5].rows[0] || {};
    const auxiliaryWork = minerType ? (auxiliaryRound.work || 0) : (auxiliaryMetadata.work || 0);

    // Build Round Block to Submit
    const auxiliaryBlocks = _this.handleBlocks(
      auxiliaryWork, shareData.addrAuxiliary, shareData.blockDiffAuxiliary, round, shareData,
      shareType, minerType, 'auxiliary');

    // Build Round Update Transactions
    const auxiliaryMetadataBlocks = { timestamp: Date.now(), blocks: 1, type: 'auxiliary' };
    const auxiliaryMetadataReset = { timestamp: Date.now(), type: 'auxiliary' };
    const auxiliaryUpdate = (minerType) ? (
      _this.current.rounds.updatePoolRoundsCurrentSolo(_this.pool, miner, round, 'auxiliary')) : (
      _this.current.rounds.updatePoolRoundsCurrentShared(_this.pool, round, 'auxiliary'));

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.blocks.insertPoolBlocksCurrent(_this.pool, [auxiliaryBlocks]),
      _this.current.metadata.insertPoolMetadataBlocksUpdate(_this.pool, [auxiliaryMetadataBlocks]),
      _this.current.metadata.insertPoolMetadataRoundsReset(_this.pool, [auxiliaryMetadataReset]),
      auxiliaryUpdate,
      'COMMIT;'];

    // Insert Work into Database
    _this.executor(transaction, () => callback());
  };

  // Handle Share Updates
  this.handleShares = function(lookups, shareData, shareType, minerType, callback) {

    // Establish Specific Lookups
    const primaryMetadata = lookups[4].rows[0] || {};
    const auxiliaryMetadata = lookups[5].rows[0] || {};
    const primaryRound = lookups[6].rows[0] || {};
    const auxiliaryRound = lookups[7].rows[0] || {};

    // Calculate Current Round Work
    const primaryWork = minerType ? (primaryRound.work || 0) : (primaryMetadata.work || 0);
    const auxiliaryWork = minerType ? (auxiliaryRound.work || 0) : (auxiliaryMetadata.work || 0);

    // Handle Hashrate Updates
    const primaryHashrateUpdates = _this.handleHashrate(
      shareData.addrPrimary, shareData.difficulty, shareType, 'primary');
    const auxiliaryHashrateUpdates = _this.handleHashrate(
      shareData.addrAuxiliary, shareData.difficulty, shareType, 'auxiliary');

    // Handle Metadata Updates
    const primaryMetadataUpdates = _this.handleMetadata(
      primaryWork, shareData.blockDiffPrimary, primaryMetadata, shareData, shareType, minerType, 'primary');
    const auxiliaryMetadataUpdates = _this.handleMetadata(
      auxiliaryWork, shareData.blockDiffAuxiliary, auxiliaryMetadata, shareData, shareType, minerType, 'auxiliary');

    // Handle Miner Updates
    const primaryMinerUpdates = _this.handleMiners(
      shareData.addrPrimary, shareData.blockDiffPrimary, primaryRound, shareData, shareType, 'primary');
    const auxiliaryMinerUpdates = _this.handleMiners(
      shareData.addrAuxiliary, shareData.blockDiffAuxiliary, auxiliaryRound, shareData, shareType, 'auxiliary');

    // Handle Round Updates
    const primaryRoundUpdates = _this.handleRounds(
      shareData.addrPrimary, primaryRound, shareData, shareType, minerType, 'primary');
    const auxiliaryRoundUpdates = _this.handleRounds(
      shareData.addrAuxiliary, auxiliaryRound, shareData, shareType, minerType, 'auxiliary');

    // Handle Miner/Worker Updates
    const primaryWorkerUpdates = _this.handleWorkers(
      shareData.addrPrimary, shareData.blockDiffPrimary, primaryRound, shareData, shareType, 'primary');
    const auxiliaryWorkerUpdates = _this.handleWorkers(
      shareData.addrAuxiliary, shareData.blockDiffAuxiliary, auxiliaryRound, shareData, shareType, 'auxiliary');

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.hashrate.insertPoolHashrateCurrent(_this.pool, [primaryHashrateUpdates]),
      _this.current.metadata.insertPoolMetadataRoundsUpdate(_this.pool, [primaryMetadataUpdates]),
      _this.current.miners.insertPoolMinersRounds(_this.pool, [primaryMinerUpdates]),
      _this.current.rounds.insertPoolRoundsCurrent(_this.pool, [primaryRoundUpdates]),
      _this.current.workers.insertPoolWorkersRounds(_this.pool, [primaryWorkerUpdates])];

    // Add Support for Auxiliary Handling
    if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
      transaction.push(_this.current.hashrate.insertPoolHashrateCurrent(_this.pool, [auxiliaryHashrateUpdates]));
      transaction.push(_this.current.metadata.insertPoolMetadataRoundsUpdate(_this.pool, [auxiliaryMetadataUpdates]));
      transaction.push(_this.current.miners.insertPoolMinersRounds(_this.pool, [auxiliaryMinerUpdates]));
      transaction.push(_this.current.rounds.insertPoolRoundsCurrent(_this.pool, [auxiliaryRoundUpdates]));
      transaction.push(_this.current.workers.insertPoolWorkersRounds(_this.pool, [auxiliaryWorkerUpdates]));
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Share/Block Submissions
  this.handleSubmissions = function(shareData, shareValid, blockValid) {

    // Calculate Share Features
    let shareType = 'valid';
    const minerType = utils.checkSoloMining(_this.config, shareData);
    const inactiveWindow = Date.now() - _this.config.settings.inactiveWindow;
    const hashrateWindow = Date.now() - _this.config.settings.hashrateWindow;
    if (shareData.error && shareData.error === 'job not found') shareType = 'stale';
    else if (!shareValid || shareData.error) shareType = 'invalid';

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.hashrate.deletePoolHashrateCurrent(_this.pool, hashrateWindow),
      _this.current.miners.deletePoolMinersCurrent(_this.pool, inactiveWindow),
      _this.current.workers.deletePoolWorkersCurrent(_this.pool, inactiveWindow),
      _this.current.metadata.selectPoolMetadataType(_this.pool, 'primary'),
      _this.current.metadata.selectPoolMetadataType(_this.pool, 'auxiliary'),
      _this.current.rounds.selectPoolRoundsCombinedCurrent(_this.pool, shareData.addrPrimary, minerType, 'primary'),
      _this.current.rounds.selectPoolRoundsCombinedCurrent(_this.pool, shareData.addrAuxiliary, minerType, 'auxiliary'),
      'COMMIT;'];

    // Establish Separate Behavior
    switch (shareData.blockType) {

    // Primary Behavior
    case 'primary':
      _this.executor(transaction, (lookups) => {
        _this.handleShares(lookups, shareData, shareType, minerType, () => {
          if (blockValid) _this.handlePrimary(lookups, shareData, shareType, minerType, () => {});
        });
      });
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.executor(transaction, (lookups) => {
        _this.handleShares(lookups, shareData, shareType, minerType, () => {
          if (blockValid) _this.handleAuxiliary(lookups, shareData, shareType, minerType, () => {});
        });
      });
      break;

    // Share Behavior
    case 'share':
      _this.executor(transaction, (lookups) => {
        _this.handleShares(lookups, shareData, shareType, minerType, () => {
          const type = (shareType === 'valid') ? 'log' : 'error';
          const lines = [(shareType === 'valid') ?
            _this.text.sharesSubmissionsText1(
              shareData.difficulty, shareData.shareDiff, shareData.addrPrimary, shareData.ip) :
            _this.text.sharesSubmissionsText2(shareData.error, shareData.addrPrimary, shareData.ip)];
          _this.logger[type]('Shares', _this.config.name, lines);
        });
      });
      break;

    // Default Behavior
    default:
      break;
    }
  };
};

module.exports = Shares;
