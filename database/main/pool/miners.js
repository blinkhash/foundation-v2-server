const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolMiners = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectPoolMinersMiner = function(pool, miner, type) {
    return `
      SELECT * FROM "${ pool }".pool_miners
      WHERE miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Rows Using Miner
  this.selectPoolMinersType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".pool_miners
      WHERE type = '${ type }';`;
  };

  // Build Miners Values String
  this.buildPoolMinersHashrate = function(updates) {
    let values = '';
    updates.forEach((miner, idx) => {
      values += `(
        ${ miner.timestamp },
        '${ miner.miner }',
        ${ miner.hashrate },
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
        type)
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
        effort, type)
      VALUES ${ _this.buildPoolMinersRounds(updates) }
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort;`;
  };

  // Build Miners Values String
  this.buildPoolMinersPayments = function(updates) {
    let values = '';
    updates.forEach((miner, idx) => {
      values += `(
        ${ miner.timestamp },
        '${ miner.miner }',
        ${ miner.balance },
        ${ miner.generate },
        ${ miner.immature },
        ${ miner.paid },
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
        generate, immature, paid,
        type)
      VALUES ${ _this.buildPoolMinersPayments(updates) }
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        generate = EXCLUDED.generate,
        immature = EXCLUDED.immature,
        paid = EXCLUDED.paid;`;
  };

  // Delete Rows From Current Round
  this.deletePoolMinersCurrent = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".pool_miners
      WHERE timestamp < ${ timestamp };`;
  };
};

module.exports = PoolMiners;
