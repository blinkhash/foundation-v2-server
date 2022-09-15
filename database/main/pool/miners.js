const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolMiners = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectPoolMinersMiner = function(pool, miner, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_miners
      WHERE miner = '${ miner }' AND solo = ${ solo }
      AND type = '${ type }';`;
  };

  // Select Rows Using Balance
  this.selectPoolMinersBalance = function(pool, balance, type) {
    return `
      SELECT * FROM "${ pool }".pool_miners
      WHERE balance >= ${ balance } AND type = '${ type }';`;
  };

  // Select Rows Using Type
  this.selectPoolMinersType = function(pool, solo, type) {
    return `
      SELECT * FROM "${ pool }".pool_miners
      WHERE solo = ${ solo } AND type = '${ type }';`;
  };

  // Build Miners Values String
  this.buildPoolMinersHashrate = function(updates) {
    let values = '';
    updates.forEach((miner, idx) => {
      values += `(
        ${ miner.timestamp },
        '${ miner.miner }',
        ${ miner.hashrate },
        ${ miner.solo },
        '${ miner.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Hashrate Data
  this.insertPoolMinersHashrate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        timestamp, miner, hashrate,
        solo, type)
      VALUES ${ _this.buildPoolMinersHashrate(updates) }
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
  };

  // Build Miners Values String
  this.buildPoolMinersRounds = function(updates) {
    let values = '';
    updates.forEach((miner, idx) => {
      values += `(
        ${ miner.timestamp },
        '${ miner.miner }',
        ${ miner.efficiency },
        ${ miner.effort },
        ${ miner.solo },
        '${ miner.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Round Data
  this.insertPoolMinersRounds = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        timestamp, miner, efficiency,
        effort, solo, type)
      VALUES ${ _this.buildPoolMinersRounds(updates) }
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        solo = EXCLUDED.solo;`;
  };

  // Build Miners Values String
  this.buildPoolMinersPayments = function(updates) {
    let values = '';
    updates.forEach((miner, idx) => {
      values += `(
        ${ miner.timestamp },
        '${ miner.miner }',
        ${ miner.balance },
        ${ miner.paid },
        ${ miner.solo },
        '${ miner.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Payment Data
  this.insertPoolMinersPayments = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        timestamp, miner, balance,
        paid, solo, type)
      VALUES ${ _this.buildPoolMinersPayments(updates) }
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        paid = "${ pool }".pool_rounds.paid + EXCLUDED.paid;`;
  };

  // Build Miners Values String
  this.buildPoolMinersUpdates = function(updates) {
    let values = '';
    updates.forEach((miner, idx) => {
      values += `(
        ${ miner.timestamp },
        '${ miner.miner }',
        ${ miner.generate },
        ${ miner.immature },
        ${ miner.solo },
        '${ miner.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Payment Data
  this.insertPoolMinersUpdates = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        timestamp, miner, generate,
        immature, solo, type)
      VALUES ${ _this.buildPoolMinersUpdates(updates) }
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        generate = EXCLUDED.generate,
        immature = EXCLUDED.immature;`;
  };

  // Insert Rows Using Reset
  this.insertPoolMinersReset = function(pool, type) {
    return `
      UPDATE "${ pool }".pool_miners
      SET immature = 0, generate = 0
      WHERE type = '${ type }';`;
  };

  // Delete Rows From Current Round
  this.deletePoolMinersInactive = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".pool_miners
      WHERE timestamp < ${ timestamp } AND balance = 0
      AND generate = 0 AND immature = 0 AND paid = 0;`;
  };
};

module.exports = PoolMiners;
