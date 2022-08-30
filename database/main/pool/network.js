const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolNetwork = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Current Round
  this.selectPoolNetworkType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".pool_network
      WHERE type = '${ type }';`;
  };

  // Build Network Values String
  this.buildPoolNetworkCurrent = function(updates) {
    let values = '';
    updates.forEach((network, idx) => {
      values += `(
        ${ network.timestamp },
        ${ network.difficulty },
        ${ network.hashrate },
        ${ network.height },
        '${ network.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Blocks Data
  this.insertPoolNetworkCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_network (
        timestamp, difficulty,
        hashrate, height, type)
      VALUES ${ _this.buildPoolNetworkCurrent(updates) }
      ON CONFLICT ON CONSTRAINT pool_network_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        difficulty = EXCLUDED.difficulty,
        hashrate = EXCLUDED.hashrate,
        height = EXCLUDED.height;`;
  };

};

module.exports = PoolNetwork;
