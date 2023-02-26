const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const Schema = function (logger, executor, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.executor = executor;
  this.text = Text[configMain.language];

  // Check if Schema Exists in Database
  this.selectSchema = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT 1 FROM pg_namespace
        WHERE nspname = '${ pool }');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Schema to Database
  this.createSchema = function(pool, callback) {
    const command = `CREATE SCHEMA IF NOT EXISTS "${ pool }";`;
    _this.executor([command], () => callback());
  };

  // Check if Local Shares Table Exists in Database
  this.selectLocalShares = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'local_shares');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Local Shares Table to Database
  this.createLocalShares = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".local_shares(
        id BIGSERIAL PRIMARY KEY,
        error VARCHAR NOT NULL DEFAULT 'unknown',
        uuid VARCHAR NOT NULL DEFAULT 'unknown',
        timestamp BIGINT NOT NULL DEFAULT -1,
        submitted BIGINT NOT NULL DEFAULT -1,
        ip VARCHAR NOT NULL DEFAULT '0.0.0.0',
        port VARCHAR NOT NULL DEFAULT '0000',
        addrprimary VARCHAR NOT NULL DEFAULT 'unknown',
        addrauxiliary VARCHAR NOT NULL DEFAULT 'unknown',
        blockdiffprimary FLOAT NOT NULL DEFAULT -1,
        blockdiffauxiliary FLOAT NOT NULL DEFAULT -1,
        blockvalid BOOLEAN NOT NULL DEFAULT false,
        blocktype VARCHAR NOT NULL DEFAULT 'share',
        clientdiff FLOAT NOT NULL DEFAULT -1,
        hash VARCHAR NOT NULL DEFAULT 'unknown',
        height INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        reward FLOAT NOT NULL DEFAULT 0,
        sharediff FLOAT NOT NULL DEFAULT -1,
        sharevalid BOOLEAN NOT NULL DEFAULT false,
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        CONSTRAINT local_shares_unique UNIQUE (uuid));`;
    _this.executor([command], () => callback());
  };

  // Check if Local Transactions Table Exists in Database
  this.selectLocalTransactions = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'local_transactions');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Local Transactions Table to Database
  this.createLocalTransactions = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".local_transactions(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        uuid VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT local_transactions_unique UNIQUE (uuid));`;
    _this.executor([command], () => callback());
  };

  // Build Schema Promises for Deployment
  /* istanbul ignore next */
  this.handlePromises = function(pool, checker, deployer) {
    return new Promise((resolve) => {
      checker(pool, (results) => {
        if (results) resolve();
        else deployer(pool, () => resolve());
      });
    });
  };

  // Build Deployment Model for Each Current
  /* istanbul ignore next */
  this.handleDeployment = function(pool) {
    return new Promise((resolve) => {
      _this.handlePromises(pool, _this.selectSchema, _this.createSchema)
        .then(() => _this.handlePromises(pool, _this.selectLocalShares, _this.createLocalShares))
        .then(() => _this.handlePromises(pool, _this.selectLocalTransactions, _this.createLocalTransactions))
        .then(() => resolve());
    });
  };

  // Handle Updating Database Schema
  /* istanbul ignore next */
  this.handleSchema = function(configs, callback) {
    const keys = Object.keys(configs);
    if (keys.length < 1) callback();
    keys.reduce((promise, pool, idx) => {
      return promise.then(() => {
        _this.handleDeployment(pool).then(() => {
          const lastIdx = idx === keys.length - 1;
          const lines = [_this.text.databaseSchemaText2(pool)];
          _this.logger.log('Database', 'Worker', lines);
          if (lastIdx) callback();
        });
      });
    }, Promise.resolve());
  };
};

module.exports = Schema;
