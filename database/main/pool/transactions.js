const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolTransactions = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Pool Parameters
  this.numbers = ['timestamp'];
  this.strings = ['round', 'type'];
  this.parameters = ['timestamp', 'round', 'type'];

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

  // Select Pool Transactions Using Parameters
  this.selectPoolTransactionsCurrent = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".pool_transactions`;
    const filtered = Object.keys(parameters).filter((key) => _this.parameters.includes(key));
    filtered.forEach((parameter, idx) => {
      if (idx === 0) output += ' WHERE ';
      else output += ' AND ';
      output += `${ parameter }`;
      output += _this.handleQueries(parameters, parameter);
    });
    return output + ';';
  };

  // Build Transactions Values String
  this.buildPoolTransactionsCurrent = function(updates) {
    let values = '';
    updates.forEach((transaction, idx) => {
      values += `(
        ${ transaction.timestamp },
        '${ transaction.round }',
        '${ transaction.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Transactions Data
  this.insertPoolTransactionsCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_transactions (
        timestamp, round, type)
      VALUES ${ _this.buildPoolTransactionsCurrent(updates) }
      ON CONFLICT ON CONSTRAINT pool_transactions_unique
      DO NOTHING RETURNING round;`;
  };

  // Delete Rows From Current Rounds
  this.deletePoolTransactionsCurrent = function(pool, rounds) {
    return `
      DELETE FROM "${ pool }".pool_transactions
      WHERE round IN (${ rounds.join(', ') });`;
  };

  // Delete Rows From Current Round
  this.deletePoolTransactionsInactive = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".pool_transactions
      WHERE timestamp < ${ timestamp };`;
  };
};

module.exports = PoolTransactions;
