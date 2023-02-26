const CommandsMaster = require('./master/commands');
const CommandsWorker = require('./worker/commands');
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
  this.text = Text[configMain.language];
  this.timing = [1000, 5000, 30000];

  // Client-Specific Variables
  this.master = { reconnecting: false, retries: 0 };
  this.worker = { reconnecting: false, retries: 0 };

  // Handle Master Retries
  /* istanbul ignore next */
  this.handleRetriesMaster = function(callback) {
    if (_this.master.retries < 3) {
      const lines = [_this.text.databaseCommandsText3(_this.master.retries)];
      _this.logger.error('Database', 'Master', lines);
      setTimeout(() => {
        _this.handleClientMaster(callback);
        _this.master.retries += 1;
      }, _this.timing[_this.master.retries] || 1000);
    } else throw new Error(_this.text.databaseCommandsText6());
  };

  // Handle Worker Retries
  /* istanbul ignore next */
  this.handleRetriesWorker = function(callback) {
    if (_this.worker.retries < 3) {
      const lines = [_this.text.databaseCommandsText3(_this.worker.retries)];
      _this.logger.error('Database', 'Worker', lines);
      setTimeout(() => {
        _this.handleClientWorker(callback);
        _this.worker.retries += 1;
      }, _this.timing[_this.worker.retries] || 1000);
    } else throw new Error(_this.text.databaseCommandsText7());
  };

  // Build Master Postgres Client
  /* istanbul ignore next */
  this.handleClientMaster = function(callback) {

    // Build Connection Options
    const options = {};
    options.host = _this.configMain.client.master.host;
    options.port = _this.configMain.client.master.port;
    options.user = _this.configMain.client.master.username;
    options.password = _this.configMain.client.master.password;
    options.database = _this.configMain.client.master.database;

    // Check if TLS Configuration is Set
    if (_this.configMain.client.tls) {
      options.tls = {};
      options.tls.key = fs.readFileSync(path.join('./certificates', _this.configMain.tls.key)).toString();
      options.tls.cert = fs.readFileSync(path.join('./certificates', _this.configMain.tls.cert)).toString();
      options.tls.ca = fs.readFileSync(path.join('./certificates', _this.configMain.tls.ca)).toString();
    }

    // Build and Assign Database Client
    _this.master.client = new postgres.Client(options);
    _this.master.client.on('error', () => {
      if (!_this.master.reconnecting) {
        _this.master.reconnecting = true;
        _this.master.client = null;
        _this.handleClientMaster(() => {});
      }
    });

    // Build Database Connection
    _this.master.client.connect((error) => {
      if (error) _this.handleRetriesMaster(callback);
      else {
        if (_this.master.reconnecting) {
          const lines = [_this.text.databaseCommandsText4()];
          _this.logger.log('Database', 'Master', lines);
          _this.master.reconnecting = false;
          _this.master.retries = 0;
        }
        _this.master.commands = new CommandsMaster(_this.logger, _this.master.client, _this.configMain);
        callback();
      }
    });
  };

  // Build Worker Postgres Client
  /* istanbul ignore next */
  this.handleClientWorker = function(callback) {

    // Build Connection Options
    const options = {};
    options.host = _this.configMain.client.worker.host;
    options.port = _this.configMain.client.worker.port;
    options.user = _this.configMain.client.worker.username;
    options.password = _this.configMain.client.worker.password;
    options.database = _this.configMain.client.worker.database;

    // Check if TLS Configuration is Set
    if (_this.configMain.client.tls) {
      options.tls = {};
      options.tls.key = fs.readFileSync(path.join('./certificates', _this.configMain.tls.key)).toString();
      options.tls.cert = fs.readFileSync(path.join('./certificates', _this.configMain.tls.cert)).toString();
      options.tls.ca = fs.readFileSync(path.join('./certificates', _this.configMain.tls.ca)).toString();
    }

    // Build and Assign Database Client
    _this.worker.client = new postgres.Client(options);
    _this.worker.client.on('error', () => {
      if (!_this.worker.reconnecting) {
        _this.worker.reconnecting = true;
        _this.worker.client = null;
        _this.handleClientWorker(() => {});
      }
    });

    // Build Database Connection
    _this.worker.client.connect((error) => {
      if (error) _this.handleRetriesWorker(callback);
      else {
        if (_this.worker.reconnecting) {
          const lines = [_this.text.databaseCommandsText5()];
          _this.logger.log('Database', 'Worker', lines);
          _this.worker.reconnecting = false;
          _this.worker.retries = 0;
        }
        _this.worker.commands = new CommandsWorker(_this.logger, _this.worker.client, _this.configMain);
        callback();
      }
    });
  };
};

module.exports = Client;
