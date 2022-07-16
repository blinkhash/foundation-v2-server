const Text = require('../../locales/index');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const redis = require('redis');

////////////////////////////////////////////////////////////////////////////////

// Main Shares Function
const Client = function (configMain) {

  const _this = this;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Check Redis Client
  this.checkRedisClient = function() {
    _this.database.info((error, response) => {
      if (error) {
        throw new Error(_this.text.databaseClientText1());
        return;
      }
      let version;
      const settings = response.split('\r\n');
      settings.forEach(line => {
        if (line.indexOf('redis_version') !== -1) {
          version = parseFloat(line.split(':')[1]);
          return;
        }
      });
      if (!version || version <= 2.6) {
        throw new Error(_this.text.databaseClientText2());
      }
    });
  };

  // Build Database Client
  this.checkClient = function() {

    // Check Type of Database to Initialize
    switch (_this.configMain.client.type) {
    case 'mysql':
      break;
    case 'redis':
      _this.checkRedisClient();
      break;
    default:
      throw new Error(_this.text.databaseClientText3());
      break;
    }
  }

  // Build MySQL Client
  this.handleMySQLClient = function() {

    // Build Connection Options
    const options = {};
    options.host = _this.configMain.client.host;
    options.port = _this.configMain.client.port;
    options.user = _this.configMain.client.username;
    options.password = _this.configMain.client.password;
    options.database = _this.configMain.client.database;

    // Check if TLS Configuration is Set
    if (_this.configMain.client.tls) {
      options.ssl = {};
      options.ssl.key = fs.readFileSync(path.join('./certificates', _this.configMain.tls.key));
      options.ssl.cert = fs.readFileSync(path.join('./certificates', _this.configMain.tls.cert));
      options.ssl.ca = fs.readFileSync(path.join('./certificates', _this.configMain.tls.ca));
    }

    // Build and Assign Database Client
    _this.database = mysql.createConnection(options);
    _this.database.connect();
  };

  // Build Redis Client
  this.handleRedisClient = function() {

    // Build Connection Options
    const options = {};
    options.host = _this.configMain.client.host;
    options.port = _this.configMain.client.port;

    // Check if Authentication is Set
    if (_this.configMain.client.password !== '') {
      options.password = _this.configMain.client.password;
    }

    // Check if TLS Configuration is Set
    if (_this.configMain.client.tls) {
      options.tls = {};
      options.tls.key = fs.readFileSync(path.join('./certificates', _this.configMain.tls.key));
      options.tls.cert = fs.readFileSync(path.join('./certificates', _this.configMain.tls.cert));
      options.tls.ca = fs.readFileSync(path.join('./certificates', _this.configMain.tls.ca));
    }

    // Build and Assign Database Client
    _this.database = redis.createClient(options);
  };

  // Build Database Client
  this.handleClient = function() {

    // Check Type of Database to Initialize
    switch (_this.configMain.client.type) {
    case 'mysql':
      _this.handleMySQLClient();
      break;
    case 'redis':
      _this.handleRedisClient();
      break;
    default:
      throw new Error(_this.text.databaseClientText3());
      break;
    }
  }
}

module.exports = Client;
