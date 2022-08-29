const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolHashrate = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectPoolHashrateMiner = function(pool, timestamp, miner, type) {
    return `
      SELECT * FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Count of Distinct Miners
  this.countPoolHashrateMiner = function(pool, timestamp, type) {
    return `
      SELECT CAST(COUNT(DISTINCT miner) AS INT)
      FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND type = '${ type }';`;
  };

  // Select Sum of Rows Using Miners
  this.sumPoolHashrateMiner = function(pool, timestamp, type) {
    return `
      SELECT miner, SUM(work) as current_work
      FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND type = '${ type }' GROUP BY miner;`;
  };

  // Select Rows Using Miner
  this.selectPoolHashrateWorker = function(pool, timestamp, worker, type) {
    return `
      SELECT * FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND worker = '${ worker }' AND type = '${ type }';`;
  };

  // Select Count of Distinct Workers
  this.countPoolHashrateWorker = function(pool, timestamp, type) {
    return `
      SELECT CAST(COUNT(DISTINCT worker) AS INT)
      FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND type = '${ type }';`;
  };

  // Select Sum of Rows Using Workers
  this.sumPoolHashrateWorker = function(pool, timestamp, type) {
    return `
      SELECT worker, SUM(work) as current_work
      FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND type = '${ type }' GROUP BY worker;`;
  };

  // Select Rows Using Miner
  this.selectPoolHashrateType = function(pool, timestamp, type) {
    return `
      SELECT * FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND type = '${ type }';`;
  };

  // Select Sum of Rows Using Types
  this.sumPoolHashrateType = function(pool, timestamp, type) {
    return `
      SELECT SUM(work) as current_work
      FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp }
      AND type = '${ type }';`;
  };

  // Build Hashrate Values String
  this.buildPoolHashrateCurrent = function(updates) {
    let values = '';
    updates.forEach((hashrate, idx) => {
      values += `(
        ${ hashrate.timestamp },
        '${ hashrate.miner }',
        '${ hashrate.worker }',
        '${ hashrate.type }',
        ${ hashrate.work })`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Current Round
  this.insertPoolHashrateCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_hashrate (
        timestamp, miner, worker,
        type, work)
      VALUES ${ _this.buildPoolHashrateCurrent(updates) };`;
  };

  // Delete Rows From Current Round
  this.deletePoolHashrateCurrent = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".pool_hashrate
      WHERE timestamp < ${ timestamp };`;
  };
};

module.exports = PoolHashrate;
