const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolRounds = function (logger, configMain) {

  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectPoolRoundMiner = function(pool, miner, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Rows Using Worker
  this.selectPoolRoundWorker = function(pool, worker, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE worker = '${ worker }' AND type = '${ type }';`;
  };

  // Select Rows Using Identifier
  this.selectPoolRoundIdentifier = function(pool, identifier, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE identifier = '${ identifier } AND type = '${ type }';`;
  };

  // Select Rows Using Current Round
  this.selectPoolRoundCurrent = function(pool, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE solo = ${ solo } AND height = -1 AND type = '${ type }';`;
  };

  // Insert Rows Using Worker
  this.insertPoolRoundCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_rounds (
        timestamp, miner, worker,
        height, identifier, invalid,
        solo, stale, times, type,
        valid, work)
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
        '${ updates.type }',
        ${ updates.valid },
        ${ updates.work })
      ON CONFLICT ON CONSTRAINT pool_rounds_unique
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        invalid = "${ pool }".pool_rounds.invalid + ${ updates.invalid },
        stale = "${ pool }".pool_rounds.stale + ${ updates.stale },
        times = ${ updates.times },
        valid = "${ pool }".pool_rounds.valid + ${ updates.valid },
        work = "${ pool }".pool_rounds.work + ${ updates.work };`;
  };

  // Select Rows Using Specific Round
  this.selectPoolRoundSpecific = function(pool, solo, height, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE solo = ${ solo } AND height = ${ height }
      AND type = '${ type }';`;
  };

  // Select Rows Using Historical Data
  this.selectPoolRoundHistorical = function(pool, worker, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE worker = '${ worker }' AND solo = ${ solo }
      AND type = '${ type }';`;
  };

  // Select Rows Using Current Combined Data
  this.selectPoolRoundCombinedCurrent = function(pool, worker, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE worker = '${ worker }' AND solo = ${ solo }
      AND height = -1 AND type = '${ type }';`;
  };

  // Select Rows Using Current Specific Data
  this.selectPoolRoundCombinedSpecific = function(pool, worker, solo, height, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE worker = '${ worker }' AND solo = ${ solo }
      AND height = ${ height } AND type = '${ type }';`;
  };
};

module.exports = PoolRounds;
