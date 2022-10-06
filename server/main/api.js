const Endpoints = require('./endpoints');
const Text = require('../../locales/index');
const utils = require('./utils');

////////////////////////////////////////////////////////////////////////////////

// Main API Function
const Api = function (logger, client, configs, configMain) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.configs = configs;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // API Variables
  this.endpoints = new Endpoints(logger, client, configMain);
  this.headers = {
    'Access-Control-Allow-Headers' : 'Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Allow-Methods',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json'
  };

  // Build API Payload for each Endpoint
  this.buildResponse = function(code, message, response) {
    const payload = {
      version: '0.0.1',
      statusCode: code,
      headers: _this.headers,
      body: message,
    };
    response.writeHead(code, _this.headers);
    response.end(JSON.stringify(payload));
  };

  // Determine API Endpoint Called
  this.handleApiV2 = function(req, callback) {

    // Handle Parameters
    const queries = req.query || {};
    const output = (code, message) => callback(code, message);
    const pool = utils.validateParameters((req.params || {}).pool || '');
    const category = utils.validateParameters((req.params || {}).category || '');
    const endpoint = utils.validateParameters((req.params || {}).endpoint || '');

    // Check if Requested Pool Exists
    if (!(pool in _this.configs) && pool !== 'pools') {
      callback(404, _this.text.websiteErrorText3());
      return;
    }

    // Select Endpoint from Parameters
    switch (true) {

    // Current Endpoints
    case (category === 'current' && endpoint === 'blocks'):
      _this.endpoints.handleCurrentBlocks(pool, queries, output);
      break;
    case (category === 'current' && endpoint === 'hashrate'):
      _this.endpoints.handleCurrentHashrate(pool, queries, output);
      break;
    case (category === 'current' && endpoint === 'metadata'):
      _this.endpoints.handleCurrentMetadata(pool, queries, output);
      break;
    case (category === 'current' && endpoint === 'miners'):
      _this.endpoints.handleCurrentMiners(pool, queries, output);
      break;
    case (category === 'current' && endpoint === 'network'):
      _this.endpoints.handleCurrentNetwork(pool, queries, output);
      break;
    case (category === 'current' && endpoint === 'payments'):
      _this.endpoints.handleCurrentPayments(pool, queries, output);
      break;
    case (category === 'current' && endpoint === 'ports'):
      callback(200, _this.configs[pool].ports);
      break;
    case (category === 'current' && endpoint === 'rounds'):
      _this.endpoints.handleCurrentRounds(pool, queries, output);
      break;
    case (category === 'current' && endpoint === 'transactions'):
      _this.endpoints.handleCurrentTransactions(pool, queries, output);
      break;
    case (category === 'current' && endpoint === 'workers'):
      _this.endpoints.handleCurrentWorkers(pool, queries, output);
      break;

    // Historical Endpoints
    case (category === 'historical' && endpoint === 'blocks'):
      _this.endpoints.handleHistoricalBlocks(pool, queries, output);
      break;
    case (category === 'historical' && endpoint === 'metadata'):
      _this.endpoints.handleHistoricalMetadata(pool, queries, output);
      break;
    case (category === 'historical' && endpoint === 'miners'):
      _this.endpoints.handleHistoricalMiners(pool, queries, output);
      break;
    case (category === 'historical' && endpoint === 'network'):
      _this.endpoints.handleHistoricalNetwork(pool, queries, output);
      break;
    case (category === 'historical' && endpoint === 'payments'):
      _this.endpoints.handleHistoricalPayments(pool, queries, output);
      break;
    case (category === 'historical' && endpoint === 'rounds'):
      _this.endpoints.handleHistoricalRounds(pool, queries, output);
      break;
    case (category === 'historical' && endpoint === 'transactions'):
      _this.endpoints.handleHistoricalTransactions(pool, queries, output);
      break;
    case (category === 'historical' && endpoint === 'workers'):
      _this.endpoints.handleHistoricalWorkers(pool, queries, output);
      break;

    // Miscellaneous Endpoints
    case (Object.keys(_this.configs).includes(pool) && category === '' && endpoint === ''):
      _this.endpoints.handleCurrentMetadata(pool, queries, output);
      break;
    case (pool === 'pools' && category === '' && endpoint === ''):
      callback(200, Object.keys(_this.configs));
      break;

    // Unknown Endpoints
    default:
      callback(405, _this.text.websiteErrorText4());
      break;
    }
  };
};

module.exports = Api;
