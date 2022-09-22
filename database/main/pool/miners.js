const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolMiners = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Pool Parameters
  this.numbers = ['timestamp', 'balance', 'efficiency', 'effort', 'generate', 'hashrate', 'immature', 'paid'];
  this.strings = ['miner', 'type'];
  this.parameters = ['timestamp', 'miner', 'balance', 'efficiency', 'effort', 'generate', 'hashrate',
    'immature', 'paid', 'type'];

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

  // Select Pool Miners Using Parameters
  this.selectPoolMinersCurrent = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".pool_miners`;
    const filtered = Object.keys(parameters).filter((key) => _this.parameters.includes(key));
    filtered.forEach((parameter, idx) => {
      if (idx === 0) output += ' WHERE ';
      else output += ' AND ';
      output += `${ parameter }`;
      output += _this.handleQueries(parameters, parameter);
    });
    return output + ';';
  };

  // Build Miners Values String
  this.buildPoolMinersHashrate = function(updates) {
    let values = '';
    updates.forEach((miner, idx) => {
      values += `(
        ${ miner.timestamp },
        '${ miner.miner }',
        ${ miner.hashrate },
        '${ miner.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Hashrate Data
  this.insertPoolMinersHashrate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        timestamp, miner, hashrate,
        type)
      VALUES ${ _this.buildPoolMinersHashrate(updates) }
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
  };

  // Build Miners Values String
  this.buildPoolMinersRounds = function(updates) {
    let values = '';
    updates.forEach((miner, idx) => {
      values += `(
        ${ miner.timestamp },
        '${ miner.miner }',
        ${ miner.efficiency },
        ${ miner.effort },
        '${ miner.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Round Data
  this.insertPoolMinersRounds = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        timestamp, miner, efficiency,
        effort, type)
      VALUES ${ _this.buildPoolMinersRounds(updates) }
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort;`;
  };

  // Build Miners Values String
  this.buildPoolMinersPayments = function(updates) {
    let values = '';
    updates.forEach((miner, idx) => {
      values += `(
        ${ miner.timestamp },
        '${ miner.miner }',
        ${ miner.balance },
        ${ miner.paid },
        '${ miner.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Payment Data
  this.insertPoolMinersPayments = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        timestamp, miner, balance,
        paid, type)
      VALUES ${ _this.buildPoolMinersPayments(updates) }
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        paid = "${ pool }".pool_miners.paid + EXCLUDED.paid;`;
  };

  // Build Miners Values String
  this.buildPoolMinersUpdates = function(updates) {
    let values = '';
    updates.forEach((miner, idx) => {
      values += `(
        ${ miner.timestamp },
        '${ miner.miner }',
        ${ miner.generate },
        ${ miner.immature },
        '${ miner.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Payment Data
  this.insertPoolMinersUpdates = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        timestamp, miner, generate,
        immature, type)
      VALUES ${ _this.buildPoolMinersUpdates(updates) }
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        generate = EXCLUDED.generate,
        immature = EXCLUDED.immature;`;
  };

  // Insert Rows Using Reset
  this.insertPoolMinersReset = function(pool, type) {
    return `
      UPDATE "${ pool }".pool_miners
      SET immature = 0, generate = 0
      WHERE type = '${ type }';`;
  };

  // Delete Rows From Current Round
  this.deletePoolMinersInactive = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".pool_miners
      WHERE timestamp < ${ timestamp } AND balance = 0
      AND generate = 0 AND immature = 0 AND paid = 0;`;
  };
};

module.exports = PoolMiners;
