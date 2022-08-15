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

  // Handle Efficiency Updates
  this.handleEfficiency = function(poolData, shareType) {
    const valid = shareType === 'valid' ? poolData.valid + 1 : poolData.valid;
    const total = poolData.valid + poolData.stale + poolData.invalid + 1;
    return (valid / total) * 100;
  };

  // Handle Effort Updates
  this.handleEffort = function(poolData, workerData, shareData, shareType, minerType, difficulty) {
    const workerWork = minerType ? workerData.work : poolData.work;
    const work = shareType === 'valid' ? workerWork + shareData.difficulty : workerWork;
    return (work / difficulty) * 100;
  };

  // Handle Times Updates
  this.handleTimes = function(sharePrevious) {
    let times = sharePrevious.times || 0;
    const lastTime = sharePrevious.timestamp || Date.now();
    const timeChange = utils.roundTo(Math.max(Date.now() - lastTime, 0) / 1000, 4);
    if (timeChange < 900) times = times + timeChange;
    return times;
  };

  // Handle Auxiliary Updates
  this.handleAuxiliary = function(poolData, shareData, shareType, minerType, callback) {

    const worker = shareData.addrAuxiliary;
    const difficulty = shareData.blockDiffAuxiliary;

    // Calculate Features of Submitted Share
    const shareInvalid = shareType === 'invalid' ? 1 : 0;
    const shareStale = shareType === 'stale' ? 1 : 0;
    const shareValid = shareType === 'valid' ? 1 : 0;
    const shareWork = shareType === 'valid' ? shareData.difficulty : -shareData.difficulty;

    // Calculate Features of Metadata
    const poolEfficiency = _this.handleEfficiency(poolData, shareType);
    const poolInvalid = minerType ? 0 : shareInvalid;
    const poolStale = minerType ? 0 : shareStale;
    const poolValid = minerType ? 0 : shareValid;
    const poolWork = minerType ? 0 : shareWork;

    // Build Database Commands
    const executor = _this.client.commands.executor;
    const metadata = _this.client.commands.pool.metadata;
    const auxiliary = _this.client.commands.pool.auxiliary;
    const commands = [auxiliary.selectPoolAuxiliaryCombinedCurrent(_this.pool, worker, minerType)];

    // Handle Database Updates
    executor(commands, (results) => {

      // Handle Initial Share Updates
      const shareUpdates = {
        timestamp: Date.now(),
        miner: worker.split('.')[0],
        worker: worker,
        height: -1,
        identifier: shareData.identifier || 'master',
        invalid: shareInvalid,
        solo: minerType,
        stale: shareStale,
        times: 0,
        valid: shareValid,
        work: shareWork,
      };

      // Handle Metadata Updates
      const metadataUpdates = {
        timestamp: Date.now(),
        efficiency: poolEfficiency,
        effort: 0,
        invalid: poolInvalid,
        stale: poolStale,
        valid: poolValid,
        work: poolWork,
      };

      // Handle Specific Updates
      shareUpdates.times = 0;
      if (results.rows.length >= 1 && shareType === 'valid') {
        shareUpdates.times = _this.handleTimes(results.rows[0]);
      }

      // Handle Effort Updates
      metadataUpdates.effort = _this.handleEffort(
        poolData, results, shareData, shareType, minerType, difficulty);

      // Build Update Transaction
      const transaction = [
        'BEGIN;',
        auxiliary.insertPoolAuxiliaryRoundCurrent(_this.pool, shareUpdates),
        metadata.insertPoolMetadataRoundUpdate(_this.pool, metadataUpdates),
        'COMMIT;'];

      // Insert Work into Database
      executor(transaction, () => callback());
    });
  };

  // Handle Primary Updates
  this.handlePrimary = function(poolData, shareData, shareType, minerType, callback) {

    const worker = shareData.addrPrimary;
    const difficulty = shareData.blockDiffPrimary;

    // Calculate Features of Submitted Share
    const shareInvalid = shareType === 'invalid' ? 1 : 0;
    const shareStale = shareType === 'stale' ? 1 : 0;
    const shareValid = shareType === 'valid' ? 1 : 0;
    const shareWork = shareType === 'valid' ? shareData.difficulty : -shareData.difficulty;

    // Calculate Features of Metadata
    const poolEfficiency = _this.handleEfficiency(poolData, shareType);
    const poolInvalid = minerType ? 0 : shareInvalid;
    const poolStale = minerType ? 0 : shareStale;
    const poolValid = minerType ? 0 : shareValid;
    const poolWork = minerType ? 0 : shareWork;

    // Build Database Commands
    const executor = _this.client.commands.executor;
    const metadata = _this.client.commands.pool.metadata;
    const primary = _this.client.commands.pool.primary;
    const commands = [primary.selectPoolPrimaryCombinedCurrent(_this.pool, worker, minerType)];

    // Handle Database Updates
    executor(commands, (results) => {

      // Handle Initial Share Updates
      const shareUpdates = {
        timestamp: Date.now(),
        miner: worker.split('.')[0],
        worker: worker,
        height: -1,
        identifier: shareData.identifier || 'master',
        invalid: shareInvalid,
        solo: minerType,
        stale: shareStale,
        times: 0,
        valid: shareValid,
        work: shareWork,
      };

      // Handle Metadata Updates
      const metadataUpdates = {
        timestamp: Date.now(),
        efficiency: poolEfficiency,
        effort: 0,
        invalid: poolInvalid,
        stale: poolStale,
        valid: poolValid,
        work: poolWork,
      };

      // Handle Times Updates
      if (results.rows.length >= 1 && shareType === 'valid') {
        shareUpdates.times = _this.handleTimes(results.rows[0]);
      }

      // Handle Effort Updates
      metadataUpdates.effort = _this.handleEffort(
        poolData, results, shareData, shareType, minerType, difficulty);

      // Build Update Transaction
      const transaction = [
        'BEGIN;',
        primary.insertPoolPrimaryRoundCurrent(_this.pool, shareUpdates),
        metadata.insertPoolMetadataRoundUpdate(_this.pool, metadataUpdates),
        'COMMIT;'];

      // Insert Work into Database
      executor(transaction, () => callback());
    });
  };

  // Handle Share Submissions
  this.handleSubmissions = function(shareData, shareValid) {

    // Calculate Share Type
    let shareType = 'valid';
    if (shareData.error && shareData.error === 'job not found') shareType = 'stale';
    else if (!shareValid || shareData.error) shareType = 'invalid';

    // Calculate Share Features
    const minerType = utils.checkSoloMining(_this.config, shareData);
    const blockType = ['share', 'primary'].includes(shareData.blockType) ? 'primary' : 'auxiliary';

    // Build Database Commands
    const executor = _this.client.commands.executor;
    const metadata = _this.client.commands.pool.metadata;
    const handler = blockType === 'primary' ? _this.handlePrimary : _this.handleAuxiliary;
    const commands = [metadata.selectPoolMetadataCurrent(_this.pool)];

    // Handle Database Updates
    executor(commands, (results) => {
      const poolData = results.rows[0] || {};
      handler(poolData, shareData, shareType, minerType, () => {});
    });
  };
};

module.exports = Shares;
