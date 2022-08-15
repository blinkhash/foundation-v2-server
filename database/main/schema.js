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

  // Check if Historical Auxiliary Table Exists in Database
  this.selectHistoricalAuxiliary = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'historical_auxiliary');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Auxiliary Table to Database
  this.createHistoricalAuxiliary = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_auxiliary(
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
      work FLOAT NOT NULL,
      CONSTRAINT historical_auxiliary_unique UNIQUE (worker, solo, height));
    CREATE INDEX historical_auxiliary_miner ON "${ pool }".historical_auxiliary(miner);
    CREATE INDEX historical_auxiliary_worker ON "${ pool }".historical_auxiliary(worker);
    CREATE INDEX historical_auxiliary_identifier ON "${ pool }".historical_auxiliary(identifier);
    CREATE INDEX historical_auxiliary_round ON "${ pool }".historical_auxiliary(solo, height);
    CREATE INDEX historical_auxiliary_historical ON "${ pool }".historical_auxiliary(worker, solo);
    CREATE INDEX historical_auxiliary_combined ON "${ pool }".historical_auxiliary(worker, solo, height);`;
    _this.executor([command], () => callback());
  };

  // Check if Historical Blocks Table Exists in Database
  this.selectHistoricalBlocks = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'historical_blocks');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));

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
      solo BOOLEAN NOT NULL,
      type VARCHAR NOT NULL,
      CONSTRAINT historical_blocks_unique UNIQUE (height, type));
    CREATE INDEX historical_blocks_miner ON "${ pool }".historical_blocks(miner);
    CREATE INDEX historical_blocks_worker ON "${ pool }".historical_blocks(worker);
    CREATE INDEX historical_blocks_identifier ON "${ pool }".historical_blocks(identifier);`;
    _this.executor([command], () => callback());
  };

  // Check if Historical Metadata Table Exists in Database
  this.selectHistoricalMetadata = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'historical_metadata');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Metadata Table to Database
  this.createHistoricalMetadata = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_metadata(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      efficiency FLOAT,
      effort FLOAT,
      hashrate FLOAT,
      invalid INT,
      miners INT,
      stale INT,
      valid INT,
      work FLOAT,
      workers INT);`;
    _this.executor([command], () => callback());
  };

  // Check if Historical Miners Table Exists in Database
  this.selectHistoricalMiners = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'historical_miners');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
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
    _this.executor([command], () => callback());
  };

  // Check if Historical Network Table Exists in Database
  this.selectHistoricalNetwork = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'historical_network');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
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
    _this.executor([command], () => callback());
  };

  // Check if Historical Payments Table Exists in Database
  this.selectHistoricalPayments = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'historical_payments');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
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
    _this.executor([command], () => callback());
  };

  // Check if Historical Primary Table Exists in Database
  this.selectHistoricalPrimary = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'historical_primary');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Primary Table to Database
  this.createHistoricalPrimary = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_primary(
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
      work FLOAT NOT NULL,
      CONSTRAINT historical_primary_unique UNIQUE (worker, solo, height));
    CREATE INDEX historical_primary_miner ON "${ pool }".historical_primary(miner);
    CREATE INDEX historical_primary_worker ON "${ pool }".historical_primary(worker);
    CREATE INDEX historical_primary_identifier ON "${ pool }".historical_primary(identifier);
    CREATE INDEX historical_primary_round ON "${ pool }".historical_primary(solo, height);
    CREATE INDEX historical_primary_historical ON "${ pool }".historical_primary(worker, solo);
    CREATE INDEX historical_primary_combined ON "${ pool }".historical_primary(worker, solo, height);`;
    _this.executor([command], () => callback());
  };

  // Check if Historical Transactions Table Exists in Database
  this.selectHistoricalTransactions = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'historical_transactions');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Transactions Table to Database
  this.createHistoricalTransactions = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".historical_transactions(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      amount FLOAT NOT NULL,
      height INT UNIQUE NOT NULL,
      transaction VARCHAR UNIQUE NOT NULL);
    CREATE INDEX historical_transactions_height ON "${ pool }".historical_transactions(height);
    CREATE INDEX historical_transactions_transaction ON "${ pool }".historical_transactions(transaction);`;
    _this.executor([command], () => callback());
  };

  // Check if Historical Workers Table Exists in Database
  this.selectHistoricalWorkers = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'historical_workers');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
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
    _this.executor([command], () => callback());
  };

  // Check if Pool Auxiliary Table Exists in Database
  this.selectPoolAuxiliary = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'pool_auxiliary');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Auxiliary Table to Database
  this.createPoolAuxiliary = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".pool_auxiliary(
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
      work FLOAT NOT NULL,
      CONSTRAINT pool_auxiliary_unique UNIQUE (worker, solo, height));
    CREATE INDEX pool_auxiliary_miner ON "${ pool }".pool_auxiliary(miner);
    CREATE INDEX pool_auxiliary_worker ON "${ pool }".pool_auxiliary(worker);
    CREATE INDEX pool_auxiliary_identifier ON "${ pool }".pool_auxiliary(identifier);
    CREATE INDEX pool_auxiliary_round ON "${ pool }".pool_auxiliary(worker, solo);
    CREATE INDEX pool_auxiliary_combined ON "${ pool }".pool_auxiliary(worker, solo, height);`;
    _this.executor([command], () => callback());
  };

  // Check if Pool Hashrate Table Exists in Database
  this.selectPoolHashrate = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'pool_hashrate');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
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
    _this.executor([command], () => callback());
  };

  // Check if Pool Metadata Table Exists in Database
  this.selectPoolMetadata = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'pool_metadata');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Metadata Table to Database
  this.createPoolMetadata = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".pool_metadata(
      id BOOLEAN PRIMARY KEY DEFAULT TRUE,
      timestamp BIGINT NOT NULL,
      efficiency FLOAT,
      effort FLOAT,
      hashrate FLOAT,
      invalid INT,
      miners INT,
      stale INT,
      valid INT,
      work FLOAT,
      workers INT,
      CONSTRAINT pool_metadata_locked UNIQUE (id));`;
    _this.executor([command], () => callback());
  };

  // Check if Pool Miners Table Exists in Database
  this.selectPoolMiners = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'pool_miners');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Miners Table to Database
  this.createPoolMiners = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".pool_miners(
      miner VARCHAR PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      efficiency FLOAT NOT NULL,
      effort FLOAT NOT NULL,
      hashrate FLOAT NOT NULL,
      balance FLOAT NOT NULL,
      generate FLOAT NOT NULL,
      immature FLOAT NOT NULL,
      paid FLOAT NOT NULL);`;
    _this.executor([command], () => callback());
  };

  // Check if Pool Primary Table Exists in Database
  this.selectPoolPrimary = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'pool_primary');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Primary Table to Database
  this.createPoolPrimary = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".pool_primary(
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
      work FLOAT NOT NULL,
      CONSTRAINT pool_primary_unique UNIQUE (worker, solo, height));
    CREATE INDEX pool_primary_miner ON "${ pool }".pool_primary(miner);
    CREATE INDEX pool_primary_worker ON "${ pool }".pool_primary(worker);
    CREATE INDEX pool_primary_identifier ON "${ pool }".pool_primary(identifier);
    CREATE INDEX pool_primary_round ON "${ pool }".pool_primary(solo, height);
    CREATE INDEX pool_primary_historical ON "${ pool }".pool_primary(worker, solo);
    CREATE INDEX pool_primary_combined ON "${ pool }".pool_primary(worker, solo, height);`;
    _this.executor([command], () => callback());
  };

  // Check if Pool Workers Table Exists in Database
  this.selectPoolWorkers = function(pool, callback) {
    const command = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = '${ pool }'
      AND table_name = 'pool_workers');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Workers Table to Database
  this.createPoolWorkers = function(pool, callback) {
    const command = `
    CREATE TABLE "${ pool }".pool_workers(
      worker VARCHAR PRIMARY KEY,
      miner VARCHAR NOT NULL,
      timestamp BIGINT NOT NULL,
      efficiency FLOAT NOT NULL,
      effort FLOAT NOT NULL,
      hashrate FLOAT NOT NULL,
      balance FLOAT NOT NULL,
      generate FLOAT NOT NULL,
      immature FLOAT NOT NULL,
      paid FLOAT NOT NULL);`;
    _this.executor([command], () => callback());
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
        .then(() => _this.handlePromises(pool, _this.selectHistoricalAuxiliary, _this.createHistoricalAuxiliary))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalBlocks, _this.createHistoricalBlocks))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalMetadata, _this.createHistoricalMetadata))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalMiners, _this.createHistoricalMiners))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalNetwork, _this.createHistoricalNetwork))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalPayments, _this.createHistoricalPayments))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalPrimary, _this.createHistoricalPrimary))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalTransactions, _this.createHistoricalTransactions))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalWorkers, _this.createHistoricalWorkers))
        .then(() => _this.handlePromises(pool, _this.selectPoolAuxiliary, _this.createPoolAuxiliary))
        .then(() => _this.handlePromises(pool, _this.selectPoolHashrate, _this.createPoolHashrate))
        .then(() => _this.handlePromises(pool, _this.selectPoolMetadata, _this.createPoolMetadata))
        .then(() => _this.handlePromises(pool, _this.selectPoolMiners, _this.createPoolMiners))
        .then(() => _this.handlePromises(pool, _this.selectPoolPrimary, _this.createPoolPrimary))
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
        });
      });
    }, Promise.resolve());
  };
};

module.exports = Schema;
