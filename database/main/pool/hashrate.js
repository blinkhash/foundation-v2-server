const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolHashrate = function (logger, configMain) {

  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Current Round
  this.selectPoolHashrateCurrent = function(pool, timestamp) {
    return `
      SELECT SUM(work) as current_hashrate
      FROM "${ pool }".pool_hashrate
      WHERE timestamp >= ${ timestamp };`;
  };

  // Delete Rows From Current Round
  this.deletePoolHashrateCurrent = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".pool_hashrate
      WHERE timestamp < ${ timestamp };`;
  };

  // Insert Rows Using Current Round
  this.insertPoolHashrateCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_hashrate (
        timestamp, miner, worker, work)
      VALUES (
        ${ updates.timestamp },
        '${ updates.miner }',
        '${ updates.worker }',
        ${ updates.work });`;
  };
};

module.exports = PoolHashrate;
