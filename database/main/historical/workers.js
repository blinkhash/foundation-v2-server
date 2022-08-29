const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const HistoricalWorkers = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectHistoricalWorkersMiner = function(pool, miner, type) {
    return `
      SELECT * FROM "${ pool }".historical_workers
      WHERE miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Rows Using Worker
  this.selectHistoricalWorkersWorker = function(pool, worker, type) {
    return `
      SELECT * FROM "${ pool }".historical_workers
      WHERE worker = '${ worker }' AND type = '${ type }';`;
  };

  // Select Rows Using Type
  this.selectHistoricalWorkersType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".historical_workers
      WHERE type = '${ type }';`;
  };

  // Build Workers Values String
  this.buildHistoricalWorkersCurrentUpdate = function(updates) {
    let values = '';
    updates.forEach((worker, idx) => {
      values += `(
        ${ worker.timestamp },
        ${ worker.recent },
        '${ worker.miner }',
        '${ worker.worker }',
        ${ worker.efficiency },
        ${ worker.effort },
        ${ worker.hashrate },
        '${ worker.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Current Data
  this.insertHistoricalWorkersCurrentUpdate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".historical_workers (
        timestamp, recent, miner,
        worker, efficiency, effort,
        hashrate, type)
      VALUES ${ _this.buildHistoricalWorkersCurrentUpdate(updates) }
      ON CONFLICT ON CONSTRAINT historical_workers_recent
      DO NOTHING;`;
  };
};

module.exports = HistoricalWorkers;
