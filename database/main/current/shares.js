const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const CurrentShares = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Current Parameters
  this.strings = ['type'];
  this.parameters = ['type'];

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

  // Select Current Shares Using Parameters
  this.selectCurrentSharesMain = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".current_shares`;
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

  // Build Hashrate Values String
  this.buildCurrentSharesMain = function(updates) {
    let values = '';
    updates.forEach((share, idx) => {
      values += `(
        '${ share.job }',
        '${ share.id }',
        '${ share.ip }',
        ${ share.port },
        '${ share.addrPrimary }',
        '${ share.addrAuxiliary }',
        ${ share.blockDiffPrimary },
        '${ share.blockType }',
        ${ share.difficulty },
        '${ share.error }',
        '${ share.hash }',
        ${ share.height },
        '${ share.identifier }',
        ${ share.shareDiff },
        '${ share.transaction }',
        ${ share.shareValid },
        ${ share.blockValid })`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Current Share
  this.insertCurrentShares = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".current_shares (
        job, share_id, ip, port, addr_primary,
        addr_auxiliary, block_diff_primary,
        block_type, difficulty, error, hash,
        height, identifier, share_diff,
        transaction, share_valid, block_valid)
      VALUES ${ _this.buildCurrentSharesMain(updates) }
      ON CONFLICT ON CONSTRAINT current_shares_unique
      DO NOTHING;`;
  };

  // Delete Rows From Current Round
  this.deleteCurrentShare = function(pool, hash) {
    return `
      DELETE FROM "${ pool }".current_shares
      WHERE hash = '${ hash }';`;
  };
};

module.exports = CurrentShares;
