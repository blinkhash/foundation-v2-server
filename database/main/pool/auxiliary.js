const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolAuxiliary = function (logger, configMain) {

  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectPoolAuxiliaryMiner = function(pool, miner) {
    return `
      SELECT * FROM "${ pool }".pool_auxiliary
      WHERE miner = '${ miner }'`;
  };

  // Select Rows Using Worker
  this.selectPoolAuxiliaryWorker = function(pool, worker) {
    return `
      SELECT * FROM "${ pool }".pool_auxiliary
      WHERE worker = '${ worker }'`;
  };

  // Select Rows Using Identifier
  this.selectPoolAuxiliaryIdentifier = function(pool, identifier) {
    return `
      SELECT * FROM "${ pool }".pool_auxiliary
      WHERE identifier = '${ identifier }'`;
  };

  // Select Rows Using Current Round
  this.selectPoolAuxiliaryRoundCurrent = function(pool, solo) {
    return `
      SELECT * FROM "${ pool }".pool_auxiliary
      WHERE solo = ${ solo } AND height = -1`;
  };

  // Insert Rows Using Worker
  this.insertPoolAuxiliaryRoundCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_auxiliary (
        timestamp, miner, worker,
        height, identifier, invalid,
        solo, stale, times, valid,
        work)
      VALUES (
        ${ updates.timestamp },
        '${ updates.miner }',
        '${ updates.worker }',
        ${ updates.height },
        '${ updates.identifier }',
        ${ updates.invalid },
        ${ updates.solo },
        ${ updates.stale },
        ${ updates.times },
        ${ updates.valid },
        ${ updates.work })
      ON CONFLICT ON CONSTRAINT pool_auxiliary_unique
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        invalid = "${ pool }".pool_auxiliary.invalid + ${ updates.invalid },
        stale = "${ pool }".pool_auxiliary.stale + ${ updates.stale },
        times = ${ updates.times },
        valid = "${ pool }".pool_auxiliary.valid + ${ updates.valid },
        work = "${ pool }".pool_auxiliary.work + ${ updates.work };`;
  };

  // Select Rows Using Specific Round
  this.selectPoolAuxiliaryRoundSpecific = function(pool, solo, height) {
    return `
      SELECT * FROM "${ pool }".pool_auxiliary
      WHERE solo = ${ solo } AND height = ${ height }`;
  };

  // Select Rows Using Historical Data
  this.selectPoolAuxiliaryHistorical = function(pool, worker, solo) {
    return `
      SELECT * FROM "${ pool }".pool_auxiliary
      WHERE worker = '${ worker }' AND solo = ${ solo }`;
  };

  // Select Rows Using Current Combined Data
  this.selectPoolAuxiliaryCombinedCurrent = function(pool, worker, solo) {
    return `
      SELECT * FROM "${ pool }".pool_auxiliary
      WHERE worker = '${ worker }' AND solo = ${ solo } AND height = -1`;
  };

  // Select Rows Using Current Specific Data
  this.selectPoolAuxiliaryCombinedSpecific = function(pool, worker, solo, height) {
    return `
      SELECT * FROM "${ pool }".pool_auxiliary
      WHERE worker = '${ worker }' AND solo = ${ solo } AND height = ${ height }`;
  };
};

module.exports = PoolAuxiliary;
