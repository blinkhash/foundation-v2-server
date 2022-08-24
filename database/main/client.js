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
  this.text = Text[configMain.language];

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
    _this.database.connect((error) => {
      if (error) throw new Error(error);
      _this.commands = new Commands(_this.logger, _this.database, _this.configMain);
      callback();
    });
  };
};

module.exports = Client;
