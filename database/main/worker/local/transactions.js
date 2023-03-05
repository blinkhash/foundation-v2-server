const Text = require('../../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const LocalTransactions = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Local Parameters
  this.numbers = ['timestamp'];
  this.strings = ['uuid', 'type'];
  this.parameters = ['timestamp', 'uuid', 'type'];

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

  // Select Local Transactions Using Parameters
  this.selectLocalTransactionsMain = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".local_transactions`;
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
  this.buildLocalTransactionsMain = function(updates) {
    let values = '';
    updates.forEach((transaction, idx) => {
      values += `(
        ${ transaction.timestamp },
        '${ transaction.uuid }',
        '${ transaction.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Transactions Data
  this.insertLocalTransactionsMain = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".local_transactions (
        timestamp, uuid, type)
      VALUES ${ _this.buildLocalTransactionsMain(updates) }
      ON CONFLICT ON CONSTRAINT local_transactions_unique
      DO NOTHING RETURNING uuid;`;
  };

  // Delete Rows From Local UUIDs
  this.deleteLocalTransactionsMain = function(pool, uuids) {
    return `
      DELETE FROM "${ pool }".local_transactions
      WHERE uuid IN (${ uuids.join(', ') });`;
  };

  // Delete Rows From Local UUIDs
  this.deleteLocalTransactionsInactive = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".local_transactions
      WHERE timestamp < ${ timestamp };`;
  };
};

module.exports = LocalTransactions;
