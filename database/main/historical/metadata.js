const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const HistoricalMetadata = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Current Data
  this.selectHistoricalMetadataType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".historical_metadata
      WHERE type = '${ type }'`;
  };

  // Build Metadata Values String
  this.buildHistoricalMetadataCurrentUpdate = function(updates) {
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

  // Insert Rows Using Current Data
  this.insertHistoricalMetadataCurrentUpdate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".historical_metadata (
        timestamp, recent, blocks,
        efficiency, effort, hashrate,
        invalid, miners, stale,
        type, valid, work, workers)
      VALUES ${ _this.buildHistoricalMetadataCurrentUpdate(updates) }
      ON CONFLICT ON CONSTRAINT historical_metadata_recent
      DO NOTHING;`;
  };
};

module.exports = HistoricalMetadata;
