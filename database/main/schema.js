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

  // Check if Foreign Data Wrapper Extension Enabled
  this.selectExtension = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT * FROM pg_extension
        WHERE extname = 'postgres_fdw');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Check if Foreign Data Wrapper Extension Enabled
  this.createExtension = function(pool, callback) {
    const command = `
      CREATE EXTENSION IF NOT EXISTS postgres_fdw SCHEMA "${ pool }";`;
    _this.executor([command], () => callback());
  };
  
  // Check if Foreign Data Wrapper Server Exists
  this.selectServer = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT * FROM pg_foreign_server
        WHERE srvname = 'zoneware_bridge');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Create Foreign Data Wrapper Server
  this.createServer = function(pool, callback) {
    const command = `
      CREATE SERVER IF NOT EXISTS zoneware_bridge
        FOREIGN DATA WRAPPER postgres_fdw
        OPTIONS (host '${ configMain.zoneware.host }', dbname '${ configMain.zoneware.database }');`;
    _this.executor([command], () => callback());
  };

  // Check if User Mapping Exists
  this.selectUserMapping = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT * FROM pg_user_mapping maps 
        JOIN pg_catalog.pg_user users 
        ON maps.umuser = users.usesysid
        WHERE usename = '${ configMain.client.username}');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Create User Mapping
  this.createUserMapping = function(pool, callback) {
    const command = `
      CREATE USER MAPPING IF NOT EXISTS FOR ${ configMain.client.username}
        SERVER zoneware_bridge
        OPTIONS (user '${ configMain.zoneware.username }', password '${ configMain.zoneware.password }');`;
    _this.executor([command], () => callback());
  };

  // Check if Foreign Tables Exists in Database
  this.selectForeignSchema = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'users'
        OR table_name = 'foundation_shares');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Import Foreign Schema to Database
  this.createForeignSchema = function(pool, callback) {
    const command = `
      IMPORT FOREIGN SCHEMA "${ pool }"
        LIMIT TO (users, foundation_shares)
        FROM SERVER zoneware_bridge INTO "${ pool }";`;
    _this.executor([command], () => callback());
  };

  // Check if Current Blocks Table Exists in Database
  this.selectCurrentBlocks = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'current_blocks');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Current Blocks Table to Database
  this.createCurrentBlocks = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".current_blocks(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        submitted BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        category VARCHAR NOT NULL DEFAULT 'pending',
        confirmations INT NOT NULL DEFAULT -1,
        difficulty FLOAT NOT NULL DEFAULT -1,
        hash VARCHAR NOT NULL DEFAULT 'unknown',
        height INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        luck FLOAT NOT NULL DEFAULT 0,
        reward FLOAT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        solo BOOLEAN NOT NULL DEFAULT false,
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT current_blocks_unique UNIQUE (round, type));
      CREATE INDEX current_blocks_miner ON "${ pool }".current_blocks(miner, type);
      CREATE INDEX current_blocks_worker ON "${ pool }".current_blocks(worker, type);
      CREATE INDEX current_blocks_category ON "${ pool }".current_blocks(category, type);
      CREATE INDEX current_blocks_identifier ON "${ pool }".current_blocks(identifier, type);
      CREATE INDEX current_blocks_type ON "${ pool }".current_blocks(type);`;
    _this.executor([command], () => callback());
  };

  // Check if Current Hashrate Table Exists in Database
  this.selectCurrentHashrate = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'current_hashrate');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Current Hashrate Table to Database
  this.createCurrentHashrate = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".current_hashrate(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        ip_hash VARCHAR NOT NULL DEFAULT 'unknown',
        last_octet INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        share VARCHAR NOT NULL DEFAULT 'unknown',
        solo BOOLEAN NOT NULL DEFAULT false,
        type VARCHAR NOT NULL DEFAULT 'primary',
        work FLOAT NOT NULL DEFAULT 0);
      CREATE INDEX current_hashrate_miner ON "${ pool }".current_hashrate(timestamp, miner, solo, type);
      CREATE INDEX current_hashrate_worker ON "${ pool }".current_hashrate(timestamp, worker, solo, type);
      CREATE INDEX current_hashrate_type ON "${ pool }".current_hashrate(timestamp, solo, type);`;
    _this.executor([command], () => callback());
  };

  // Check if Current Metadata Table Exists in Database
  this.selectCurrentMetadata = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'current_metadata');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Current Metadata Table to Database
  this.createCurrentMetadata = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".current_metadata(
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
        CONSTRAINT current_metadata_unique UNIQUE (type));
      CREATE INDEX current_metadata_type ON "${ pool }".current_metadata(type);`;
    _this.executor([command], () => callback());
  };

  // Check if Current Miners Table Exists in Database
  this.selectCurrentMiners = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'current_miners');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Current Miners Table to Database
  this.createCurrentMiners = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".current_miners(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        balance FLOAT NOT NULL DEFAULT 0,
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        generate FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        immature FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        paid FLOAT NOT NULL DEFAULT 0,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        CONSTRAINT current_miners_unique UNIQUE (miner, type));
      CREATE INDEX current_miners_balance ON "${ pool }".current_miners(balance, type);
      CREATE INDEX current_miners_miner ON "${ pool }".current_miners(miner, type);
      CREATE INDEX current_miners_type ON "${ pool }".current_miners(type);`;
    _this.executor([command], () => callback());
  };

  // Check if Current Network Table Exists in Database
  this.selectCurrentNetwork = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'current_network');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Network Table to Database
  this.createCurrentNetwork = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".current_network(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        difficulty FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        height INT NOT NULL DEFAULT -1,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT current_network_unique UNIQUE (type));
      CREATE INDEX current_network_type ON "${ pool }".current_network(type);`;
    _this.executor([command], () => callback());
  };

  // Check if Current Payments Table Exists in Database
  this.selectCurrentPayments = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'current_payments');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Current Payments Table to Database
  this.createCurrentPayments = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".current_payments(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT current_payments_unique UNIQUE (round, type));
      CREATE INDEX current_payments_type ON "${ pool }".current_payments(type);`;
    _this.executor([command], () => callback());
  };

  // Check if Current Rounds Table Exists in Database
  this.selectCurrentRounds = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'current_rounds');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Current Rounds Table to Database
  this.createCurrentRounds = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".current_rounds(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        recent BIGINT NOT NULL DEFAULT -1,
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
        CONSTRAINT current_rounds_unique UNIQUE (recent, worker, solo, round, type));
      CREATE INDEX current_rounds_miner ON "${ pool }".current_rounds(miner, type);
      CREATE INDEX current_rounds_worker ON "${ pool }".current_rounds(worker, type);
      CREATE INDEX current_rounds_identifier ON "${ pool }".current_rounds(identifier, type);
      CREATE INDEX current_rounds_round ON "${ pool }".current_rounds(solo, round, type);
      CREATE INDEX current_rounds_historical ON "${ pool }".current_rounds(worker, solo, type);
      CREATE INDEX current_rounds_combined ON "${ pool }".current_rounds(worker, solo, round, type);`;
    _this.executor([command], () => callback());
  };

  // Check if Current Transactions Table Exists in Database
  this.selectCurrentTransactions = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'current_transactions');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Current Transactions Table to Database
  this.createCurrentTransactions = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".current_transactions(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT current_transactions_unique UNIQUE (round, type));
      CREATE INDEX current_transactions_type ON "${ pool }".current_transactions(type);`;
    _this.executor([command], () => callback());
  };

  // Check if Current Workers Table Exists in Database
  this.selectCurrentWorkers = function(pool, callback) {
    const command = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${ pool }'
        AND table_name = 'current_workers');`;
    _this.executor([command], (results) => callback(results.rows[0].exists));
  };

  // Deploy Current Workers Table to Database
  this.createCurrentWorkers = function(pool, callback) {
    const command = `
      CREATE TABLE "${ pool }".current_workers(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        solo BOOLEAN NOT NULL DEFAULT false,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        CONSTRAINT current_workers_unique UNIQUE (worker, solo, type));
      CREATE INDEX current_workers_miner ON "${ pool }".current_workers(miner, type);
      CREATE INDEX current_workers_solo ON "${ pool }".current_workers(solo, type);
      CREATE INDEX current_workers_worker ON "${ pool }".current_workers(worker, type);
      CREATE INDEX current_workers_type ON "${ pool }".current_workers(type);`;
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
        submitted BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        category VARCHAR NOT NULL DEFAULT 'pending',
        confirmations INT NOT NULL DEFAULT -1,
        difficulty FLOAT NOT NULL DEFAULT -1,
        hash VARCHAR NOT NULL DEFAULT 'unknown',
        height INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        luck FLOAT NOT NULL DEFAULT 0,
        reward FLOAT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        solo BOOLEAN NOT NULL DEFAULT false,
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT historical_blocks_unique UNIQUE (round, type));
      CREATE INDEX historical_blocks_miner ON "${ pool }".historical_blocks(miner, type);
      CREATE INDEX historical_blocks_worker ON "${ pool }".historical_blocks(worker, type);
      CREATE INDEX historical_blocks_category ON "${ pool }".historical_blocks(category, type);
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
        effort FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
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
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        amount FLOAT NOT NULL DEFAULT 0,
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary');
      CREATE INDEX historical_payments_miner ON "${ pool }".historical_payments(miner, type);
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
        identifier VARCHAR NOT NULL DEFAULT 'master',
        invalid INT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'unknown',
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
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary');
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
        recent BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        solo BOOLEAN NOT NULL DEFAULT false,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        CONSTRAINT historical_workers_recent UNIQUE (recent, worker, type));
      CREATE INDEX historical_workers_miner ON "${ pool }".historical_workers(miner, type);
      CREATE INDEX historical_workers_worker ON "${ pool }".historical_workers(worker, type);
      CREATE INDEX historical_workers_type ON "${ pool }".historical_workers(type);`;
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
        // Setup Database
        .then(() => _this.handlePromises(pool, _this.selectExtension, _this.createExtension))
        .then(() => _this.handlePromises(pool, _this.selectServer, _this.createServer))
        .then(() => _this.handlePromises(pool, _this.selectUserMapping, _this.createUserMapping))
        .then(() => _this.handlePromises(pool, _this.selectForeignSchema, _this.createForeignSchema))  

        // Create Tables
        .then(() => _this.handlePromises(pool, _this.selectCurrentBlocks, _this.createCurrentBlocks))
        .then(() => _this.handlePromises(pool, _this.selectCurrentHashrate, _this.createCurrentHashrate))
        .then(() => _this.handlePromises(pool, _this.selectCurrentMetadata, _this.createCurrentMetadata))
        .then(() => _this.handlePromises(pool, _this.selectCurrentMiners, _this.createCurrentMiners))
        .then(() => _this.handlePromises(pool, _this.selectCurrentNetwork, _this.createCurrentNetwork))
        .then(() => _this.handlePromises(pool, _this.selectCurrentPayments, _this.createCurrentPayments))
        .then(() => _this.handlePromises(pool, _this.selectCurrentRounds, _this.createCurrentRounds))
        .then(() => _this.handlePromises(pool, _this.selectCurrentTransactions, _this.createCurrentTransactions))
        .then(() => _this.handlePromises(pool, _this.selectCurrentWorkers, _this.createCurrentWorkers))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalBlocks, _this.createHistoricalBlocks))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalMetadata, _this.createHistoricalMetadata))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalMiners, _this.createHistoricalMiners))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalNetwork, _this.createHistoricalNetwork))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalPayments, _this.createHistoricalPayments))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalRounds, _this.createHistoricalRounds))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalTransactions, _this.createHistoricalTransactions))
        .then(() => _this.handlePromises(pool, _this.selectHistoricalWorkers, _this.createHistoricalWorkers))
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
          const lines = [_this.text.databaseSchemaText1(pool)];
          _this.logger.log('Database', 'Schema', lines);
          if (lastIdx) callback();
        });
      });
    }, Promise.resolve());
  };
};

module.exports = Schema;
