const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolMetadata = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Current Round
  this.selectPoolMetadataType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".pool_metadata
      WHERE type = '${ type }';`;
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
