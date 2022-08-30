const Text = require('../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Network Function
const Network = function (logger, client, config, configMain) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.config = config;
  this.configMain = configMain;
  this.pool = config.name;
  this.text = Text[configMain.language];

  // Stratum Variables
  process.setMaxListeners(0);
  this.forkId = process.env.forkId;

  // Database Variables
  this.executor = _this.client.commands.executor;
  this.current = _this.client.commands.pool;

  // Handle Current Network Updates
  this.handleNetwork = function(network, networkType) {

    // Return Network Updates
    return {
      timestamp: Date.now(),
      difficulty: network.difficulty,
      hashrate: network.hashrate,
      height: network.height,
      type: networkType,
    };
  };

  // Handle Primary Updates
  this.handlePrimary = function(network, callback) {

    // Build Combined Transaction
    const networkUpdates = _this.handleNetwork(network, 'primary');
    const transaction = [
      'BEGIN;',
      _this.current.network.insertPoolNetworkCurrent(_this.pool, [networkUpdates]),
      'COMMIT'];

    // Insert Work into Database
    _this.executor(transaction, () => callback());
  };

  // Handle Primary Updates
  this.handleAuxiliary = function(network, callback) {

    // Build Combined Transaction
    const networkUpdates = _this.handleNetwork(network, 'auxiliary');
    const transaction = [
      'BEGIN;',
      _this.current.network.insertPoolNetworkCurrent(_this.pool, [networkUpdates]),
      'COMMIT'];

    // Insert Work into Database
    _this.executor(transaction, () => callback());
  };

  // Handle Network Data Submissions
  this.handleSubmissions = function(networkData) {

    // Establish Separate Behavior
    switch (networkData.networkType) {

    // Primary Behavior
    case 'primary':
      _this.handlePrimary(networkData, () => {});
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.handleAuxiliary(networkData, () => {});
      break;

    // Default Behavior
    default:
      break;
    }
  };
};

module.exports = Network;
