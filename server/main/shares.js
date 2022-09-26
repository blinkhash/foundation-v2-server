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
  this.current = _this.client.commands.current;

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
  this.handleCurrentBlocks = function(work, worker, difficulty, round, shareData, shareType, minerType, blockType) {

    // Calculate Features of Blocks
    const identifier = shareData.identifier || 'master';
    const luck = _this.handleEffort(work, shareData, shareType, difficulty);

    // Return Blocks Updates
    return {
      timestamp: Date.now(),
      miner: (worker || '').split('.')[0],
      worker: worker,
      category: 'pending',
      confirmations: -1,
      difficulty: difficulty,
      hash: shareData.hash,
      height: shareData.height,
      identifier: identifier,
      luck: luck,
      reward: 0,
      round: round,
      solo: minerType,
      transaction: shareData.transaction,
      type: blockType,
    };
  };

  // Handle Hashrate Updates
  this.handleCurrentHashrate = function(worker, difficulty, shareType, minerType, blockType) {

    // Calculate Features of Hashrate
    const current = shareType === 'valid' ? difficulty : 0;

    // Return Hashrate Updates
    return {
      timestamp: Date.now(),
      miner: (worker || '').split('.')[0],
      worker: worker,
      solo: minerType,
      type: blockType,
      work: current,
    };
  };

  // Handle Metadata Updates
  this.handleCurrentMetadata = function(work, difficulty, poolData, shareData, shareType, minerType, blockType) {

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
  this.handleCurrentMiners = function(worker, difficulty, roundData, shareData, shareType, blockType) {

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
  this.handleCurrentRounds = function(worker, workerData, shareData, shareType, minerType, blockType) {

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
      identifier: identifier,
      invalid: invalid,
      round: 'current',
      solo: minerType,
      stale: stale,
      times: times,
      type: blockType,
      valid: valid,
      work: current,
    };
  };

  // Handle Worker Updates
  this.handleCurrentWorkers = function(worker, difficulty, roundData, shareData, shareType, minerType, blockType) {

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
      solo: minerType,
      type: blockType
    };
  };

  // Handle Primary Updates
  this.handlePrimary = function(lookups, shareData, shareType, minerType, callback) {

    // Build Round Update Data
    const identifier = uuid.v4();
    const miner = (shareData.addrPrimary || '').split('.')[0];

    // Establish Specific Lookups
    const metadata = lookups[1].rows[0] || {};
    const round = lookups[3].rows[0] || {};
    const work = minerType ? (round.work || 0) : (metadata.work || 0);

    // Build Round Block to Submit
    const blocks = _this.handleCurrentBlocks(
      work, shareData.addrPrimary, shareData.blockDiffPrimary, identifier, shareData,
      shareType, minerType, 'primary');

    // Build Round Update Transactions
    const metadataBlocks = { timestamp: Date.now(), blocks: 1, type: 'primary' };
    const metadataReset = { timestamp: Date.now(), type: 'primary' };
    const primaryUpdate = (minerType) ? (
      _this.current.rounds.updateCurrentRoundsMainSolo(_this.pool, miner, identifier, 'primary')) : (
      _this.current.rounds.updateCurrentRoundsMainShared(_this.pool, identifier, 'primary'));

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.blocks.insertCurrentBlocksMain(_this.pool, [blocks]),
      _this.current.metadata.insertCurrentMetadataBlocks(_this.pool, [metadataBlocks]),
      _this.current.metadata.insertCurrentMetadataRoundsReset(_this.pool, [metadataReset]),
      primaryUpdate,
      'COMMIT;'];

    // Insert Work into Database
    _this.executor(transaction, () => callback());
  };

  // Handle Auxiliary Updates
  this.handleAuxiliary = function(lookups, shareData, shareType, minerType, callback) {

    // Build Round Update Data
    const identifier = uuid.v4();
    const miner = (shareData.addrAuxiliary || '').split('.')[0];

    // Establish Specific Lookups
    const metadata = lookups[2].rows[0] || {};
    const round = lookups[4].rows[0] || {};
    const work = minerType ? (round.work || 0) : (metadata.work || 0);

    // Build Round Block to Submit
    const blocks = _this.handleCurrentBlocks(
      work, shareData.addrAuxiliary, shareData.blockDiffAuxiliary, identifier, shareData,
      shareType, minerType, 'auxiliary');

    // Build Round Update Transactions
    const metadataBlocks = { timestamp: Date.now(), blocks: 1, type: 'auxiliary' };
    const metadataReset = { timestamp: Date.now(), type: 'auxiliary' };
    const auxiliaryUpdate = (minerType) ? (
      _this.current.rounds.updateCurrentRoundsMainSolo(_this.pool, miner, identifier, 'auxiliary')) : (
      _this.current.rounds.updateCurrentRoundsMainShared(_this.pool, identifier, 'auxiliary'));

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.blocks.insertCurrentBlocksMain(_this.pool, [blocks]),
      _this.current.metadata.insertCurrentMetadataBlocks(_this.pool, [metadataBlocks]),
      _this.current.metadata.insertCurrentMetadataRoundsReset(_this.pool, [metadataReset]),
      auxiliaryUpdate,
      'COMMIT;'];

    // Insert Work into Database
    _this.executor(transaction, () => callback());
  };

  // Handle Share Updates
  this.handleShares = function(lookups, shareData, shareType, minerType, callback) {

    // Establish Specific Lookups
    const metadata = lookups[1].rows[0] || {};
    const round = lookups[3].rows[0] || {};
    const auxMetadata = lookups[2].rows[0] || {};
    const auxRound = lookups[4].rows[0] || {};

    // Calculate Current Round Work
    const work = minerType ? (round.work || 0) : (metadata.work || 0);
    const auxWork = minerType ? (auxRound.work || 0) : (auxMetadata.work || 0);

    // Handle Hashrate Updates
    const hashrateUpdates = _this.handleCurrentHashrate(
      shareData.addrPrimary, shareData.difficulty, shareType, minerType, 'primary');
    const auxHashrateUpdates = _this.handleCurrentHashrate(
      shareData.addrAuxiliary, shareData.difficulty, shareType, minerType, 'auxiliary');

    // Handle Metadata Updates
    const metadataUpdates = _this.handleCurrentMetadata(
      work, shareData.blockDiffPrimary, metadata, shareData, shareType, minerType, 'primary');
    const auxMetadataUpdates = _this.handleCurrentMetadata(
      auxWork, shareData.blockDiffAuxiliary, auxMetadata, shareData, shareType, minerType, 'auxiliary');

    // Handle Miner Updates
    const minerUpdates = _this.handleCurrentMiners(
      shareData.addrPrimary, shareData.blockDiffPrimary, round, shareData, shareType, 'primary');
    const auxMinerUpdates = _this.handleCurrentMiners(
      shareData.addrAuxiliary, shareData.blockDiffAuxiliary, auxRound, shareData, shareType, 'auxiliary');

    // Handle Round Updates
    const roundUpdates = _this.handleCurrentRounds(
      shareData.addrPrimary, round, shareData, shareType, minerType, 'primary');
    const auxRoundUpdates = _this.handleCurrentRounds(
      shareData.addrAuxiliary, auxRound, shareData, shareType, minerType, 'auxiliary');

    // Handle Miner/Worker Updates
    const workerUpdates = _this.handleCurrentWorkers(
      shareData.addrPrimary, shareData.blockDiffPrimary, round, shareData, shareType, minerType, 'primary');
    const auxWorkerUpdates = _this.handleCurrentWorkers(
      shareData.addrAuxiliary, shareData.blockDiffAuxiliary, auxRound, shareData, shareType, minerType, 'auxiliary');

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.hashrate.insertCurrentHashrateMain(_this.pool, [hashrateUpdates]),
      _this.current.metadata.insertCurrentMetadataRounds(_this.pool, [metadataUpdates]),
      _this.current.miners.insertCurrentMinersRounds(_this.pool, [minerUpdates]),
      _this.current.rounds.insertCurrentRoundsMain(_this.pool, [roundUpdates]),
      _this.current.workers.insertCurrentWorkersRounds(_this.pool, [workerUpdates])];

    // Add Support for Auxiliary Handling
    if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
      transaction.push(_this.current.hashrate.insertCurrentHashrateMain(_this.pool, [auxHashrateUpdates]));
      transaction.push(_this.current.metadata.insertCurrentMetadataRounds(_this.pool, [auxMetadataUpdates]));
      transaction.push(_this.current.miners.insertCurrentMinersRounds(_this.pool, [auxMinerUpdates]));
      transaction.push(_this.current.rounds.insertCurrentRoundsMain(_this.pool, [auxRoundUpdates]));
      transaction.push(_this.current.workers.insertCurrentWorkersRounds(_this.pool, [auxWorkerUpdates]));
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Share/Block Submissions
  this.handleSubmissions = function(shareData, shareValid, blockValid, callback) {

    // Calculate Share Features
    let shareType = 'valid';
    const minerType = utils.checkSoloMining(_this.config, shareData);
    if (shareData.error && shareData.error === 'job not found') shareType = 'stale';
    else if (!shareValid || shareData.error) shareType = 'invalid';

    // Build Round Parameters
    const parameters = { worker: shareData.addrPrimary, solo: minerType, type: 'primary' };
    const auxParameters = { worker: shareData.addrAuxiliary, solo: minerType, type: 'auxiliary' };

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.metadata.selectCurrentMetadataMain(_this.pool, { type: 'primary' }),
      _this.current.metadata.selectCurrentMetadataMain(_this.pool, { type: 'auxiliary' }),
      _this.current.rounds.selectCurrentRoundsMain(_this.pool, parameters),
      _this.current.rounds.selectCurrentRoundsMain(_this.pool, auxParameters),
      'COMMIT;'];

    // Establish Separate Behavior
    switch (shareData.blockType) {

    // Primary Behavior
    case 'primary':
      _this.executor(transaction, (lookups) => {
        _this.handleShares(lookups, shareData, shareType, minerType, () => {
          if (blockValid) _this.handlePrimary(lookups, shareData, shareType, minerType, () => callback());
        });
      });
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.executor(transaction, (lookups) => {
        _this.handleShares(lookups, shareData, shareType, minerType, () => {
          if (blockValid) _this.handleAuxiliary(lookups, shareData, shareType, minerType, () => callback());
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
          callback();
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
