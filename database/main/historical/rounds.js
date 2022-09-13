const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const HistoricalRounds = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectHistoricalRoundsMiner = function(pool, miner, type) {
    return `
      SELECT * FROM "${ pool }".historical_rounds
      WHERE miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Rows Using Worker
  this.selectHistoricalRoundsWorker = function(pool, worker, type) {
    return `
      SELECT * FROM "${ pool }".historical_rounds
      WHERE worker = '${ worker }' AND type = '${ type }';`;
  };

  // Select Rows Using Identifier
  this.selectHistoricalRoundsIdentifier = function(pool, identifier, type) {
    return `
      SELECT * FROM "${ pool }".historical_rounds
      WHERE identifier = '${ identifier } AND type = '${ type }';`;
  };

  // Select Rows Using Specific Round
  this.selectHistoricalRoundsSpecific = function(pool, solo, round, type) {
    return `
      SELECT * FROM "${ pool }".historical_rounds
      WHERE solo = ${ solo } AND round = '${ round }'
      AND type = '${ type }';`;
  };

  // Select Rows Using Historical Data
  this.selectHistoricalRoundsHistorical = function(pool, worker, solo, type) {
    return `
      SELECT * FROM "${ pool }".historical_rounds
      WHERE worker = '${ worker }' AND solo = ${ solo }
      AND type = '${ type }';`;
  };

  // Select Rows Using Current Specific Data
  this.selectHistoricalRoundsCombinedSpecific = function(pool, worker, solo, round, type) {
    return `
      SELECT * FROM "${ pool }".historical_rounds
      WHERE worker = '${ worker }' AND solo = ${ solo }
      AND round = '${ round }' AND type = '${ type }';`;
  };

  // Build Rounds Values String
  this.buildHistoricalRoundsCurrent = function(updates) {
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
  this.insertHistoricalRoundsCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".historical_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES ${ _this.buildHistoricalRoundsCurrent(updates) }
      ON CONFLICT DO NOTHING;`;
  };
};

module.exports = HistoricalRounds;
