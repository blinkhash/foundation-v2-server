const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolRounds = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Pool Parameters
  this.numbers = ['timestamp', 'invalid', 'stale', 'times', 'valid', 'work'];
  this.strings = ['miner', 'worker', 'identifier', 'round', 'type'];
  this.parameters = ['timestamp', 'miner', 'worker', 'identifier', 'invalid', 'round', 'solo',
    'stale', 'times', 'type', 'valid', 'work'];

  // Handle String Parameters
  this.handleStrings = function(parameters, parameter) {
    return ` = '${ parameters[parameter] }'`;
  };

  // Handle Numerical Parameters
  this.handleNumbers = function(parameters, parameter) {
    const query = parameters[parameter];
    if (query.includes('lt')) return ` < ${ query.replace('lt', '') }`;
    if (query.includes('le')) return ` <= ${ query.replace('le', '') }`;
    if (query.includes('gt')) return ` > ${ query.replace('gt', '') }`;
    if (query.includes('ge')) return ` >= ${ query.replace('ge', '') }`;
    if (query.includes('ne')) return ` != ${ query.replace('ne', '') }`;
    else return ` = ${ query }`;
  };

  // Handle Query Parameters
  /* istanbul ignore next */
  this.handleQueries = function(parameters, parameter) {
    if (_this.numbers.includes(parameter)) return _this.handleNumbers(parameters, parameter);
    if (_this.strings.includes(parameter)) return _this.handleStrings(parameters, parameter);
    else return ` = ${ parameters[parameter] }`;
  };

  // Select Pool Rounds Using Parameters
  this.selectPoolRoundsCurrent = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".pool_rounds`;
    const filtered = Object.keys(parameters).filter((key) => _this.parameters.includes(key));
    filtered.forEach((parameter, idx) => {
      if (idx === 0) output += ' WHERE ';
      else output += ' AND ';
      output += `${ parameter }`;
      output += _this.handleQueries(parameters, parameter);
    });
    return output + ';';
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
