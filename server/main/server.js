const Api = require('./api');
const Text = require('../../locales/index');
const apicache = require('apicache');
const bodyParser = require('body-parser');
const compress = require('compression');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const rateLimit = require('express-rate-limit');

////////////////////////////////////////////////////////////////////////////////

// Main Server Function
const Server = function (logger, client) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.configs = JSON.parse(process.env.configs);
  this.configMain = JSON.parse(process.env.configMain);
  this.text = Text[_this.configMain.language];

  // Server Variables
  process.setMaxListeners(0);

  // Handle Errors with API Responses
  this.handleErrors = function(api, error, res) {
    const lines = [_this.text.websiteErrorText1(error)];
    _this.logger.error('Server', 'Website', lines);
    api.buildResponse(500, _this.text.websiteErrorText2(), res);
  };

  // Build Server w/ Middleware
  this.buildServer = function() {

    // Build Main Server
    const app = express();
    const api = new Api(_this.logger, _this.client, _this.configs, _this.configMain);
    const limiter = rateLimit({
      windowMs: _this.configMain.server.limiter.window,
      max: _this.configMain.server.limiter.maximum });
    const cache = apicache.options({}).middleware;

    // Establish Middleware [1]
    app.set('trust proxy', 1);
    app.use(bodyParser.json());
    app.use(compress());
    app.use(cors());

    // Establish Middleware [2]
    const timing = _this.configMain.server.cache.timing;
    if (_this.configMain.server.limiter.enabled) app.use(limiter);
    if (_this.configMain.server.cache.enabled) app.use(cache(timing));

    // Handle API Requests
    /* istanbul ignore next */
    app.get('/api/v2/:pool/:category/:endpoint', (req, res) => {
      api.handleApiV2(req, (code, message) => {
        api.buildResponse(code, message, res);
      });
    });

    // Handles API Errors
    /* istanbul ignore next */
    /* eslint-disable-next-line no-unused-vars */
    app.use((err, req, res, next) => {
      _this.handleErrors(api, err, res);
    });

    // Handle Health Check
    /* istanbul ignore next */
    app.get('/health/', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 'status': 'OK' }));
    });

    // Set Existing Server Variable
    /* istanbul ignore next */
    if (_this.configMain.server.tls) {
      const options = {
        key: fs.readFileSync(path.join('./certificates', _this.configMain.tls.key)),
        cert: fs.readFileSync(path.join('./certificates', _this.configMain.tls.cert))};
      const lines = [_this.text.websiteStartingText1()];
      _this.logger.debug('Server', 'Website', lines);
      this.server = https.createServer(options, app);
    } else this.server = http.createServer(app);
  };

  // Start Worker Capabilities
  this.setupServer = function(callback) {
    _this.buildServer();
    _this.server.listen(_this.configMain.server.port, _this.configMain.server.host, () => {
      const lines = [_this.text.websiteStartingText2(_this.configMain.server.host, _this.configMain.server.port)];
      _this.logger.log('Server', 'Website', lines, true);
      callback();
    });
  };
};

module.exports = Server;
