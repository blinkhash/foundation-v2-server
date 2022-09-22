const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolHashrate = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Pool Parameters
  _this.numbers = ['timestamp', 'work'];
  _this.strings = ['miner', 'worker', 'type'];
  _this.parameters = ['timestamp', 'miner', 'worker', 'solo', 'type', 'work'];

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

  // Select Pool Hashrate Using Parameters
  this.selectPoolHashrateCurrent = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".pool_hashrate`;
    const filtered = Object.keys(parameters).filter((key) => _this.parameters.includes(key));
    filtered.forEach((parameter, idx) => {
      if (idx === 0) output += ' WHERE ';
      else output += ' AND ';
      output += `${ parameter }`;
      output += _this.handleQueries(parameters, parameter);
    });
    return output + ';';
  };

  // Select Count of Distinct Miners
  this.countPoolHashrateMiner = function(pool, timestamp, solo, type) {
    return `
      SELECT CAST(COUNT(DISTINCT miner) AS INT)
      FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND solo = ${ solo } AND type = '${ type }';`;
  };

  // Select Sum of Rows Using Miners
  this.sumPoolHashrateMiner = function(pool, timestamp, solo, type) {
    return `
      SELECT miner, SUM(work) as current_work
      FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND solo = ${ solo } AND type = '${ type }'
      GROUP BY miner;`;
  };

  // Select Count of Distinct Workers
  this.countPoolHashrateWorker = function(pool, timestamp, solo, type) {
    return `
      SELECT CAST(COUNT(DISTINCT worker) AS INT)
      FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND solo = ${ solo } AND type = '${ type }';`;
  };

  // Select Sum of Rows Using Workers
  this.sumPoolHashrateWorker = function(pool, timestamp, solo, type) {
    return `
      SELECT worker, SUM(work) as current_work
      FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND solo = ${ solo } AND type = '${ type }'
      GROUP BY worker;`;
  };

  // Select Sum of Rows Using Types
  this.sumPoolHashrateType = function(pool, timestamp, solo, type) {
    return `
      SELECT SUM(work) as current_work
      FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND solo = ${ solo } AND type = '${ type }';`;
  };

  // Build Hashrate Values String
  this.buildPoolHashrateCurrent = function(updates) {
    let values = '';
    updates.forEach((hashrate, idx) => {
      values += `(
        ${ hashrate.timestamp },
        '${ hashrate.miner }',
        '${ hashrate.worker }',
        ${ hashrate.solo },
        '${ hashrate.type }',
        ${ hashrate.work })`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Current Round
  this.insertPoolHashrateCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_hashrate (
        timestamp, miner, worker,
        solo, type, work)
      VALUES ${ _this.buildPoolHashrateCurrent(updates) };`;
  };

  // Delete Rows From Current Round
  this.deletePoolHashrateInactive = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".pool_hashrate
      WHERE timestamp < ${ timestamp };`;
  };
};

module.exports = PoolHashrate;
