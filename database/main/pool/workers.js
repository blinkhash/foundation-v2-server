const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolWorkers = function (logger, configMain) {

  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectPoolWorkersWorker = function(pool, worker, type) {
    return `
      SELECT * FROM "${ pool }".pool_workers
      WHERE worker = '${ worker }' AND type = '${ type }';`;
  };

  // Select Rows Using Miner
  this.selectPoolWorkersMiner = function(pool, miner, type) {
    return `
      SELECT * FROM "${ pool }".pool_workers
      WHERE miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Rows Using Miner
  this.selectPoolWorkersType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".pool_workers
      WHERE type = '${ type }';`;
  };

  // Insert Rows Using Hashrate Data
  this.insertPoolWorkersHashrate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_workers (
        worker, miner, timestamp,
        hashrate, type)
      VALUES (
        '${ updates.worker }',
        '${ updates.miner }',
        ${ updates.timestamp },
        ${ updates.hashrate },
        '${ updates.type }')
      ON CONFLICT (worker)
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        hashrate = ${ updates.hashrate };`;
  };

  // Insert Rows Using Reset
  this.insertPoolWorkersRoundReset = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_workers (
        worker, miner, timestamp,
        efficiency, effort, type)
      VALUES (
        '${ updates.worker }',
        '${ updates.miner }',
        ${ updates.timestamp },
        0, 0, '${ updates.type }')
      ON CONFLICT (worker)
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        efficiency = 0, effort = 0;`;
  };

  // Insert Rows Using Round Data
  this.insertPoolWorkersRoundUpdate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_workers (
        worker, miner, timestamp,
        efficiency, effort, type)
      VALUES (
        '${ updates.worker }',
        '${ updates.miner }',
        ${ updates.timestamp },
        ${ updates.efficiency },
        ${ updates.effort },
        '${ updates.type }')
      ON CONFLICT (worker)
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        efficiency = ${ updates.efficiency },
        effort = ${ updates.effort };`;
  };

  // Insert Rows Using Payment Data
  this.insertPoolWorkersPayment = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_workers (
        worker, miner, timestamp,
        balance, generate, immature,
        paid)
      VALUES (
        '${ updates.worker }',
        '${ updates.miner }',
        ${ updates.timestamp },
        ${ updates.balance },
        ${ updates.generate },
        ${ updates.immature },
        ${ updates.paid }')
      ON CONFLICT (worker)
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        balance = ${ updates.balance },
        generate = ${ updates.generate },
        immature = ${ updates.immature },
        paid = ${ updates.paid };`;
  };
};

module.exports = PoolWorkers;
