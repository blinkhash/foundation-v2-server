const Text = require('../../locales/index');
const utils = require('./utils');
const uuid = require('uuid');

////////////////////////////////////////////////////////////////////////////////

// Main Rounds Function
const Rounds = function (logger, client, config, configMain) {

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

  // Client Handlers
  this.master = {
    executor: _this.client.master.commands.executor,
    current: _this.client.master.commands.current };
  this.worker = {
    executor: _this.client.worker.commands.executor,
    local: _this.client.worker.commands.local };

  // Handle Efficiency Updates
  this.handleEfficiency = function(roundData, shareType) {
    const valid = shareType === 'valid' ? (roundData.valid || 0) + 1 : (roundData.valid || 0);
    const total = (roundData.valid || 0) + (roundData.stale || 0) + (roundData.invalid || 0) + 1;
    return Math.round(((valid / total) || 0) * 10000) / 100;
  };

  // Handle Effort Updates
  this.handleEffort = function(work, shareData, shareType, difficulty) {
    const total = shareType === 'valid' ? work + (shareData.clientdiff || 0) : work;
    return Math.round(((total / difficulty) || 0) * 10000) / 100;
  };

  // Handle Times Updates
  this.handleTimes = function(sharePrevious, timestamp) {
    let times = sharePrevious.times || 0;
    const lastTime = sharePrevious.timestamp || Date.now();
    const timeChange = utils.roundTo(Math.max(timestamp - lastTime, 0) / 1000, 4);
    if (timeChange < 900) times += timeChange;
    return times;
  };

  // // Handle Blocks Updates
  // this.handleCurrentBlocks = function(work, worker, difficulty, round, shareData, shareType, minerType, blockType) {
  //
  //   // Calculate Features of Blocks
  //   const identifier = shareData.identifier || 'master';
  //   const luck = _this.handleEffort(work, shareData, shareType, difficulty);
  //
  //   // Return Blocks Updates
  //   return {
  //     timestamp: Date.now(),
  //     submitted: Date.now(),
  //     miner: (worker || '').split('.')[0],
  //     worker: worker,
  //     category: 'pending',
  //     confirmations: -1,
  //     difficulty: difficulty,
  //     hash: shareData.hash,
  //     height: shareData.height,
  //     identifier: identifier,
  //     luck: luck,
  //     reward: 0,
  //     round: round,
  //     solo: minerType,
  //     transaction: shareData.transaction,
  //     type: blockType,
  //   };
  // };
  //
  // // Handle Hashrate Updates
  // this.handleCurrentHashrate = function(worker, difficulty, shareData, shareType, minerType, blockType) {
  //
  //   // Calculate Features of Hashrate
  //   const current = shareType === 'valid' ? difficulty : 0;
  //   const identifier = shareData.identifier || 'master';
  //
  //   // Return Hashrate Updates
  //   return {
  //     timestamp: Date.now(),
  //     miner: (worker || '').split('.')[0],
  //     worker: worker,
  //     identifier: identifier,
  //     share: shareType,
  //     solo: minerType,
  //     type: blockType,
  //     work: current,
  //   };
  // };
  //
  // // Handle Metadata Updates
  // this.handleCurrentMetadata = function(work, difficulty, roundData, shareData, shareType, minerType, blockType) {
  //
  //   // Calculate Features of Metadata
  //   const invalid = shareType === 'invalid' ? 1 : 0;
  //   const stale = shareType === 'stale' ? 1 : 0;
  //   const valid = shareType === 'valid' ? 1 : 0;
  //   const current = shareType === 'valid' ? shareData.clientdiff : 0;
  //
  //   // Calculate Efficiency/Effort Metadata
  //   const efficiency = _this.handleEfficiency(roundData, shareType);
  //   const effort = _this.handleEffort(work, shareData, shareType, difficulty);
  //
  //   // Return Metadata Updates
  //   return {
  //     timestamp: Date.now(),
  //     efficiency: efficiency,
  //     effort: effort,
  //     invalid: minerType ? 0 : invalid,
  //     stale: minerType ? 0 : stale,
  //     type: blockType,
  //     valid: minerType ? 0 : valid,
  //     work: minerType ? 0 : current,
  //   };
  // };
  //
  // // Handle Miner Updates
  // this.handleCurrentMiners = function(worker, difficulty, roundData, shareData, shareType, blockType) {
  //
  //   // Calculate Features of Miners
  //   const invalid = shareType === 'invalid' ? 1 : 0;
  //   const stale = shareType === 'stale' ? 1 : 0;
  //   const valid = shareType === 'valid' ? 1 : 0;
  //
  //   // Calculate Efficiency/Effort Metadata
  //   const efficiency = _this.handleEfficiency(roundData, shareType);
  //   const effort = _this.handleEffort(roundData.work, shareData, shareType, difficulty);
  //
  //   // Return Miner Updates
  //   return {
  //     timestamp: Date.now(),
  //     miner: (worker || '').split('.')[0],
  //     efficiency: efficiency,
  //     effort: effort,
  //     invalid: invalid,
  //     stale: stale,
  //     type: blockType,
  //     valid: valid,
  //   };
  // };
  //
  // // Handle Round Updates
  // this.handleCurrentRounds = function(worker, workerData, shareData, shareType, minerType, blockType) {
  //
  //   // Calculate Features of Rounds
  //   const timestamp = Date.now();
  //   const interval = _this.config.settings.interval.rounds;
  //   const recent = Math.round(timestamp / interval) * interval;
  //
  //   // Calculate Features of Rounds [1]
  //   const invalid = shareType === 'invalid' ? 1 : 0;
  //   const stale = shareType === 'stale' ? 1 : 0;
  //   const valid = shareType === 'valid' ? 1 : 0;
  //
  //   // Calculate Features of Rounds [2]
  //   const identifier = shareData.identifier || 'master';
  //   const times = (Object.keys(workerData).length >= 1 && shareType === 'valid') ?
  //     _this.handleTimes(workerData, shareData.submitted) : 0;
  //   const current = shareType === 'valid' ? shareData.clientdiff : 0;
  //
  //   // Return Round Updates
  //   return {
  //     timestamp: timestamp,
  //     recent: recent,
  //     miner: (worker || '').split('.')[0],
  //     worker: worker,
  //     identifier: identifier,
  //     invalid: invalid,
  //     round: 'current',
  //     solo: minerType,
  //     stale: stale,
  //     times: times,
  //     type: blockType,
  //     valid: valid,
  //     work: current,
  //   };
  // };
  //
  // // Handle Worker Updates
  // this.handleCurrentWorkers = function(worker, difficulty, roundData, shareData, shareType, minerType, blockType) {
  //
  //   // Calculate Features of Workers
  //   const invalid = shareType === 'invalid' ? 1 : 0;
  //   const stale = shareType === 'stale' ? 1 : 0;
  //   const valid = shareType === 'valid' ? 1 : 0;
  //
  //   // Calculate Efficiency/Effort Metadata
  //   const efficiency = _this.handleEfficiency(roundData, shareType);
  //   const effort = _this.handleEffort(roundData.work, shareData, shareType, difficulty);
  //
  //   // Return Miner Updates
  //   return {
  //     timestamp: Date.now(),
  //     miner: (worker || '').split('.')[0],
  //     worker: worker,
  //     efficiency: efficiency,
  //     effort: effort,
  //     invalid: invalid,
  //     solo: minerType,
  //     stale: stale,
  //     type: blockType,
  //     valid: valid,
  //   };
  // };
  //
  // // Handle Primary Updates
  // this.handlePrimary = function(lookups, shareData, shareType, minerType, callback) {
  //
  //   // Build Round Update Data
  //   const identifier = uuid.v4();
  //   const miner = (shareData.addrprimary || '').split('.')[0];
  //
  //   // Establish Specific Lookups
  //   const metadata = lookups[1].rows[0] || {};
  //   const round = lookups[3].rows[0] || {};
  //   const work = minerType ? (round.work || 0) : (metadata.work || 0);
  //
  //   // Build Round Block to Submit
  //   const blocks = _this.handleCurrentBlocks(
  //     work, shareData.addrprimary, shareData.blockdiffprimary, identifier, shareData,
  //     shareType, minerType, 'primary');
  //
  //   // Build Round Update Transactions
  //   const metadataBlocks = { timestamp: Date.now(), blocks: 1, type: 'primary' };
  //   const metadataReset = { timestamp: Date.now(), type: 'primary' };
  //   const primaryUpdate = (minerType) ? (
  //     _this.master.current.rounds.updateCurrentRoundsMainSolo(_this.pool, miner, identifier, 'primary')) : (
  //     _this.master.current.rounds.updateCurrentRoundsMainShared(_this.pool, identifier, 'primary'));
  //
  //   // Build Combined Transaction
  //   const transaction = [
  //     'BEGIN;',
  //     _this.master.current.blocks.insertCurrentBlocksMain(_this.pool, [blocks]),
  //     _this.master.current.metadata.insertCurrentMetadataBlocks(_this.pool, [metadataBlocks]),
  //     _this.master.current.metadata.insertCurrentMetadataRoundsReset(_this.pool, [metadataReset]),
  //     primaryUpdate,
  //     'COMMIT;'];
  //
  //   // Insert Work into Database
  //   _this.master.executor(transaction, () => callback());
  // };
  //
  // // Handle Auxiliary Updates
  // this.handleAuxiliary = function(lookups, shareData, shareType, minerType, callback) {
  //
  //   // Build Round Update Data
  //   const identifier = uuid.v4();
  //   const miner = (shareData.addrauxiliary || '').split('.')[0];
  //
  //   // Establish Specific Lookups
  //   const metadata = lookups[2].rows[0] || {};
  //   const round = lookups[4].rows[0] || {};
  //   const work = minerType ? (round.work || 0) : (metadata.work || 0);
  //
  //   // Build Round Block to Submit
  //   const blocks = _this.handleCurrentBlocks(
  //     work, shareData.addrauxiliary, shareData.blockdiffauxiliary, identifier, shareData,
  //     shareType, minerType, 'auxiliary');
  //
  //   // Build Round Update Transactions
  //   const metadataBlocks = { timestamp: Date.now(), blocks: 1, type: 'auxiliary' };
  //   const metadataReset = { timestamp: Date.now(), type: 'auxiliary' };
  //   const auxiliaryUpdate = (minerType) ? (
  //     _this.master.current.rounds.updateCurrentRoundsMainSolo(_this.pool, miner, identifier, 'auxiliary')) : (
  //     _this.master.current.rounds.updateCurrentRoundsMainShared(_this.pool, identifier, 'auxiliary'));
  //
  //   // Build Combined Transaction
  //   const transaction = [
  //     'BEGIN;',
  //     _this.master.current.blocks.insertCurrentBlocksMain(_this.pool, [blocks]),
  //     _this.master.current.metadata.insertCurrentMetadataBlocks(_this.pool, [metadataBlocks]),
  //     _this.master.current.metadata.insertCurrentMetadataRoundsReset(_this.pool, [metadataReset]),
  //     auxiliaryUpdate,
  //     'COMMIT;'];
  //
  //   // Insert Work into Database
  //   _this.master.executor(transaction, () => callback());
  // };
  //
  // // Handle Round Updates
  // this.handleUpdates = function(lookups, shareData, shareType, minerType, callback) {
  //
  //   // Establish Specific Lookups
  //   const metadata = lookups[1].rows[0] || {};
  //   const round = lookups[3].rows[0] || {};
  //   const auxMetadata = lookups[2].rows[0] || {};
  //   const auxRound = lookups[4].rows[0] || {};
  //
  //   // Calculate Current Round Work
  //   const work = minerType ? (round.work || 0) : (metadata.work || 0);
  //   const auxWork = minerType ? (auxRound.work || 0) : (auxMetadata.work || 0);
  //
  //   // Handle Hashrate Updates
  //   const hashrateUpdates = _this.handleCurrentHashrate(
  //     shareData.addrprimary, shareData.clientdiff, shareData, shareType, minerType, 'primary');
  //   const auxHashrateUpdates = _this.handleCurrentHashrate(
  //     shareData.addrauxiliary, shareData.clientdiff, shareData, shareType, minerType, 'auxiliary');
  //
  //   // Handle Metadata Updates
  //   const metadataUpdates = _this.handleCurrentMetadata(
  //     work, shareData.blockdiffprimary, metadata, shareData, shareType, minerType, 'primary');
  //   const auxMetadataUpdates = _this.handleCurrentMetadata(
  //     auxWork, shareData.blockdiffauxiliary, auxMetadata, shareData, shareType, minerType, 'auxiliary');
  //
  //   // Handle Miner Updates
  //   const minerUpdates = _this.handleCurrentMiners(
  //     shareData.addrprimary, shareData.blockdiffprimary, round, shareData, shareType, 'primary');
  //   const auxMinerUpdates = _this.handleCurrentMiners(
  //     shareData.addrauxiliary, shareData.blockdiffauxiliary, auxRound, shareData, shareType, 'auxiliary');
  //
  //   // Handle Round Updates
  //   const roundUpdates = _this.handleCurrentRounds(
  //     shareData.addrprimary, round, shareData, shareType, minerType, 'primary');
  //   const auxRoundUpdates = _this.handleCurrentRounds(
  //     shareData.addrauxiliary, auxRound, shareData, shareType, minerType, 'auxiliary');
  //
  //   // Handle Miner/Worker Updates
  //   const workerUpdates = _this.handleCurrentWorkers(
  //     shareData.addrprimary, shareData.blockdiffprimary, round, shareData, shareType, minerType, 'primary');
  //   const auxWorkerUpdates = _this.handleCurrentWorkers(
  //     shareData.addrauxiliary, shareData.blockdiffauxiliary, auxRound, shareData, shareType, minerType, 'auxiliary');
  //
  //   // Build Combined Transaction
  //   const transaction = [
  //     'BEGIN;',
  //     _this.master.current.hashrate.insertCurrentHashrateMain(_this.pool, [hashrateUpdates]),
  //     _this.master.current.metadata.insertCurrentMetadataRounds(_this.pool, [metadataUpdates]),
  //     _this.master.current.miners.insertCurrentMinersRounds(_this.pool, [minerUpdates]),
  //     _this.master.current.rounds.insertCurrentRoundsMain(_this.pool, [roundUpdates]),
  //     _this.master.current.workers.insertCurrentWorkersRounds(_this.pool, [workerUpdates])];
  //
  //   // Add Support for Auxiliary Handling
  //   if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
  //     transaction.push(_this.master.current.hashrate.insertCurrentHashrateMain(_this.pool, [auxHashrateUpdates]));
  //     transaction.push(_this.master.current.metadata.insertCurrentMetadataRounds(_this.pool, [auxMetadataUpdates]));
  //     transaction.push(_this.master.current.miners.insertCurrentMinersRounds(_this.pool, [auxMinerUpdates]));
  //     transaction.push(_this.master.current.rounds.insertCurrentRoundsMain(_this.pool, [auxRoundUpdates]));
  //     transaction.push(_this.master.current.workers.insertCurrentWorkersRounds(_this.pool, [auxWorkerUpdates]));
  //   }
  //
  //   // Insert Work into Database
  //   transaction.push('COMMIT;');
  //   _this.master.executor(transaction, () => callback());
  // };
  //
  // // Handle Share/Block Submissions
  // this.handleShares = function(shareData, callback) {
  //
  //   // Calculate Share Features
  //   let shareType = 'valid';
  //   const minerType = utils.checkSoloMining(_this.config, shareData);
  //   if (shareData.error && shareData.error === 'job not found') shareType = 'stale';
  //   else if (!shareValid || shareData.error) shareType = 'invalid';
  //
  //   // Build Round Parameters
  //   const parameters = { worker: shareData.addrprimary, solo: minerType, type: 'primary', order: 'timestamp', direction: 'descending' };
  //   const auxParameters = { worker: shareData.addrauxiliary, solo: minerType, type: 'auxiliary', order: 'timestamp', direction: 'descending' };
  //
  //   // Build Combined Transaction
  //   const transaction = [
  //     'BEGIN;',
  //     _this.master.current.metadata.selectCurrentMetadataMain(_this.pool, { type: 'primary' }),
  //     _this.master.current.metadata.selectCurrentMetadataMain(_this.pool, { type: 'auxiliary' }),
  //     _this.master.current.rounds.selectCurrentRoundsMain(_this.pool, parameters),
  //     _this.master.current.rounds.selectCurrentRoundsMain(_this.pool, auxParameters),
  //     'COMMIT;'];
  //
  //   // Establish Separate Behavior
  //   switch (shareData.blocktype) {
  //
  //   // Primary Behavior
  //   case 'primary':
  //     _this.master.executor(transaction, (lookups) => {
  //       _this.handleUpdates(lookups, shareData, shareType, minerType, () => {
  //         if (blockValid) _this.handlePrimary(lookups, shareData, shareType, minerType, () => callback());
  //         else callback();
  //       });
  //     });
  //     break;
  //
  //   // Auxiliary Behavior
  //   case 'auxiliary':
  //     _this.master.executor(transaction, (lookups) => {
  //       _this.handleUpdates(lookups, shareData, shareType, minerType, () => {
  //         if (blockValid) _this.handleAuxiliary(lookups, shareData, shareType, minerType, () => callback());
  //         else callback();
  //       });
  //     });
  //     break;
  //
  //   // Share Behavior
  //   case 'share':
  //     _this.master.executor(transaction, (lookups) => {
  //       _this.handleUpdates(lookups, shareData, shareType, minerType, () => {
  //         callback();
  //       });
  //     });
  //     break;
  //
  //   // Default Behavior
  //   default:
  //     callback();
  //     break;
  //   }
  // };

  // Handle Share/Block Updates
  this.handleShares = function(shares, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Separate into Segments
    let current = [];
    const segments = [];
    shares.forEach((share) => {
      current.push(share);
      if (share.blockType !== 'share') {
        segments.push(current);
        current = [];
      }
    });

    // Handle Batch Logic
    segments.push(current);
    console.log(segments);
  };

  // Handle Share/Block Batches
  this.handleBatches = function(lookups, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Build Checks for Each Block
    const checks = [];
    if (lookups[1].rows[0]) {
      lookups[1].rows.forEach((share) => {
        checks.push({ timestamp: Date.now(), uuid: share.uuid, type: share.blocktype });
      });
    }

    // Add Checks to Transactions Table
    if (checks.length >= 1) {
      transaction.push(_this.worker.local.transactions.insertLocalTransactionsMain(_this.pool, checks));
    }

    // Determine Specific Shares for Each Thread
    transaction.push('COMMIT;');
    _this.worker.executor(transaction, (results) => {
      results = results[1].rows.map((share) => share.uuid);
      const shares = lookups[1].rows.filter((share) => results.includes((share || {}).uuid));

      // Shares Exist to Validate
      if (shares.length >= 1) {
        _this.handleShares(shares, (error) => {
          const updates = [(error) ?
            _this.text.databaseCommandsText2(JSON.stringify(error)) :
            _this.text.databaseUpdatesText6(shares.length)];
          _this.logger.debug('Shares', _this.config.name, updates);
          callback();
        });

      // No Blocks Exist to Validate
      } else {
        const updates = [_this.text.databaseUpdatesText7()];
        _this.logger.debug('Shares', _this.config.name, updates);
        callback();
      }
    });
  };

  // Handle Rounds Updates
  this.handleRounds = function(callback) {

    // Handle Initial Logging
    const starting = [_this.text.databaseStartingText4()];
    _this.logger.log('Rounds', _this.config.name, starting);

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.worker.local.shares.selectLocalSharesMain(_this.pool, { limit: 100 }),
      'COMMIT;'];

    // Establish Separate Behavior
    _this.worker.executor(transaction, (lookups) => {
      _this.handleBatches(lookups, callback);
    });
  };

  // Start Rounds Interval Management
  /* istanbul ignore next */
  this.handleInterval = function() {
    const minInterval = _this.config.settings.interval.rounds * 0.75;
    const maxInterval = _this.config.settings.interval.rounds * 1.25;
    const random = Math.floor(Math.random() * (maxInterval - minInterval) + minInterval);
    setTimeout(() => {
      _this.handleInterval();
      _this.handleRounds(() => {});
    }, random);
  };

  // Start Rounds Capabilities
  /* istanbul ignore next */
  this.setupRounds = function(callback) {
    _this.handleInterval();
    callback();
  };
};

module.exports = Rounds;
