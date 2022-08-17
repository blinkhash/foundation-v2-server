const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolMiners = function (logger, configMain) {

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

  // Insert Rows Using Hashrate Data
  this.insertPoolMinersHashrate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        miner, timestamp, hashrate,
        type)
      VALUES (
        '${ updates.miner }',
        ${ updates.timestamp },
        ${ updates.hashrate },
        '${ updates.type }')
      ON CONFLICT (miner)
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        hashrate = ${ updates.hashrate };`;
  };

  // Insert Rows Using Reset
  this.insertPoolMinersRoundReset = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        miner, timestamp, efficiency,
        effort, type)
      VALUES (
        '${ updates.miner }',
        ${ updates.timestamp },
        0, 0, '${ updates.type }')
      ON CONFLICT (miner)
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        efficiency = 0, effort = 0;`;
  };

  // Insert Rows Using Round Data
  this.insertPoolMinersRoundUpdate = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        miner, timestamp, efficiency,
        effort, type)
      VALUES (
        '${ updates.miner }',
        ${ updates.timestamp },
        ${ updates.efficiency },
        ${ updates.effort },
        '${ updates.type }')
      ON CONFLICT (miner)
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        efficiency = ${ updates.efficiency },
        effort = ${ updates.effort };`;
  };

  // Insert Rows Using Payment Data
  this.insertPoolMinersPayment = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_miners (
        miner, timestamp, balance,
        generate, immature, paid)
      VALUES (
        '${ updates.miner }',
        ${ updates.timestamp },
        ${ updates.balance },
        ${ updates.generate },
        ${ updates.immature },
        ${ updates.paid }')
      ON CONFLICT (miner)
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        balance = ${ updates.balance },
        generate = ${ updates.generate },
        immature = ${ updates.immature },
        paid = ${ updates.paid };`;
  };
};

module.exports = PoolMiners;
