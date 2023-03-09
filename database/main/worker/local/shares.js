const Text = require('../../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const LocalShares = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Local Parameters
  this.numbers = ['timestamp', 'submitted', 'blockdiff', 'clientdiff', 'headerdiff', 'height', 'reward', 'sharediff'];
  this.strings = ['error', 'uuid', 'miner', 'worker', 'ip', 'port', 'hash', 'hex', 'identifier', 'transaction', 'type'];
  this.parameters = ['error', 'uuid', 'timestamp', 'submitted', 'miner', 'worker', 'ip', 'port', 'blockdiff',
    'clientdiff', 'hash', 'hex', 'headerdiff', 'height', 'identifier', 'reward', 'sharediff', 'transaction', 'type'];

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

  // Select Local Shares Using Parameters
  this.selectLocalSharesMain = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".local_shares`;
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

  // Build Shares Values String
  this.buildLocalSharesMain = function(updates) {
    let values = '';
    updates.forEach((share, idx) => {
      values += `(
        '${ share.error }',
        '${ share.uuid }',
        ${ share.timestamp },
        ${ share.submitted },
        '${ share.ip }',
        '${ share.port }',
        '${ share.addrprimary }',
        '${ share.addrauxiliary }',
        ${ share.blockdiffprimary },
        ${ share.blockdiffauxiliary },
        ${ share.blockvalid },
        '${ share.blocktype }',
        ${ share.clientdiff },
        '${ share.hash }',
        ${ share.height },
        '${ share.identifier }',
        ${ share.reward },
        ${ share.sharediff },
        ${ share.sharevalid },
        '${ share.transaction }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Shares Data
  this.insertLocalSharesMain = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".local_shares (
        error, uuid, timestamp,
        submitted, ip, port, addrprimary,
        addrauxiliary, blockdiffprimary,
        blockdiffauxiliary, blockvalid,
        blocktype, clientdiff, hash, height,
        identifier, reward, sharediff,
        sharevalid, transaction)
      VALUES ${ _this.buildLocalSharesMain(updates) }
      ON CONFLICT ON CONSTRAINT local_shares_unique
      DO NOTHING;`;
  };

  // Delete Rows From Shares
  this.deleteLocalSharesMain = function(pool, uuids) {
    return `
      DELETE FROM "${ pool }".local_shares
      WHERE uuid IN (${ uuids.join(', ') });`;
  };
};

module.exports = LocalShares;
