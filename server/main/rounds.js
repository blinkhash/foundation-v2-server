const Text = require('../../locales/index');
const async = require('async');
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
  this.handleEfficiency = function(round, shareType) {
    const valid = shareType === 'valid' ? (round.valid || 0) + 1 : (round.valid || 0);
    const total = (round.valid || 0) + (round.stale || 0) + (round.invalid || 0) + 1;
    return Math.round(((valid / total) || 0) * 10000) / 100;
  };

  // Handle Effort Updates
  this.handleEffort = function(share, difficulty, work, shareType) {
    const total = shareType === 'valid' ? (work + (share.clientdiff || 0)) : work;
    return Math.round(((total / difficulty) || 0) * 10000) / 100;
  };

  // Handle Times Updates
  this.handleTimes = function(sharePrevious, timestamp) {
    let times = sharePrevious.times || 0;
    const lastTime = parseFloat(sharePrevious.submitted) || Date.now();
    const timeChange = utils.roundTo(Math.max(timestamp - lastTime, 0) / 1000, 4);
    if (timeChange < 900) times += timeChange;
    return Math.round(times * 10000) / 10000;
  };

  // Process Segment Breakdown
  this.processSegments = function(shares) {
    let current = [];
    const segments = [];
    shares.forEach((share) => {
      if (share.blocktype !== 'share') {
        if (current.length >= 1) segments.push(current);
        segments.push([share]);
        current = [];
      } else current.push(share);
    });
    if (current.length >= 1) segments.push(current);
    return segments;
  };

  // Handle Miners Processing
  this.handleMinersLookups = function(round) {
    const miners = {};
    round.forEach((snapshot) => miners[snapshot.miner] = snapshot);
    return miners;
  };

  // Handle Workers Processing
  this.handleWorkersLookups = function(round) {
    const workers = {};
    round.forEach((snapshot) => workers[snapshot.worker] = snapshot);
    return workers;
  };

  // Handle Blocks Updates
  this.handleCurrentBlocks = function(metadata, round, share, shareType, minerType, blockType) {

    // Calculate Features of Blocks
    const identifier = share.identifier || 'master';
    const difficulty = blockType === 'primary' ? share.blockdiffprimary : share.blockdiffauxiliary;
    const worker = blockType === 'primary' ? share.addrprimary : share.addrauxiliary;
    const work = minerType ? (round.work || 0) : (metadata.work || 0);

    // Calculate Luck for Block
    const luck = _this.handleEffort(share, difficulty, work, shareType);

    // Return Blocks Updates
    return {
      timestamp: Date.now(),
      submitted: Date.now(),
      miner: (worker || '').split('.')[0],
      worker: worker,
      category: 'pending',
      confirmations: -1,
      difficulty: difficulty,
      hash: share.hash,
      height: share.height,
      identifier: identifier,
      luck: luck,
      reward: 0,
      round: uuid.v4(),
      solo: minerType,
      transaction: share.transaction,
      type: blockType,
    };
  };

  // Handle Hashrate Updates
  this.handleCurrentHashrate = function(share, shareType, minerType, blockType) {

    // Calculate Features of Hashrate
    const current = shareType === 'valid' ? share.clientdiff : 0;
    const identifier = share.identifier || 'master';
    const worker = blockType === 'primary' ? share.addrprimary : share.addrauxiliary;

    // Return Hashrate Updates
    return {
      timestamp: Date.now(),
      miner: (worker || '').split('.')[0],
      worker: worker,
      identifier: identifier,
      share: shareType,
      solo: minerType,
      type: blockType,
      work: current,
    };
  };

  // Handle Metadata Updates
  this.handleCurrentMetadata = function(initial, updates, share, shareType, blockType) {

    // Calculate Features of Metadata
    const invalid = (updates.invalid || 0) + (shareType === 'invalid' ? 1 : 0);
    const stale = (updates.stale || 0) + (shareType === 'stale' ? 1 : 0);
    const valid = (updates.valid || 0) + (shareType === 'valid' ? 1 : 0);
    const current = (updates.work || 0) + (shareType === 'valid' ? share.clientdiff : 0);
    const difficulty = blockType === 'primary' ? share.blockdiffprimary : share.blockdiffauxiliary;
    const work = (initial.work || 0) + (updates.work || 0);

    // Calculate Efficiency/Effort Metadata
    const efficiency = _this.handleEfficiency(initial, shareType);
    const effort = _this.handleEffort(share, difficulty, work, shareType);

    // Return Metadata Updates
    return {
      timestamp: Date.now(),
      efficiency: efficiency,
      effort: effort,
      invalid: invalid,
      stale: stale,
      type: blockType,
      valid: valid,
      work: current,
    };
  };

  // Handle Miner Updates
  this.handleCurrentMiners = function(initial, updates, share, shareType, blockType) {

    // Calculate Features of Metadata
    const invalid = (updates.invalid || 0) + (shareType === 'invalid' ? 1 : 0);
    const stale = (updates.stale || 0) + (shareType === 'stale' ? 1 : 0);
    const valid = (updates.valid || 0) + (shareType === 'valid' ? 1 : 0);
    const current = (updates.work || 0) + (shareType === 'valid' ? share.clientdiff : 0);
    const difficulty = blockType === 'primary' ? share.blockdiffprimary : share.blockdiffauxiliary;
    const worker = blockType === 'primary' ? share.addrprimary : share.addrauxiliary;
    const work = (initial.work || 0) + (updates.work || 0);

    // Calculate Efficiency/Effort Metadata
    const efficiency = _this.handleEfficiency(initial, shareType);
    const effort = _this.handleEffort(share, difficulty, work, shareType);

    // Return Metadata Updates
    return {
      timestamp: Date.now(),
      miner: (worker || '').split('.')[0],
      efficiency: efficiency,
      effort: effort,
      invalid: invalid,
      stale: stale,
      type: blockType,
      valid: valid,
      work: current,
    };
  };

  // Handle Round Updates
  this.handleCurrentRounds = function(initial, updates, share, shareType, minerType, blockType) {

    // Calculate Timing Features
    const interval = _this.config.settings.interval.recent;
    const recent = minerType ? 0 : Math.round(share.timestamp / interval) * interval;

    // Calculate Features of Rounds [1]
    const invalid = (updates.invalid || 0) + (shareType === 'invalid' ? 1 : 0);
    const stale = (updates.stale || 0) + (shareType === 'stale' ? 1 : 0);
    const valid = (updates.valid || 0) + (shareType === 'valid' ? 1 : 0);
    const current = (updates.work || 0) + (shareType === 'valid' ? share.clientdiff : 0);
    const worker = blockType === 'primary' ? share.addrprimary : share.addrauxiliary;

    // Calculate Features of Rounds [2]
    const submitted = share.submitted || Date.now();
    const identifier = share.identifier || 'master';
    const times = (Object.keys(updates).length >= 1 && shareType === 'valid') ?
      _this.handleTimes(updates, submitted) : 0;

    // Return Round Updates
    return {
      timestamp: Date.now(),
      submitted: parseFloat(submitted),
      recent: recent,
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
  this.handleCurrentWorkers = function(initial, updates, share, shareType, minerType, blockType) {

    // Calculate Features of Metadata
    const invalid = (updates.invalid || 0) + (shareType === 'invalid' ? 1 : 0);
    const stale = (updates.stale || 0) + (shareType === 'stale' ? 1 : 0);
    const valid = (updates.valid || 0) + (shareType === 'valid' ? 1 : 0);
    const current = (updates.work || 0) + (shareType === 'valid' ? share.clientdiff : 0);
    const difficulty = blockType === 'primary' ? share.blockdiffprimary : share.blockdiffauxiliary;
    const worker = blockType === 'primary' ? share.addrprimary : share.addrauxiliary;
    const work = (initial.work || 0) + (updates.work || 0);

    // Calculate Efficiency/Effort Metadata
    const efficiency = _this.handleEfficiency(initial, shareType);
    const effort = _this.handleEffort(share, difficulty, work, shareType);

    // Return Metadata Updates
    return {
      timestamp: Date.now(),
      miner: (worker || '').split('.')[0],
      worker: worker,
      efficiency: efficiency,
      effort: effort,
      invalid: invalid,
      solo: minerType,
      stale: stale,
      type: blockType,
      valid: valid,
      work: current,
    };
  };

  // Handle Hashrate Updates
  this.handleHashrate = function(shares, blockType) {

    // Handle Individual Shares
    const updates = [];
    shares.forEach((share) => {

      // Calculate Share Features
      let shareType = 'valid';
      const minerType = utils.checkSoloMining(_this.config, share);
      if (share.error && share.error === 'job not found') shareType = 'stale';
      else if (!share.sharevalid || share.error) shareType = 'invalid';

      // Check If Share is Still Valid
      if (Date.now() - _this.config.settings.window.hashrate <= share.timestamp) {
        updates.push(_this.handleCurrentHashrate(share, shareType, minerType, blockType));
      }
    });

    // Return Hashrate Updates
    return updates;
  };

  // Handle Metadata Updates
  this.handleMetadata = function(metadata, shares, blockType) {

    // Handle Individual Shares
    let updates = {};
    shares.forEach((share) => {

      // Calculate Share Features
      let shareType = 'valid';
      if (share.error && share.error === 'job not found') shareType = 'stale';
      else if (!share.sharevalid || share.error) shareType = 'invalid';

      // Check If Metadata Should be Updated
      if (!utils.checkSoloMining(_this.config, share)) {
        updates = _this.handleCurrentMetadata(metadata, updates, share, shareType, blockType);
      }
    });

    // Return Metadata Updates
    return updates;
  };

  // Handle Miner Updates
  this.handleMiners = function(miners, shares, blockType) {

    // Handle Individual Shares
    const updates = {};
    shares.forEach((share) => {

      // Calculate Share Features
      let shareType = 'valid';
      const worker = blockType === 'primary' ? share.addrprimary : share.addrauxiliary;
      if (share.error && share.error === 'job not found') shareType = 'stale';
      else if (!share.sharevalid || share.error) shareType = 'invalid';

      // Determine Current Miner States
      const miner = (worker || '').split('.')[0];
      const initial = miners[miner] || {};
      const current = updates[miner] || {};

      // Determine Updates for Miner
      updates[miner] = _this.handleCurrentMiners(initial, current, share, shareType, blockType);
    });

    // Return Miner Updates
    return Object.values(updates);
  };

  // Handle Share Updates
  this.handleShares = function(rounds, shares, blockType) {

    // Handle Individual Shares
    const updates = {};
    shares.forEach((share) => {

      // Calculate Share Features
      let shareType = 'valid';
      const minerType = utils.checkSoloMining(_this.config, share);
      const worker = blockType === 'primary' ? share.addrprimary : share.addrauxiliary;
      if (share.error && share.error === 'job not found') shareType = 'stale';
      else if (!share.sharevalid || share.error) shareType = 'invalid';

      // Determine Current Round States
      const interval = _this.config.settings.interval.recent;
      const recent = minerType ? 0 : Math.round(share.timestamp / interval) * interval;
      const initial = rounds[worker] || {};
      const current = updates[`${ worker }_${ recent }_${ minerType }`] || {};

      const segment = _this.handleCurrentRounds(initial, current, share, shareType, minerType, blockType);
      updates[`${ worker }_${ segment.recent }_${ segment.solo }`] = segment;
    });

    // Return Round Updates
    return Object.values(updates);
  };

  // Handle Worker Updates
  this.handleWorkers = function(workers, shares, blockType) {

    // Handle Individual Shares
    const updates = {};
    shares.forEach((share) => {

      // Calculate Share Features
      let shareType = 'valid';
      const minerType = utils.checkSoloMining(_this.config, share);
      const worker = blockType === 'primary' ? share.addrprimary : share.addrauxiliary;
      if (share.error && share.error === 'job not found') shareType = 'stale';
      else if (!share.sharevalid || share.error) shareType = 'invalid';

      // Determine Current Worker States
      const initial = workers[worker] || {};
      const current = updates[worker] || {};

      // Determine Updates for Worker
      updates[worker] = _this.handleCurrentWorkers(initial, current, share, shareType, minerType, blockType);
    });

    // Return Worker Updates
    return Object.values(updates);
  };

  // Handle Local Share/Transactions Cleanup
  this.handleCleanup = function(segment, callback) {

    // Build Combined Transaction
    const segmentDelete = segment.map((share) => `'${ share.uuid }'`);
    const transaction = [
      'BEGIN;',
      _this.worker.local.shares.deleteLocalSharesMain(_this.pool, segmentDelete),
      _this.worker.local.transactions.deleteLocalTransactionsMain(_this.pool, segmentDelete),
      'COMMIT;'];

    // Insert Work into Database
    _this.master.executor(transaction, () => callback());
  };

  // Handle Round Updates
  this.handleUpdates = function(lookups, shares, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Handle Metadata Lookups
    const metadata = lookups[1].rows[0] || {};
    const auxMetadata = lookups[2].rows[0] || {};

    // Handle Individual Lookups
    const miners = _this.handleMinersLookups(lookups[3].rows);
    const auxMiners = _this.handleMinersLookups(lookups[4].rows);
    const rounds = _this.handleWorkersLookups(lookups[5].rows);
    const auxRounds = _this.handleWorkersLookups(lookups[6].rows);
    const workers = _this.handleWorkersLookups(lookups[7].rows);
    const auxWorkers = _this.handleWorkersLookups(lookups[8].rows);

    // Handle Hashrate Updates
    const hashrateUpdates = _this.handleHashrate(shares, 'primary');
    if (hashrateUpdates.length >= 1) {
      transaction.push(_this.master.current.hashrate.insertCurrentHashrateMain(_this.pool, hashrateUpdates));
      if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
        const auxHashrateUpdates = _this.handleHashrate(shares, 'auxiliary');
        transaction.push(_this.master.current.hashrate.insertCurrentHashrateMain(_this.pool, auxHashrateUpdates));
      }
    }

    // Handle Metadata Updates
    const metadataUpdates = _this.handleMetadata(metadata, shares, 'primary');
    if (Object.keys(metadataUpdates).length >= 1) {
      transaction.push(_this.master.current.metadata.insertCurrentMetadataRounds(_this.pool, [metadataUpdates]));
      if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
        const auxMetadataUpdates = _this.handleMetadata(auxMetadata, shares, 'auxiliary');
        transaction.push(_this.master.current.metadata.insertCurrentMetadataRounds(_this.pool, [auxMetadataUpdates]));
      }
    }

    // Handle Miner Updates
    const minerUpdates = _this.handleMiners(miners, shares, 'primary');
    if (minerUpdates.length >= 1) {
      transaction.push(_this.master.current.miners.insertCurrentMinersRounds(_this.pool, minerUpdates));
      if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
        const auxMinerUpdates = _this.handleMiners(auxMiners, shares, 'auxiliary');
        transaction.push(_this.master.current.miners.insertCurrentMinersRounds(_this.pool, auxMinerUpdates));
      }
    }

    // Handle Round Updates
    const roundUpdates = _this.handleShares(rounds, shares, 'primary');
    if (roundUpdates.length >= 1) {
      transaction.push(_this.master.current.rounds.insertCurrentRoundsMain(_this.pool, roundUpdates));
      if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
        const auxRoundUpdates = _this.handleShares(auxRounds, shares, 'auxiliary');
        transaction.push(_this.master.current.rounds.insertCurrentRoundsMain(_this.pool, auxRoundUpdates));
      }
    }

    // Handle Worker Updates
    const workerUpdates = _this.handleWorkers(workers, shares, 'primary');
    if (workerUpdates.length >= 1) {
      transaction.push(_this.master.current.workers.insertCurrentWorkersRounds(_this.pool, workerUpdates));
      if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
        const auxWorkerUpdates = _this.handleWorkers(auxWorkers, shares, 'auxiliary');
        transaction.push(_this.master.current.workers.insertCurrentWorkersRounds(_this.pool, auxWorkerUpdates));
      }
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.master.executor(transaction, () => callback());
  };

  // Handle Primary Blocks
  this.handlePrimary = function(lookups, shares, callback) {

    // Calculate Block Features
    const block = shares[0];
    const minerType = utils.checkSoloMining(_this.config, block);
    const miner = (block.addrprimary || '').split('.')[0];

    // Handle Individual Lookups
    const metadata = lookups[1].rows[0] || {};
    const rounds = _this.handleWorkersLookups(lookups[5].rows);
    const round = rounds[block.addrprimary] || {};

    // Determine Updates for Block
    const metadataBlocks = { timestamp: Date.now(), blocks: 1, type: 'primary' };
    const metadataReset = { timestamp: Date.now(), type: 'primary' };
    const blockUpdates = _this.handleCurrentBlocks(metadata, round, block, 'valid', minerType, 'primary');
    const roundUpdates = (minerType) ? (
      _this.master.current.rounds.updateCurrentRoundsMainSolo(_this.pool, miner, blockUpdates.round, 'primary')) : (
      _this.master.current.rounds.updateCurrentRoundsMainShared(_this.pool, blockUpdates.round, 'primary'));

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.master.current.blocks.insertCurrentBlocksMain(_this.pool, [blockUpdates]),
      _this.master.current.metadata.insertCurrentMetadataBlocks(_this.pool, [metadataBlocks]),
      _this.master.current.metadata.insertCurrentMetadataRoundsReset(_this.pool, [metadataReset]),
      roundUpdates,
      'COMMIT;'];

    // Insert Work into Database
    _this.master.executor(transaction, () => callback());
  };

  // Handle Auxiliary Blocks
  this.handleAuxiliary = function(lookups, shares, callback) {

    // Calculate Block Features
    const block = shares[0];
    const minerType = utils.checkSoloMining(_this.config, block);
    const miner = (block.addrauxiliary || '').split('.')[0];

    // Handle Individual Lookups
    const metadata = lookups[2].rows[0] || {};
    const rounds = _this.handleWorkersLookups(lookups[6].rows);
    const round = rounds[block.addrauxiliary] || {};

    // Determine Updates for Block
    const metadataBlocks = { timestamp: Date.now(), blocks: 1, type: 'auxiliary' };
    const metadataReset = { timestamp: Date.now(), type: 'auxiliary' };
    const blockUpdates = _this.handleCurrentBlocks(metadata, round, block, 'valid', minerType, 'auxiliary');
    const roundUpdates = (minerType) ? (
      _this.master.current.rounds.updateCurrentRoundsMainSolo(_this.pool, miner, blockUpdates.round, 'auxiliary')) : (
      _this.master.current.rounds.updateCurrentRoundsMainShared(_this.pool, blockUpdates.round, 'auxiliary'));

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.master.current.blocks.insertCurrentBlocksMain(_this.pool, [blockUpdates]),
      _this.master.current.metadata.insertCurrentMetadataBlocks(_this.pool, [metadataBlocks]),
      _this.master.current.metadata.insertCurrentMetadataRoundsReset(_this.pool, [metadataReset]),
      roundUpdates,
      'COMMIT;'];

    // Insert Work into Database
    _this.master.executor(transaction, () => callback());
  };

  // Handle Segment Batches
  this.handleSegments = function(segment, callback) {

    // Initialize Designators
    const addrPrimaryMiners = [];
    const addrAuxiliaryMiners = [];
    const addrPrimaryWorkers = [];
    const addrAuxiliaryWorkers = [];

    // Handle Individual Shares
    segment.forEach((share) => {
      const primaryMiner = `'${ (share.addrprimary || '').split('.')[0] }'`;
      const auxiliaryMiner = `'${ (share.addrauxiliary || '').split('.')[0] }'`;
      const primaryWorker = `'${ share.addrprimary }'`;
      const auxiliaryWorker = `'${ share.addrauxiliary }'`;

      // Handle Share Designations
      if (!(addrPrimaryMiners.includes(primaryMiner))) addrPrimaryMiners.push(primaryMiner);
      if (!(addrAuxiliaryMiners.includes(auxiliaryMiner))) addrAuxiliaryMiners.push(auxiliaryMiner);
      if (!(addrPrimaryWorkers.includes(primaryWorker))) addrPrimaryWorkers.push(primaryWorker);
      if (!(addrAuxiliaryWorkers.includes(auxiliaryWorker))) addrAuxiliaryWorkers.push(auxiliaryWorker);
    });

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.master.current.metadata.selectCurrentMetadataMain(_this.pool, { type: 'primary' }),
      _this.master.current.metadata.selectCurrentMetadataMain(_this.pool, { type: 'auxiliary' }),
      _this.master.current.miners.selectCurrentMinersBatchAddresses(_this.pool, addrPrimaryMiners, 'primary'),
      _this.master.current.miners.selectCurrentMinersBatchAddresses(_this.pool, addrAuxiliaryMiners, 'auxiliary'),
      _this.master.current.rounds.selectCurrentRoundsBatchAddresses(_this.pool, addrPrimaryWorkers, 'primary'),
      _this.master.current.rounds.selectCurrentRoundsBatchAddresses(_this.pool, addrAuxiliaryWorkers, 'auxiliary'),
      _this.master.current.workers.selectCurrentWorkersBatchAddresses(_this.pool, addrPrimaryWorkers, 'primary'),
      _this.master.current.workers.selectCurrentWorkersBatchAddresses(_this.pool, addrAuxiliaryWorkers, 'auxiliary'),
      'COMMIT;'];

    // Establish Separate Behavior
    switch ((segment[0] || {}).blocktype) {

    // Primary Behavior
    case 'primary':
      _this.master.executor(transaction, (lookups) => {
        _this.handleUpdates(lookups, segment, () => {
          if (segment[0].blockvalid) _this.handlePrimary(lookups, segment, () => {
            _this.handleCleanup(segment, () => callback());
          });
          else _this.handleCleanup(segment, () => callback());
        });
      });
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.master.executor(transaction, (lookups) => {
        _this.handleUpdates(lookups, segment, () => {
          if (segment[0].blockvalid) _this.handleAuxiliary(lookups, segment, () => {
            _this.handleCleanup(segment, () => callback());
          });
          else _this.handleCleanup(segment, () => callback());
        });
      });
      break;

    // Share Behavior
    case 'share':
      _this.master.executor(transaction, (lookups) => {
        _this.handleUpdates(lookups, segment, () => {
          _this.handleCleanup(segment, () => callback());
        });
      });
      break;

    // Default Behavior
    default:
      callback();
      break;
    }
  };

  // Handle Share/Block Batches
  /* istanbul ignore next */
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
      const segments = _this.processSegments(shares);

      // Segments Exist to Validate
      if (segments.length >= 1) {
        async.series(segments.map((segment) => {
          return (cb) => _this.handleSegments(segment, cb);
        }), (error) => {
          const updates = [(error) ?
            _this.text.databaseCommandsText2(JSON.stringify(error)) :
            _this.text.databaseUpdatesText6(shares.length)];
          _this.logger.debug('Rounds', _this.config.name, updates);
          callback();
        });

      // No Blocks Exist to Validate
      } else {
        const updates = [_this.text.databaseUpdatesText7()];
        _this.logger.debug('Rounds', _this.config.name, updates);
        callback();
      }
    });
  };

  // Handle Rounds Updates
  /* istanbul ignore next */
  this.handleRounds = function(callback) {

    // Handle Initial Logging
    const starting = [_this.text.databaseStartingText4()];
    _this.logger.debug('Rounds', _this.config.name, starting);

    // Build Combined Transaction
    const parameters = { order: 'submitted', direction: 'ascending', limit: 100 };
    const transaction = [
      'BEGIN;',
      _this.worker.local.shares.selectLocalSharesMain(_this.pool, parameters),
      'COMMIT;'];

    // Establish Separate Behavior
    _this.worker.executor(transaction, (lookups) => {
      _this.handleBatches(lookups, callback);
    });
  };

  // Start Rounds Interval Management
  /* istanbul ignore next */
  this.handleInterval = function() {
    const interval = _this.config.settings.interval.rounds;
    setTimeout(() => {
      _this.handleInterval();
      _this.handleRounds(() => {});
    }, interval);
  };

  // Start Rounds Capabilities
  /* istanbul ignore next */
  this.setupRounds = function(callback) {
    const interval = _this.config.settings.interval.rounds;
    const numForks = utils.countProcessForks(_this.configMain);
    const timing = parseFloat(_this.forkId) * interval / numForks;
    setTimeout(() => _this.handleInterval(), timing);
    callback();
  };
};

module.exports = Rounds;
