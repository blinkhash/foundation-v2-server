const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const HistoricalMetadata = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Historical Parameters
  _this.numbers = ['timestamp', 'blocks', 'efficiency', 'effort', 'hashrate', 'invalid', 'miners',
    'stale', 'valid', 'work', 'workers'];
  _this.strings = ['type'];
  _this.parameters = ['timestamp', 'blocks', 'efficiency', 'effort', 'hashrate', 'invalid', 'miners',
    'stale', 'type', 'valid', 'work', 'workers'];

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

  // Select Historical Metadata Using Parameters
  this.selectHistoricalMetadataMain = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".historical_metadata`;
    const filtered = Object.keys(parameters).filter((key) => _this.parameters.includes(key));
    filtered.forEach((parameter, idx) => {
      if (idx === 0) output += ' WHERE ';
      else output += ' AND ';
      output += `${ parameter }`;
      output += _this.handleQueries(parameters, parameter);
    });
    return output + ';';
  };

  // Build Metadata Values String
  this.buildHistoricalMetadataMain = function(updates) {
    let values = '';
    updates.forEach((metadata, idx) => {
      values += `(
        ${ metadata.timestamp },
        ${ metadata.recent },
        ${ metadata.blocks },
        ${ metadata.efficiency },
        ${ metadata.effort },
        ${ metadata.hashrate },
        ${ metadata.invalid },
        ${ metadata.miners },
        ${ metadata.stale },
        '${ metadata.type }',
        ${ metadata.valid },
        ${ metadata.work },
        ${ metadata.workers })`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Historical Data
  this.insertHistoricalMetadataMain = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".historical_metadata (
        timestamp, recent, blocks,
        efficiency, effort, hashrate,
        invalid, miners, stale,
        type, valid, work, workers)
      VALUES ${ _this.buildHistoricalMetadataMain(updates) }
      ON CONFLICT ON CONSTRAINT historical_metadata_recent
      DO NOTHING;`;
  };
};

module.exports = HistoricalMetadata;
