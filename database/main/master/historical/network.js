const Text = require('../../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const HistoricalNetwork = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Historical Parameters
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

  // Select Historical Network Using Parameters
  this.selectHistoricalNetworkMain = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".historical_network`;
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

  // Build Network Values String
  this.buildHistoricalNetworkMain = function(updates) {
    let values = '';
    updates.forEach((network, idx) => {
      values += `(
        ${ network.timestamp },
        ${ network.recent },
        ${ network.difficulty },
        ${ network.hashrate },
        ${ network.height },
        '${ network.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Historical Data
  this.insertHistoricalNetworkMain = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".historical_network (
        timestamp, recent, difficulty,
        hashrate, height, type)
      VALUES ${ _this.buildHistoricalNetworkMain(updates) }
      ON CONFLICT ON CONSTRAINT historical_network_recent
      DO NOTHING;`;
  };
};

module.exports = HistoricalNetwork;
