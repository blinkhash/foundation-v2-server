const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const CurrentPayments = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Current Parameters
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

  // Select Current Payments Using Parameters
  this.selectCurrentPaymentsMain = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".current_payments`;
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

  // Build Payments Values String
  this.buildCurrentPaymentsMain = function(updates) {
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

  // Insert Rows Using Current Data
  this.insertCurrentPaymentsMain = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".current_payments (
        timestamp, round, type)
      VALUES ${ _this.buildCurrentPaymentsMain(updates) }
      ON CONFLICT ON CONSTRAINT current_payments_unique
      DO NOTHING RETURNING round;`;
  };

  // Delete Rows From Current Rounds
  this.deleteCurrentPaymentsMain = function(pool, rounds) {
    return `
      DELETE FROM "${ pool }".current_payments
      WHERE round IN (${ rounds.join(', ') });`;
  };
};

module.exports = CurrentPayments;
