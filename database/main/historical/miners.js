const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const HistoricalMiners = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectHistoricalMinersMiner = function(pool, miner, type) {
    return `
      SELECT * FROM "${ pool }".historical_miners
      WHERE miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Rows Using Miner
  this.selectHistoricalMinersType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".historical_miners
      WHERE type = '${ type }';`;
  };

  // Build Miners Values String
  this.buildHistoricalMinersCurrent = function(updates) {
    let values = '';
    updates.forEach((miner, idx) => {
      values += `(
        ${ miner.timestamp },
        ${ miner.recent },
        '${ miner.miner }',
        ${ miner.efficiency },
        ${ miner.effort },
        ${ miner.hashrate },
        '${ miner.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Current Data
  this.insertHistoricalMinersCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".historical_miners (
        timestamp, recent, miner,
        efficiency, effort, hashrate,
        type)
      VALUES ${ _this.buildHistoricalMinersCurrent(updates) }
      ON CONFLICT ON CONSTRAINT historical_miners_recent
      DO NOTHING;`;
  };
};

module.exports = HistoricalMiners;
