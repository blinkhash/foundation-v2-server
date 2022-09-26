const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const HistoricalTransactions = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Historical Parameters
  this.numbers = ['timestamp', 'amount'];
  this.strings = ['transaction', 'type'];
  this.parameters = ['timestamp', 'amount', 'transaction', 'type'];

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

  // Select Historical Transactions Using Parameters
  this.selectHistoricalTransactionsMain = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".historical_transactions`;
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

  // Build Transactions Values String
  this.buildHistoricalTransactionsMain = function(updates) {
    let values = '';
    updates.forEach((transaction, idx) => {
      values += `(
        ${ transaction.timestamp },
        ${ transaction.amount },
        '${ transaction.transaction }',
        '${ transaction.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Historical Data
  this.insertHistoricalTransactionsMain = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".historical_transactions (
        timestamp, amount,
        transaction, type)
      VALUES ${ _this.buildHistoricalTransactionsMain(updates) }
      ON CONFLICT DO NOTHING;`;
  };
};

module.exports = HistoricalTransactions;
