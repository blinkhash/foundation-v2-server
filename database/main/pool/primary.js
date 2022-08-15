const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolPrimary = function (logger, configMain) {

  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectPoolPrimaryMiner = function(pool, miner) {
    return `
      SELECT * FROM "${ pool }".pool_primary
      WHERE miner = '${ miner }'`;
  };

  // Select Rows Using Worker
  this.selectPoolPrimaryWorker = function(pool, worker) {
    return `
      SELECT * FROM "${ pool }".pool_primary
      WHERE worker = '${ worker }'`;
  };

  // Select Rows Using Identifier
  this.selectPoolPrimaryIdentifier = function(pool, identifier) {
    return `
      SELECT * FROM "${ pool }".pool_primary
      WHERE identifier = '${ identifier }'`;
  };

  // Select Rows Using Current Round
  this.selectPoolPrimaryRoundCurrent = function(pool, solo) {
    return `
      SELECT * FROM "${ pool }".pool_primary
      WHERE solo = ${ solo } AND height = -1`;
  };

  // Insert Rows Using Worker
  this.insertPoolPrimaryRoundCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_primary (
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
      ON CONFLICT ON CONSTRAINT pool_primary_unique
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        invalid = "${ pool }".pool_primary.invalid + ${ updates.invalid },
        stale = "${ pool }".pool_primary.stale + ${ updates.stale },
        times = ${ updates.times },
        valid = "${ pool }".pool_primary.valid + ${ updates.valid },
        work = "${ pool }".pool_primary.work + ${ updates.work };`;
  };

  // Select Rows Using Specific Round
  this.selectPoolPrimaryRoundSpecific = function(pool, solo, height) {
    return `
      SELECT * FROM "${ pool }".pool_primary
      WHERE solo = ${ solo } AND height = ${ height }`;
  };

  // Select Rows Using Historical Data
  this.selectPoolPrimaryHistorical = function(pool, worker, solo) {
    return `
      SELECT * FROM "${ pool }".pool_primary
      WHERE worker = '${ worker }' AND solo = ${ solo }`;
  };

  // Select Rows Using Current Combined Data
  this.selectPoolPrimaryCombinedCurrent = function(pool, worker, solo) {
    return `
      SELECT * FROM "${ pool }".pool_primary
      WHERE worker = '${ worker }' AND solo = ${ solo } AND height = -1`;
  };

  // Select Rows Using Current Specific Data
  this.selectPoolPrimaryCombinedSpecific = function(pool, worker, solo, height) {
    return `
      SELECT * FROM "${ pool }".pool_primary
      WHERE worker = '${ worker }' AND solo = ${ solo } AND height = ${ height }`;
  };
};

module.exports = PoolPrimary;
