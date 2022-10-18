const Commands = require('./commands');
const Text = require('../../locales/index');
const fs = require('fs');
const path = require('path');
const postgres = require('pg');

////////////////////////////////////////////////////////////////////////////////

// Main Shares Function
const Client = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.reconnecting = false;
  this.retries = 0;
  this.text = Text[configMain.language];
  this.timing = [1000, 5000, 30000];

  // Handle Retry
  /* istanbul ignore next */
  this.handleRetries = function(callback) {
    if (_this.retries < 3) {
      const lines = [_this.text.databaseCommandsText3(_this.retries)];
      _this.logger.error('Database', 'Client', lines);
      setTimeout(() => {
        _this.handleClient(callback);
        _this.retries += 1;
      }, _this.timing[_this.retries] || 1000);
    } else throw new Error(_this.text.databaseCommandsText5());
  };

  // Build Postgres Client
  /* istanbul ignore next */
  this.handleClient = function(callback) {

    // Build Connection Options
    const options = {};
    options.host = _this.configMain.client.host;
    options.port = _this.configMain.client.port;
    options.user = _this.configMain.client.username;
    options.password = _this.configMain.client.password;
    options.database = _this.configMain.client.database;

    // Check if TLS Configuration is Set
    if (_this.configMain.client.tls) {
      options.tls = {};
      options.tls.key = fs.readFileSync(path.join('./certificates', _this.configMain.tls.key)).toString();
      options.tls.cert = fs.readFileSync(path.join('./certificates', _this.configMain.tls.cert)).toString();
      options.tls.ca = fs.readFileSync(path.join('./certificates', _this.configMain.tls.ca)).toString();
    }

    // Build and Assign Database Client
    _this.database = new postgres.Client(options);
    _this.database.on('error', () => {
      if (!_this.reconnecting) {
        _this.reconnecting = true;
        _this.database = null;
        _this.handleClient(() => {});
      }
    });

    // Build Database Connection
    _this.database.connect((error) => {
      if (error) _this.handleRetries(callback);
      else {
        if (_this.reconnecting) {
          const lines = [_this.text.databaseCommandsText4()];
          _this.logger.log('Database', 'Client', lines);
          _this.reconnecting = false;
          _this.retries = 0;
        }
        _this.commands = new Commands(_this.logger, _this.database, _this.configMain);
        callback();
      }
    });
  };
};

module.exports = Client;
