const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const HistoricalNetwork = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Current Data
  this.selectHistoricalNetworkType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".historical_network
      WHERE type = '${ type }'`;
  };

  // Build Network Values String
  this.buildHistoricalNetworkCurrent = function(updates) {
    let values = '';
    updates.forEach((network, idx) => {
      values += `(
        ${ network.timestamp },
        ${ network.recent },
        ${ network.difficulty },
        ${ network.hashrate },
        ${ network.height },
        '${ network.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Current Data
  this.insertHistoricalNetworkCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".historical_network (
        timestamp, recent, difficulty,
        hashrate, height, type)
      VALUES ${ _this.buildHistoricalNetworkCurrent(updates) }
      ON CONFLICT ON CONSTRAINT historical_network_recent
      DO NOTHING;`;
  };
};

module.exports = HistoricalNetwork;
