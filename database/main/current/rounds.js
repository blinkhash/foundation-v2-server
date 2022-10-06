const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const CurrentRounds = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Current Parameters
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
    if (query.slice(0, 2) === 'lt') return ` < ${ query.replace('lt', '') }`;
    if (query.slice(0, 2) === 'le') return ` <= ${ query.replace('le', '') }`;
    if (query.slice(0, 2) === 'gt') return ` > ${ query.replace('gt', '') }`;
    if (query.slice(0, 2) === 'ge') return ` >= ${ query.replace('ge', '') }`;
    if (query.slice(0, 2) === 'ne') return ` != ${ query.replace('ne', '') }`;
    else return ` = ${ query }`;
  };

  // Handle Query Parameters
  /* istanbul ignore next */
  this.handleQueries = function(parameters, parameter) {
    if (_this.numbers.includes(parameter)) return _this.handleNumbers(parameters, parameter);
    if (_this.strings.includes(parameter)) return _this.handleStrings(parameters, parameter);
    else return ` = ${ parameters[parameter] }`;
  };

  // Handle Special Parameters
  this.handleSpecial = function(parameters, output) {
    if (parameters.order || parameters.direction) {
      output += ` ORDER BY ${ parameters.order || 'id' }`;
      output += ` ${ parameters.direction === 'ascending' ? 'ASC' : 'DESC' }`;
    }
    if (parameters.limit) output += ` LIMIT ${ parameters.limit }`;
    if (parameters.offset) output += ` OFFSET ${ parameters.offset }`;
    return output;
  };

  // Select Current Rounds Using Parameters
  this.selectCurrentRoundsMain = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".current_rounds`;
    const filtered = Object.keys(parameters).filter((key) => _this.parameters.includes(key));
    filtered.forEach((parameter, idx) => {
      if (idx === 0) output += ' WHERE ';
      else output += ' AND ';
      output += `${ parameter }`;
      output += _this.handleQueries(parameters, parameter);
    });
    output = _this.handleSpecial(parameters, output);
    return output + ';';
  };

  // Build Rounds Values String
  this.buildCurrentRoundsMain = function(updates) {
    let values = '';
    updates.forEach((round, idx) => {
      values += `(
        ${ round.timestamp },
        ${ round.recent },
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
  this.insertCurrentRoundsMain = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".current_rounds (
        timestamp, recent, miner,
        worker, identifier, invalid,
        round, solo, stale, times,
        type, valid, work)
      VALUES ${ _this.buildCurrentRoundsMain(updates) }
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "${ pool }".current_rounds.invalid + EXCLUDED.invalid,
        stale = "${ pool }".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("${ pool }".current_rounds.times, EXCLUDED.times),
        valid = "${ pool }".current_rounds.valid + EXCLUDED.valid,
        work = "${ pool }".current_rounds.work + EXCLUDED.work;`;
  };

  // Update Rows Using Round
  this.updateCurrentRoundsMainSolo = function(pool, miner, round, type) {
    return `
      UPDATE "${ pool }".current_rounds
      SET round = '${ round }'
      WHERE round = 'current' AND miner = '${ miner }'
      AND solo = true AND type = '${ type }';`;
  };

  // Update Rows Using Round
  this.updateCurrentRoundsMainShared = function(pool, round, type) {
    return `
      UPDATE "${ pool }".current_rounds
      SET round = '${ round }'
      WHERE round = 'current' AND solo = false
      AND type = '${ type }';`;
  };

  // Delete Rows From Current Round
  this.deleteCurrentRoundsInactive = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".current_rounds
      WHERE round = 'current' AND timestamp < ${ timestamp };`;
  };

  // Delete Rows From Current Round
  this.deleteCurrentRoundsMain = function(pool, rounds) {
    return `
      DELETE FROM "${ pool }".current_rounds
      WHERE round IN (${ rounds.join(', ') });`;
  };
};

module.exports = CurrentRounds;
