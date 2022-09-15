const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolRounds = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectPoolRoundsMiner = function(pool, miner, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE miner = '${ miner }' AND solo = ${ solo }
      AND type = '${ type }';`;
  };

  // Select Rows Using Worker
  this.selectPoolRoundsWorker = function(pool, worker, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE worker = '${ worker }' AND solo = ${ solo }
      AND type = '${ type }';`;
  };

  // Select Rows Using Identifier
  this.selectPoolRoundsIdentifier = function(pool, identifier, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_rounds
      WHERE identifier = '${ identifier } AND solo = ${ solo }
      AND type = '${ type }';`;
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

  // Build Rounds Values String
  this.buildPoolRoundsCurrent = function(updates) {
    let values = '';
    updates.forEach((round, idx) => {
      values += `(
        ${ round.timestamp },
        '${ round.miner }',
        '${ round.worker }',
        '${ round.identifier }',
        ${ round.invalid },
        '${ round.round }',
        ${ round.solo },
        ${ round.stale },
        ${ round.times },
        '${ round.type }',
        ${ round.valid },
        ${ round.work })`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Round Data
  this.insertPoolRoundsCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES ${ _this.buildPoolRoundsCurrent(updates) }
      ON CONFLICT ON CONSTRAINT pool_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "${ pool }".pool_rounds.invalid + EXCLUDED.invalid,
        stale = "${ pool }".pool_rounds.stale + EXCLUDED.stale,
        times = GREATEST("${ pool }".pool_rounds.times, EXCLUDED.times),
        valid = "${ pool }".pool_rounds.valid + EXCLUDED.valid,
        work = "${ pool }".pool_rounds.work + EXCLUDED.work;`;
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

  // Delete Rows From Current Round
  this.deletePoolRoundsCurrent = function(pool, rounds) {
    return `
      DELETE FROM "${ pool }".pool_rounds
      WHERE round IN (${ rounds.join(', ') });`;
  };
};

module.exports = PoolRounds;
