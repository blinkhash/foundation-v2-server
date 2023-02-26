const Text = require('../../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const CurrentWorkers = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Current Parameters
  this.numbers = ['timestamp', 'efficiency', 'effort', 'hashrate', 'invalid', 'stale', 'valid'];
  this.strings = ['miner', 'worker', 'type'];
  this.parameters = ['timestamp', 'miner', 'worker', 'efficiency', 'effort', 'hashrate', 'invalid',
    'solo', 'stale', 'type', 'valid'];

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

  // Select Current Workers Using Parameters
  this.selectCurrentWorkersMain = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".current_workers`;
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

  // Build Workers Values String
  this.buildCurrentWorkersHashrate = function(updates) {
    let values = '';
    updates.forEach((worker, idx) => {
      values += `(
        ${ worker.timestamp },
        '${ worker.miner }',
        '${ worker.worker }',
        ${ worker.hashrate },
        ${ worker.solo },
        '${ worker.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Hashrate Data
  this.insertCurrentWorkersHashrate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".current_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES ${ _this.buildCurrentWorkersHashrate(updates) }
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
  };

  // Build Workers Values String
  this.buildCurrentWorkersRounds = function(updates) {
    let values = '';
    updates.forEach((worker, idx) => {
      values += `(
        ${ worker.timestamp },
        '${ worker.miner }',
        '${ worker.worker }',
        ${ worker.efficiency },
        ${ worker.effort },
        ${ worker.invalid },
        ${ worker.solo },
        ${ worker.stale },
        '${ worker.type }',
        ${ worker.valid })`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Round Data
  this.insertCurrentWorkersRounds = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".current_workers (
        timestamp, miner, worker,
        efficiency, effort, invalid,
        solo, stale, type, valid)
      VALUES ${ _this.buildCurrentWorkersRounds(updates) }
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "${ pool }".current_workers.invalid + EXCLUDED.invalid,
        solo = EXCLUDED.solo,
        stale = "${ pool }".current_workers.stale + EXCLUDED.stale,
        valid = "${ pool }".current_workers.valid + EXCLUDED.valid;`;
  };

  // Delete Rows From Current Round
  this.deleteCurrentWorkersInactive = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".current_workers
      WHERE timestamp < ${ timestamp };`;
  };
};

module.exports = CurrentWorkers;
