const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolRounds = function (logger, configMain) {

  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectPoolRoundsMiner = function(pool, miner, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Rows Using Worker
  this.selectPoolRoundsWorker = function(pool, worker, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE worker = '${ worker }' AND type = '${ type }';`;
  };

  // Select Rows Using Identifier
  this.selectPoolRoundsIdentifier = function(pool, identifier, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE identifier = '${ identifier } AND type = '${ type }';`;
  };

  // Select Rows Using Current Round
  this.selectPoolRoundsCurrent = function(pool, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE solo = ${ solo } AND round = 'current' AND type = '${ type }';`;
  };

  // Select Rows Using Specific Round
  this.selectPoolRoundsSpecific = function(pool, solo, round, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE solo = ${ solo } AND round = '${ round }'
      AND type = '${ type }';`;
  };

  // Select Rows Using Historical Data
  this.selectPoolRoundsHistorical = function(pool, worker, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE worker = '${ worker }' AND solo = ${ solo }
      AND type = '${ type }';`;
  };

  // Select Rows Using Current Combined Data
  this.selectPoolRoundsCombinedCurrent = function(pool, worker, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE worker = '${ worker }' AND solo = ${ solo }
      AND round = 'current' AND type = '${ type }';`;
  };

  // Select Rows Using Current Specific Data
  this.selectPoolRoundsCombinedSpecific = function(pool, worker, solo, round, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE worker = '${ worker }' AND solo = ${ solo }
      AND round = '${ round }' AND type = '${ type }';`;
  };

  // Insert Rows Using Worker
  this.insertPoolRoundsCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_rounds (
        timestamp, miner, worker,
        round, identifier, invalid,
        solo, stale, times, type,
        valid, work)
      VALUES (
        ${ updates.timestamp },
        '${ updates.miner }',
        '${ updates.worker }',
        '${ updates.round }',
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

  // Update Rows Using Round
  this.updatePoolRoundsCurrentSolo = function(pool, miner, round, type) {
    return `
      UPDATE "${ pool }".pool_rounds
      SET round = '${ round }'
      WHERE round = 'current' AND miner = '${ miner }'
      AND solo = true AND type = '${ type }';`;
  };

  // Update Rows Using Round
  this.updatePoolRoundsCurrentShared = function(pool, round, type) {
    return `
      UPDATE "${ pool }".pool_rounds
      SET round = '${ round }'
      WHERE round = 'current' AND solo = false
      AND type = '${ type }';`;
  };
};

module.exports = PoolRounds;
