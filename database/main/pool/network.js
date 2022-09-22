const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolNetwork = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Pool Parameters
  this.numbers = ['timestamp', 'difficulty', 'hashrate', 'height'];
  this.strings = ['type'];
  this.parameters = ['timestamp', 'difficulty', 'hashrate', 'height', 'type'];

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

  // Select Pool Network Using Parameters
  this.selectPoolNetworkCurrent = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".pool_network`;
    const filtered = Object.keys(parameters).filter((key) => _this.parameters.includes(key));
    filtered.forEach((parameter, idx) => {
      if (idx === 0) output += ' WHERE ';
      else output += ' AND ';
      output += `${ parameter }`;
      output += _this.handleQueries(parameters, parameter);
    });
    return output + ';';
  };

  // Build Network Values String
  this.buildPoolNetworkCurrent = function(updates) {
    let values = '';
    updates.forEach((network, idx) => {
      values += `(
        ${ network.timestamp },
        ${ network.difficulty },
        ${ network.hashrate },
        ${ network.height },
        '${ network.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Network Data
  this.insertPoolNetworkCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_network (
        timestamp, difficulty,
        hashrate, height, type)
      VALUES ${ _this.buildPoolNetworkCurrent(updates) }
      ON CONFLICT ON CONSTRAINT pool_network_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        difficulty = EXCLUDED.difficulty,
        hashrate = EXCLUDED.hashrate,
        height = EXCLUDED.height;`;
  };

};

module.exports = PoolNetwork;
