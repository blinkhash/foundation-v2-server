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
  this.current = _this.client.commands.current;

  // Handle Current Network Updates
  this.handleCurrentNetwork = function(network, networkType) {

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
    const networkUpdates = _this.handleCurrentNetwork(network, 'primary');
    const transaction = [
      'BEGIN;',
      _this.current.network.insertCurrentNetworkMain(_this.pool, [networkUpdates]),
      'COMMIT'];

    // Insert Work into Database
    _this.executor(transaction, () => callback());
  };

  // Handle Primary Updates
  this.handleAuxiliary = function(network, callback) {

    // Build Combined Transaction
    const networkUpdates = _this.handleCurrentNetwork(network, 'auxiliary');
    const transaction = [
      'BEGIN;',
      _this.current.network.insertCurrentNetworkMain(_this.pool, [networkUpdates]),
      'COMMIT'];

    // Insert Work into Database
    _this.executor(transaction, () => callback());
  };

  // Handle Network Data Submissions
  this.handleSubmissions = function(networkData, callback) {

    // Establish Separate Behavior
    switch (networkData.networkType) {

    // Primary Behavior
    case 'primary':
      _this.handlePrimary(networkData, () => callback());
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.handleAuxiliary(networkData, () => callback());
      break;

    // Default Behavior
    default:
      callback();
      break;
    }
  };
};

module.exports = Network;
