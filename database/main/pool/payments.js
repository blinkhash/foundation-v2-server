const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolPayments = function (logger, configMain) {

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

  // Select Pool Payments Using Parameters
  this.selectPoolPaymentsCurrent = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".pool_payments`;
    const filtered = Object.keys(parameters).filter((key) => _this.parameters.includes(key));
    filtered.forEach((parameter, idx) => {
      if (idx === 0) output += ' WHERE ';
      else output += ' AND ';
      output += `${ parameter }`;
      output += _this.handleQueries(parameters, parameter);
    });
    return output + ';';
  };

  // Build Payments Values String
  this.buildPoolPaymentsCurrent = function(updates) {
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

  // Insert Rows Using Payments Data
  this.insertPoolPaymentsCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_payments (
        timestamp, round, type)
      VALUES ${ _this.buildPoolPaymentsCurrent(updates) }
      ON CONFLICT ON CONSTRAINT pool_payments_unique
      DO NOTHING RETURNING round;`;
  };

  // Delete Rows From Current Rounds
  this.deletePoolPaymentsCurrent = function(pool, rounds) {
    return `
      DELETE FROM "${ pool }".pool_payments
      WHERE round IN (${ rounds.join(', ') });`;
  };
};

module.exports = PoolPayments;
