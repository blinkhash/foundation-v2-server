const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolMetadata = function (logger, configMain) {

  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Current Round
  this.selectPoolMetadataCurrent = function(pool) {
    return `
      SELECT * FROM "${ pool }".pool_metadata
      ORDER BY timestamp DESC`;
  };

  // Insert Rows Using Hashrate Data
  this.insertPoolMetadataHashrateUpdate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_metadata (
        timestamp, hashrate, miners,
        workers)
        VALUES (
          ${ updates.timestamp },
          ${ updates.hashrate },
          ${ updates.miners },
          ${ updates.workers })
      ON CONFLICT ON CONSTRAINT pool_metadata_locked
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        hashrate = ${ updates.hashrate },
        miners = ${ updates.miners },
        workers = ${ updates.workers };`;
  };

  // Insert Rows Using Reset
  this.insertPoolMetadataRoundReset = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_metadata (
        timestamp, efficiency, effort,
        invalid, stale, valid, work)
      VALUES (
        ${ updates.timestamp },
        0, 0, 0, 0, 0, 0)
      ON CONFLICT ON CONSTRAINT pool_metadata_locked
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
  };

  // Insert Rows Using Round Data
  this.insertPoolMetadataRoundUpdate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_metadata (
        timestamp, efficiency, effort,
        invalid, stale, valid, work)
      VALUES (
        ${ updates.timestamp },
        ${ updates.efficiency },
        ${ updates.effort },
        ${ updates.invalid },
        ${ updates.stale },
        ${ updates.valid },
        ${ updates.work })
      ON CONFLICT ON CONSTRAINT pool_metadata_locked
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        efficiency = ${ updates.efficiency },
        effort = ${ updates.effort },
        invalid = "${ pool }".pool_metadata.invalid + ${ updates.invalid },
        stale = "${ pool }".pool_metadata.stale + ${ updates.stale },
        valid = "${ pool }".pool_metadata.valid + ${ updates.valid },
        work = "${ pool }".pool_metadata.work + ${ updates.work };`;
  };
};

module.exports = PoolMetadata;
