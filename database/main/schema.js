const Text = require('../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const Schema = function (logger, configMain, executor) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.executor = executor;
  this.text = Text[configMain.language];

  // Check if Schema Exists in Database
  this.selectSchema = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = '${ pool }');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Schema to Database
  this.createSchema = function(pool, callback) {
    const command = `CREATE SCHEMA IF NOT EXISTS "${ pool }";`;
    _this.executor(command, () => callback());
  };

  // Check if Historical Blocks Table Exists in Database
  this.selectHistoricalBlocks = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_blocks');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));

  };

  // Deploy Historical Blocks Table to Database
  this.createHistoricalBlocks = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_blocks(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      miner VARCHAR NOT NULL,
      worker VARCHAR NOT NULL,
      difficulty FLOAT NOT NULL,
      hash VARCHAR NOT NULL,
      height INT UNIQUE NOT NULL,
      identifier VARCHAR NOT NULL,
      luck FLOAT NOT NULL,
      orphan BOOLEAN NOT NULL,
      paid BOOLEAN NOT NULL,
      reward FLOAT NOT NULL,
      solo BOOLEAN NOT NULL);
    CREATE INDEX historical_blocks_miner ON "${ pool }".historical_blocks(miner);
    CREATE INDEX historical_blocks_worker ON "${ pool }".historical_blocks(worker);
    CREATE INDEX historical_blocks_identifier ON "${ pool }".historical_blocks(identifier);`;
    _this.executor(command, () => callback());
  };

  // Check if Historical Miners Table Exists in Database
  this.selectHistoricalMiners = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_miners');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Miners Table to Database
  this.createHistoricalMiners = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_miners(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      miner VARCHAR NOT NULL,
      efficiency FLOAT,
      hashrate FLOAT NOT NULL);
    CREATE INDEX historical_miners_miner ON "${ pool }".historical_miners(miner);`;
    _this.executor(command, () => callback());
  };

  // Check if Historical Network Table Exists in Database
  this.selectHistoricalNetwork = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_network');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Network Table to Database
  this.createHistoricalNetwork = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_network(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      difficulty FLOAT NOT NULL,
      hashrate FLOAT NOT NULL,
      height INT NOT NULL);`;
    _this.executor(command, () => callback());
  };

  // Check if Historical Payments Table Exists in Database
  this.selectHistoricalPayments = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_payments');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Payments Table to Database
  this.createHistoricalPayments = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_payments(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      miner VARCHAR NOT NULL,
      worker VARCHAR NOT NULL,
      amount FLOAT NOT NULL,
      height INT NOT NULL,
      transaction VARCHAR NOT NULL);
    CREATE INDEX historical_payments_miner ON "${ pool }".historical_payments(miner);
    CREATE INDEX historical_payments_worker ON "${ pool }".historical_payments(worker);
    CREATE INDEX historical_payments_height ON "${ pool }".historical_payments(height);
    CREATE INDEX historical_payments_transaction ON "${ pool }".historical_payments(transaction);`;
    _this.executor(command, () => callback());
  };

  // Check if Historical Pool Table Exists in Database
  this.selectHistoricalPool = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_pool');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Pool Table to Database
  this.createHistoricalPool = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_pool(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      hashrate FLOAT NOT NULL,
      miners INT NOT NULL,
      workers INT NOT NULL);`;
    _this.executor(command, () => callback());
  };


  // Check if Historical Rounds Table Exists in Database
  this.selectHistoricalRounds = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_rounds');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Rounds Table to Database
  this.createHistoricalRounds = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_rounds(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      miner VARCHAR NOT NULL,
      worker VARCHAR NOT NULL,
      height INT NOT NULL,
      identifier VARCHAR NOT NULL,
      invalid INT NOT NULL,
      solo BOOLEAN NOT NULL,
      stale INT NOT NULL,
      times FLOAT NOT NULL,
      valid INT NOT NULL,
      work FLOAT NOT NULL);
    CREATE INDEX historical_rounds_miner ON "${ pool }".historical_rounds(miner);
    CREATE INDEX historical_rounds_worker ON "${ pool }".historical_rounds(worker);
    CREATE INDEX historical_rounds_height ON "${ pool }".historical_rounds(height);
    CREATE INDEX historical_rounds_identifier ON "${ pool }".historical_rounds(identifier);`;
    _this.executor(command, () => callback());
  };

  // Check if Historical Transactions Table Exists in Database
  this.selectHistoricalTransactions = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_transactions');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Transactions Table to Database
  this.createHistoricalTransactions = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_transactions(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      amount FLOAT NOT NULL,
      height INT NOT NULL,
      transaction VARCHAR NOT NULL);
    CREATE INDEX historical_transactions_height ON "${ pool }".historical_transactions(height);
    CREATE INDEX historical_transactions_transaction ON "${ pool }".historical_transactions(transaction);`;
    _this.executor(command, () => callback());
  };

  // Check if Historical Workers Table Exists in Database
  this.selectHistoricalWorkers = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_workers');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Workers Table to Database
  this.createHistoricalWorkers = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_workers(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      miner VARCHAR NOT NULL,
      worker VARCHAR NOT NULL,
      efficiency FLOAT,
      hashrate FLOAT NOT NULL);
    CREATE INDEX historical_workers_miner ON "${ pool }".historical_workers(miner);
    CREATE INDEX historical_workers_worker ON "${ pool }".historical_workers(worker);`;
    _this.executor(command, () => callback());
  };

  // Check if Pool Current Table Exists in Database
  this.selectPoolCurrent = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'pool_current');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Current Table to Database
  this.createPoolCurrent = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".pool_current(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      miner VARCHAR NOT NULL,
      worker VARCHAR UNIQUE NOT NULL,
      height INT,
      identifier VARCHAR NOT NULL,
      invalid INT NOT NULL,
      solo BOOLEAN NOT NULL,
      stale INT NOT NULL,
      times FLOAT NOT NULL,
      valid INT NOT NULL,
      work FLOAT NOT NULL);
    CREATE INDEX pool_current_miner ON "${ pool }".pool_current(miner);
    CREATE INDEX pool_current_worker ON "${ pool }".pool_current(worker);
    CREATE INDEX pool_current_identifier ON "${ pool }".pool_current(identifier);`;
    _this.executor(command, () => callback());
  };

  // Check if Pool Hashrate Table Exists in Database
  this.selectPoolHashrate = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'pool_hashrate');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Hashrate Table to Database
  this.createPoolHashrate = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".pool_hashrate(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      miner VARCHAR NOT NULL,
      worker VARCHAR NOT NULL,
      work FLOAT NOT NULL);`;
    _this.executor(command, () => callback());
  };

  // Check if Pool Miners Table Exists in Database
  this.selectPoolMiners = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'pool_miners');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Miners Table to Database
  this.createPoolMiners = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".pool_miners(
      miner VARCHAR PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      active FLOAT NOT NULL,
      efficiency FLOAT NOT NULL,
      effort FLOAT NOT NULL,
      hashrate FLOAT NOT NULL,
      balance FLOAT NOT NULL,
      generate FLOAT NOT NULL,
      immature FLOAT NOT NULL,
      paid FLOAT NOT NULL);`;
    _this.executor(command, () => callback());
  };

  // Check if Pool Pending Table Exists in Database
  this.selectPoolPending = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'pool_pending');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Pending Table to Database
  this.createPoolPending = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".pool_pending(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      miner VARCHAR NOT NULL,
      worker VARCHAR NOT NULL,
      height INT NOT NULL,
      identifier VARCHAR NOT NULL,
      invalid INT NOT NULL,
      solo BOOLEAN NOT NULL,
      stale INT NOT NULL,
      times FLOAT NOT NULL,
      valid INT NOT NULL,
      work FLOAT NOT NULL);
    CREATE INDEX pool_pending_miner ON "${ pool }".pool_pending(miner);
    CREATE INDEX pool_pending_worker ON "${ pool }".pool_pending(worker);
    CREATE INDEX pool_pending_height ON "${ pool }".pool_pending(height);
    CREATE INDEX pool_pending_identifier ON "${ pool }".pool_pending(identifier);`;
    _this.executor(command, () => callback());
  };

  // Check if Pool Workers Table Exists in Database
  this.selectPoolWorkers = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'pool_workers');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Workers Table to Database
  this.createPoolWorkers = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".pool_workers(
      worker VARCHAR PRIMARY KEY,
      miner VARCHAR NOT NULL,
      timestamp BIGINT NOT NULL,
      active FLOAT NOT NULL,
      efficiency FLOAT NOT NULL,
      effort FLOAT NOT NULL,
      hashrate FLOAT NOT NULL,
      balance FLOAT NOT NULL,
      generate FLOAT NOT NULL,
      immature FLOAT NOT NULL,
      paid FLOAT NOT NULL);`;
    _this.executor(command, () => callback());
  };

  // Build Schema Promises for Deployment
  this.handlePromises = function(pool, checker, deployer) {
    return new Promise((resolve) => {
      checker(pool, (results) => {
        if (results) resolve();
        else deployer(pool, () => resolve());
      });
    });
  };

  // Build Deployment Model for Each Pool
  this.handleDeployment = function(pool) {
    return new Promise((resolve) => {
      _this.handlePromises(pool, _this.selectSchema, _this.createSchema)
        .then(() => _this.handlePromises(pool, _this.selectHistoricalBlocks, _this.createHistoricalBlocks))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalMiners, _this.createHistoricalMiners))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalNetwork, _this.createHistoricalNetwork))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalPayments, _this.createHistoricalPayments))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalPool, _this.createHistoricalPool))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalRounds, _this.createHistoricalRounds))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalTransactions, _this.createHistoricalTransactions))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalWorkers, _this.createHistoricalWorkers))
        .then(() => _this.handlePromises(pool, _this.selectPoolCurrent, _this.createPoolCurrent))
        .then(() => _this.handlePromises(pool, _this.selectPoolHashrate, _this.createPoolHashrate))
        .then(() => _this.handlePromises(pool, _this.selectPoolMiners, _this.createPoolMiners))
        .then(() => _this.handlePromises(pool, _this.selectPoolPending, _this.createPoolPending))
        .then(() => _this.handlePromises(pool, _this.selectPoolWorkers, _this.createPoolWorkers))
        .then(() => resolve());
    });
  };

  // Handle Updating Database Schema
  this.handleSchema = function(configs, callback) {
    const keys = Object.keys(configs);
    keys.reduce((promise, pool, idx) => {
      return promise.then(() => {
        _this.handleDeployment(pool).then(() => {
          const lastIdx = idx === keys.length - 1;
          const lines = [_this.text.databaseSchemaText1(pool)];
          _this.logger.log('Database', 'Schema', lines, lastIdx);
          if (lastIdx) callback();
        })
      });
    }, Promise.resolve());
  };
};

module.exports = Schema;
