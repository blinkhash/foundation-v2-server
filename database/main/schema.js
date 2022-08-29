const Text = require('../../locales/index');

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
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        difficulty FLOAT NOT NULL DEFAULT -1,
        hash VARCHAR NOT NULL DEFAULT 'unknown',
        height INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        luck FLOAT NOT NULL DEFAULT 0,
        orphan BOOLEAN NOT NULL DEFAULT false,
        reward FLOAT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        solo BOOLEAN NOT NULL DEFAULT false,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT historical_blocks_unique UNIQUE (round, type));
      CREATE INDEX historical_blocks_miner ON "${ pool }".historical_blocks(miner, type);
      CREATE INDEX historical_blocks_worker ON "${ pool }".historical_blocks(worker, type);
      CREATE INDEX historical_blocks_identifier ON "${ pool }".historical_blocks(identifier, type);
      CREATE INDEX historical_blocks_type ON "${ pool }".historical_blocks(type);`;
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
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        recent BIGINT NOT NULL DEFAULT -1,
        blocks INT NOT NULL DEFAULT 0,
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        miners INT NOT NULL DEFAULT 0,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        work FLOAT NOT NULL DEFAULT 0,
        workers INT NOT NULL DEFAULT 0,
        CONSTRAINT historical_metadata_recent UNIQUE (recent, type));
      CREATE INDEX historical_metadata_type ON "${ pool }".historical_metadata(type);`;
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
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        recent BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        efficiency FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT historical_miners_recent UNIQUE (recent, miner, type));
      CREATE INDEX historical_miners_miner ON "${ pool }".historical_miners(miner, type);
      CREATE INDEX historical_miners_type ON "${ pool }".historical_miners(type);`;
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
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        recent BIGINT NOT NULL DEFAULT -1,
        difficulty FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        height INT NOT NULL DEFAULT -1,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT historical_network_recent UNIQUE (recent, type));
      CREATE INDEX historical_network_type ON "${ pool }".historical_network(type);`;
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
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        recent BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        amount FLOAT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT historical_payments_recent UNIQUE (recent, miner, type));
      CREATE INDEX historical_payments_miner ON "${ pool }".historical_payments(miner, type);
      CREATE INDEX historical_payments_worker ON "${ pool }".historical_payments(worker, type);
      CREATE INDEX historical_payments_round ON "${ pool }".historical_payments(round, type);
      CREATE INDEX historical_payments_transaction ON "${ pool }".historical_payments(transaction, type);
      CREATE INDEX historical_payments_type ON "${ pool }".historical_payments(type);`;
    _this.executor([command], () => callback());
  };

  // Check if Historical Rounds Table Exists in Database
  this.selectHistoricalRounds = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'historical_rounds');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Rounds Table to Database
  this.createHistoricalRounds = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".historical_rounds(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        round VARCHAR NOT NULL DEFAULT 'unknown',
        identifier VARCHAR NOT NULL DEFAULT 'master',
        invalid INT NOT NULL DEFAULT 0,
        solo BOOLEAN NOT NULL DEFAULT false,
        stale INT NOT NULL DEFAULT 0,
        times FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        work FLOAT NOT NULL DEFAULT 0,
        CONSTRAINT historical_rounds_unique UNIQUE (worker, solo, round, type));
      CREATE INDEX historical_rounds_miner ON "${ pool }".historical_rounds(miner, type);
      CREATE INDEX historical_rounds_worker ON "${ pool }".historical_rounds(worker, type);
      CREATE INDEX historical_rounds_identifier ON "${ pool }".historical_rounds(identifier, type);
      CREATE INDEX historical_rounds_round ON "${ pool }".historical_rounds(solo, round, type);
      CREATE INDEX historical_rounds_historical ON "${ pool }".historical_rounds(worker, solo, type);
      CREATE INDEX historical_rounds_combined ON "${ pool }".historical_rounds(worker, solo, round, type);`;
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
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        amount FLOAT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT historical_transactions_unique UNIQUE (round, type));
      CREATE INDEX historical_transactions_round ON "${ pool }".historical_transactions(round, type);
      CREATE INDEX historical_transactions_transaction ON "${ pool }".historical_transactions(transaction, type);
      CREATE INDEX historical_transactions_type ON "${ pool }".historical_transactions(type);`;
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
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        recent BIGINT UNIQUE NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        efficiency FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT historical_workers_recent UNIQUE (recent, worker, type));
      CREATE INDEX historical_workers_miner ON "${ pool }".historical_workers(miner, type);
      CREATE INDEX historical_workers_worker ON "${ pool }".historical_workers(worker, type);
      CREATE INDEX historical_workers_type ON "${ pool }".historical_workers(type);`;
    _this.executor([command], () => callback());
  };

  // Check if Pool Blocks Table Exists in Database
  this.selectPoolBlocks = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'pool_blocks');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Blocks Table to Database
  this.createPoolBlocks = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".pool_blocks(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        difficulty FLOAT NOT NULL DEFAULT -1,
        hash VARCHAR NOT NULL DEFAULT 'unknown',
        height INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        luck FLOAT NOT NULL DEFAULT 0,
        orphan BOOLEAN NOT NULL DEFAULT false,
        reward FLOAT NOT NULL DEFAULT 0,
        round VARCHAR UNIQUE NOT NULL DEFAULT 'unknown',
        solo BOOLEAN NOT NULL DEFAULT false,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT pool_blocks_unique UNIQUE (round, type));
      CREATE INDEX pool_blocks_miner ON "${ pool }".pool_blocks(miner, type);
      CREATE INDEX pool_blocks_worker ON "${ pool }".pool_blocks(worker, type);
      CREATE INDEX pool_blocks_identifier ON "${ pool }".pool_blocks(identifier, type);
      CREATE INDEX pool_blocks_type ON "${ pool }".pool_blocks(type);`;
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
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        work FLOAT NOT NULL DEFAULT 0);
      CREATE INDEX pool_hashrate_miner ON "${ pool }".pool_hashrate(timestamp, miner, type);
      CREATE INDEX pool_hashrate_worker ON "${ pool }".pool_hashrate(timestamp, worker, type);
      CREATE INDEX pool_hashrate_type ON "${ pool }".pool_hashrate(timestamp, type);`;
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
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        blocks INT NOT NULL DEFAULT 0,
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        miners INT NOT NULL DEFAULT 0,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        work FLOAT NOT NULL DEFAULT 0,
        workers INT NOT NULL DEFAULT 0,
        CONSTRAINT pool_metadata_unique UNIQUE (type));
      CREATE INDEX pool_metadata_type ON "${ pool }".pool_metadata(type);`;
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
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        balance FLOAT NOT NULL DEFAULT 0,
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        generate FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        immature FLOAT NOT NULL DEFAULT 0,
        paid FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT pool_miners_unique UNIQUE (miner, type));
      CREATE INDEX pool_miners_miner ON "${ pool }".pool_miners(miner, type);
      CREATE INDEX pool_miners_type ON "${ pool }".pool_miners(type);`;
    _this.executor([command], () => callback());
  };

  // Check if Pool Rounds Table Exists in Database
  this.selectPoolRounds = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'pool_rounds');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Rounds Table to Database
  this.createPoolRounds = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".pool_rounds(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        identifier VARCHAR NOT NULL DEFAULT 'master',
        invalid INT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'current',
        solo BOOLEAN NOT NULL DEFAULT false,
        stale INT NOT NULL DEFAULT 0,
        times FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        work FLOAT NOT NULL DEFAULT 0,
        CONSTRAINT pool_rounds_unique UNIQUE (worker, solo, round, type));
      CREATE INDEX pool_rounds_miner ON "${ pool }".pool_rounds(miner, type);
      CREATE INDEX pool_rounds_worker ON "${ pool }".pool_rounds(worker, type);
      CREATE INDEX pool_rounds_identifier ON "${ pool }".pool_rounds(identifier, type);
      CREATE INDEX pool_rounds_round ON "${ pool }".pool_rounds(solo, round, type);
      CREATE INDEX pool_rounds_historical ON "${ pool }".pool_rounds(worker, solo, type);
      CREATE INDEX pool_rounds_combined ON "${ pool }".pool_rounds(worker, solo, round, type);`;
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
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        balance FLOAT NOT NULL DEFAULT 0,
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        generate FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        immature FLOAT NOT NULL DEFAULT 0,
        paid FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT pool_workers_unique UNIQUE (worker, type));
      CREATE INDEX pool_workers_miner ON "${ pool }".pool_workers(miner, type);
      CREATE INDEX pool_workers_worker ON "${ pool }".pool_workers(worker, type);
      CREATE INDEX pool_workers_type ON "${ pool }".pool_workers(type);`;
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

  // Build Deployment Model for Each Pool
  /* istanbul ignore next */
  this.handleDeployment = function(pool) {
    return new Promise((resolve) => {
      _this.handlePromises(pool, _this.selectSchema, _this.createSchema)
        .then(() => _this.handlePromises(pool, _this.selectHistoricalBlocks, _this.createHistoricalBlocks))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalMetadata, _this.createHistoricalMetadata))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalMiners, _this.createHistoricalMiners))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalNetwork, _this.createHistoricalNetwork))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalPayments, _this.createHistoricalPayments))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalRounds, _this.createHistoricalRounds))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalTransactions, _this.createHistoricalTransactions))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalWorkers, _this.createHistoricalWorkers))
        .then(() => _this.handlePromises(pool, _this.selectPoolBlocks, _this.createPoolBlocks))
        .then(() => _this.handlePromises(pool, _this.selectPoolHashrate, _this.createPoolHashrate))
        .then(() => _this.handlePromises(pool, _this.selectPoolMetadata, _this.createPoolMetadata))
        .then(() => _this.handlePromises(pool, _this.selectPoolMiners, _this.createPoolMiners))
        .then(() => _this.handlePromises(pool, _this.selectPoolRounds, _this.createPoolRounds))
        .then(() => _this.handlePromises(pool, _this.selectPoolWorkers, _this.createPoolWorkers))
        .then(() => resolve());
    });
  };

  // Handle Updating Database Schema
  /* istanbul ignore next */
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
