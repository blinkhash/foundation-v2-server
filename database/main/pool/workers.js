const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolWorkers = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectPoolWorkersMiner = function(pool, miner, type) {
    return `
      SELECT * FROM "${ pool }".pool_workers
      WHERE miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Rows Using Type
  this.selectPoolWorkersType = function(pool, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_workers
      WHERE solo = ${ solo } AND type = '${ type }';`;
  };

  // Select Rows Using Worker
  this.selectPoolWorkersWorker = function(pool, worker, type) {
    return `
      SELECT * FROM "${ pool }".pool_workers
      WHERE worker = '${ worker }' AND type = '${ type }';`;
  };

  // Build Workers Values String
  this.buildPoolWorkersHashrate = function(updates) {
    let values = '';
    updates.forEach((worker, idx) => {
      values += `(
        ${ worker.timestamp },
        '${ worker.miner }',
        '${ worker.worker }',
        ${ worker.hashrate },
        ${ worker.solo },
        '${ worker.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Hashrate Data
  this.insertPoolWorkersHashrate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES ${ _this.buildPoolWorkersHashrate(updates) }
      ON CONFLICT ON CONSTRAINT pool_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
  };

  // Build Workers Values String
  this.buildPoolWorkersRounds = function(updates) {
    let values = '';
    updates.forEach((worker, idx) => {
      values += `(
        ${ worker.timestamp },
        '${ worker.miner }',
        '${ worker.worker }',
        ${ worker.efficiency },
        ${ worker.effort },
        ${ worker.solo },
        '${ worker.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Round Data
  this.insertPoolWorkersRounds = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_workers (
        timestamp, miner, worker,
        efficiency, effort, solo,
        type)
      VALUES ${ _this.buildPoolWorkersRounds(updates) }
      ON CONFLICT ON CONSTRAINT pool_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        solo = EXCLUDED.solo;`;
  };

  // Delete Rows From Current Round
  this.deletePoolWorkersInactive = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".pool_workers
      WHERE timestamp < ${ timestamp };`;
  };
};

module.exports = PoolWorkers;
