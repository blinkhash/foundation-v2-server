const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolMetadata = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Pool Parameters
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

  // Select Pool Metadata Using Parameters
  this.selectPoolMetadataCurrent = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".pool_metadata`;
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
  this.buildPoolMetadataBlocks = function(updates) {
    let values = '';
    updates.forEach((metadata, idx) => {
      values += `(
        ${ metadata.timestamp },
        ${ metadata.blocks },
        '${ metadata.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Blocks Data
  this.insertPoolMetadataBlocks = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_metadata (
        timestamp, blocks, type)
      VALUES ${ _this.buildPoolMetadataBlocks(updates) }
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "${ pool }".pool_metadata.blocks + EXCLUDED.blocks;`;
  };

  // Build Metadata Values String
  this.buildPoolMetadataHashrate = function(updates) {
    let values = '';
    updates.forEach((metadata, idx) => {
      values += `(
        ${ metadata.timestamp },
        ${ metadata.hashrate },
        ${ metadata.miners },
        '${ metadata.type }',
        ${ metadata.workers })`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Hashrate Data
  this.insertPoolMetadataHashrate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_metadata (
        timestamp, hashrate, miners,
        type, workers)
      VALUES ${ _this.buildPoolMetadataHashrate(updates) }
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate,
        miners = EXCLUDED.miners,
        workers = EXCLUDED.workers;`;
  };

  // Build Metadata Values String
  this.buildPoolMetadataRoundsReset = function(updates) {
    let values = '';
    updates.forEach((metadata, idx) => {
      values += `(
        ${ metadata.timestamp },
        0, 0, 0, 0, '${ metadata.type }', 0, 0)`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Reset
  this.insertPoolMetadataRoundsReset = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES ${ _this.buildPoolMetadataRoundsReset(updates) }
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
  };

  // Build Metadata Values String
  this.buildPoolMetadataRounds = function(updates) {
    let values = '';
    updates.forEach((metadata, idx) => {
      values += `(
        ${ metadata.timestamp },
        ${ metadata.efficiency },
        ${ metadata.effort },
        ${ metadata.invalid },
        ${ metadata.stale },
        '${ metadata.type }',
        ${ metadata.valid },
        ${ metadata.work })`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Round Data
  this.insertPoolMetadataRounds = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES ${ _this.buildPoolMetadataRounds(updates) }
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "${ pool }".pool_metadata.invalid + EXCLUDED.invalid,
        stale = "${ pool }".pool_metadata.stale + EXCLUDED.stale,
        valid = "${ pool }".pool_metadata.valid + EXCLUDED.valid,
        work = "${ pool }".pool_metadata.work + EXCLUDED.work;`;
  };
};

module.exports = PoolMetadata;
