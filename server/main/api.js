const Text = require('../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main API Function
const Api = function (logger, client, configs, configMain) {

  console.log(configMain);
  const _this = this;
  this.logger = logger;
  this.client = client;
  this.configs = configs;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // API Variables
  this.executor = _this.client.commands.executor;
  this.current = _this.client.commands.pool;
  this.historical = _this.client.commands.historical;
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
  this.handleApiV2 = function() {};
};

module.exports = Api;
