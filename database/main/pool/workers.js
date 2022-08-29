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

  // Select Rows Using Worker
  this.selectPoolWorkersWorker = function(pool, worker, type) {
    return `
      SELECT * FROM "${ pool }".pool_workers
      WHERE worker = '${ worker }' AND type = '${ type }';`;
  };

  // Select Rows Using Type
  this.selectPoolWorkersType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".pool_workers
      WHERE type = '${ type }';`;
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
        hashrate, type)
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
        efficiency, effort, type)
      VALUES ${ _this.buildPoolWorkersRounds(updates) }
      ON CONFLICT ON CONSTRAINT pool_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort;`;
  };

  // Build Workers Values String
  this.buildPoolWorkersPayments = function(updates) {
    let values = '';
    updates.forEach((worker, idx) => {
      values += `(
        ${ worker.timestamp },
        '${ worker.miner }',
        '${ worker.worker }',
        ${ worker.balance },
        ${ worker.generate },
        ${ worker.immature },
        ${ worker.paid },
        '${ worker.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Payment Data
  this.insertPoolWorkersPayments = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_workers (
        timestamp, miner, worker,
        balance, generate, immature,
        paid, type)
      VALUES ${ _this.buildPoolWorkersPayments(updates) }
      ON CONFLICT ON CONSTRAINT pool_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        generate = EXCLUDED.generate,
        immature = EXCLUDED.immature,
        paid = EXCLUDED.paid;`;
  };

  // Delete Rows From Current Round
  this.deletePoolWorkersCurrent = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".pool_workers
      WHERE timestamp < ${ timestamp };`;
  };
};

module.exports = PoolWorkers;
