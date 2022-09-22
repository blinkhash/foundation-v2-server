const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolWorkers = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Pool Parameters
  this.numbers = ['timestamp', 'efficiency', 'effort', 'hashrate'];
  this.strings = ['miner', 'worker', 'type'];
  this.parameters = ['timestamp', 'miner', 'worker', 'efficiency', 'effort', 'hashrate', 'type'];

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

  // Select Pool Workers Using Parameters
  this.selectPoolWorkersCurrent = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".pool_workers`;
    const filtered = Object.keys(parameters).filter((key) => _this.parameters.includes(key));
    filtered.forEach((parameter, idx) => {
      if (idx === 0) output += ' WHERE ';
      else output += ' AND ';
      output += `${ parameter }`;
      output += _this.handleQueries(parameters, parameter);
    });
    return output + ';';
  };

  // Build Workers Values String
  this.buildPoolWorkersHashrate = function(updates) {
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
  this.insertPoolWorkersHashrate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES ${ _this.buildPoolWorkersHashrate(updates) }
      ON CONFLICT ON CONSTRAINT pool_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
  };

  // Build Workers Values String
  this.buildPoolWorkersRounds = function(updates) {
    let values = '';
    updates.forEach((worker, idx) => {
      values += `(
        ${ worker.timestamp },
        '${ worker.miner }',
        '${ worker.worker }',
        ${ worker.efficiency },
        ${ worker.effort },
        ${ worker.solo },
        '${ worker.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Round Data
  this.insertPoolWorkersRounds = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_workers (
        timestamp, miner, worker,
        efficiency, effort, solo,
        type)
      VALUES ${ _this.buildPoolWorkersRounds(updates) }
      ON CONFLICT ON CONSTRAINT pool_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        solo = EXCLUDED.solo;`;
  };

  // Delete Rows From Current Round
  this.deletePoolWorkersInactive = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".pool_workers
      WHERE timestamp < ${ timestamp };`;
  };
};

module.exports = PoolWorkers;
