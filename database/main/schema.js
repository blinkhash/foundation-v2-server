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
  this.checkSchema = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = '${ pool }');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Schema to Database
  this.deploySchema = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText1(pool)];
    const command = `CREATE SCHEMA IF NOT EXISTS "${ pool }";`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Historical Blocks Table Exists in Database
  this.checkHistoricalBlocks = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_blocks');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));

  };

  // Deploy Historical Blocks Table to Database
  this.deployHistoricalBlocks = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText2(pool)];
    const command = `CREATE TABLE "${ pool }".historical_blocks(id SERIAL PRIMARY KEY, timestamp BIGINT,
      miner VARCHAR, worker VARCHAR, difficulty DOUBLE PRECISION, hash VARCHAR, identifier VARCHAR,
      luck DOUBLE PRECISION, orphan BOOLEAN, paid BOOLEAN, reward BOOLEAN, round INT, solo BOOLEAN,
      transaction VARCHAR);`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Historical Miners Table Exists in Database
  this.checkHistoricalMiners = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_miners');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Miners Table to Database
  this.deployHistoricalMiners = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText3(pool)];
    const command = `CREATE TABLE "${ pool }".historical_miners(id SERIAL PRIMARY KEY, timestamp BIGINT,
      miner VARCHAR, efficiency DOUBLE PRECISION, hashrate DOUBLE PRECISION);`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Historical Network Table Exists in Database
  this.checkHistoricalNetwork = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_network');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Network Table to Database
  this.deployHistoricalNetwork = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText4(pool)];
    const command = `CREATE TABLE "${ pool }".historical_network(id SERIAL PRIMARY KEY, timestamp BIGINT,
      difficulty DOUBLE PRECISION, hashrate DOUBLE PRECISION);`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Historical Payments Table Exists in Database
  this.checkHistoricalPayments = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_payments');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Payments Table to Database
  this.deployHistoricalPayments = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText5(pool)];
    const command = `CREATE TABLE "${ pool }".historical_payments(id SERIAL PRIMARY KEY, timestamp BIGINT,
      miner VARCHAR, worker VARCHAR, amount DOUBLE PRECISION, transaction VARCHAR);`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Historical Pool Table Exists in Database
  this.checkHistoricalPool = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_pool');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Pool Table to Database
  this.deployHistoricalPool = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText6(pool)];
    const command = `CREATE TABLE "${ pool }".historical_pool(id SERIAL PRIMARY KEY, timestamp BIGINT,
      hashrate DOUBLE PRECISION, effort DOUBLE PRECISION, miners INT, workers INT);`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Historical Transactions Table Exists in Database
  this.checkHistoricalTransactions = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_transactions');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Transactions Table to Database
  this.deployHistoricalTransactions = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText7(pool)];
    const command = `CREATE TABLE "${ pool }".historical_transactions(id SERIAL PRIMARY KEY, timestamp BIGINT,
      miner VARCHAR, amount DOUBLE PRECISION, transaction VARCHAR);`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Historical Workers Table Exists in Database
  this.checkHistoricalWorkers = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'historical_workers');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Historical Workers Table to Database
  this.deployHistoricalWorkers = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText8(pool)];
    const command = `CREATE TABLE "${ pool }".historical_workers(id SERIAL PRIMARY KEY, timestamp BIGINT,
      miner VARCHAR, efficiency DOUBLE PRECISION, hashrate DOUBLE PRECISION);`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Pool Miners Table Exists in Database
  this.checkPoolMiners = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'pool_miners');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Miners Table to Database
  this.deployPoolMiners = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText9(pool)];
    const command = `CREATE TABLE "${ pool }".pool_miners(miner VARCHAR PRIMARY KEY, timestamp BIGINT,
      active BOOLEAN, efficiency DOUBLE PRECISION, generate DOUBLE PRECISION, hashrate DOUBLE PRECISION,
      immature DOUBLE PRECISION, paid DOUBLE PRECISION);`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Pool Workers Table Exists in Database
  this.checkPoolWorkers = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'pool_workers');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Pool Workers Table to Database
  this.deployPoolWorkers = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText10(pool)];
    const command = `CREATE TABLE "${ pool }".pool_workers(worker VARCHAR PRIMARY KEY, miner VARCHAR,
      timestamp BIGINT, active BOOLEAN, efficiency DOUBLE PRECISION, generate DOUBLE PRECISION,
      hashrate DOUBLE PRECISION, immature DOUBLE PRECISION, paid DOUBLE PRECISION);`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Round Current Table Exists in Database
  this.checkRoundCurrent = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'round_current');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Round Current Table to Database
  this.deployRoundCurrent = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText11(pool)];
    const command = `CREATE TABLE "${ pool }".round_current(id SERIAL PRIMARY KEY, timestamp BIGINT,
      miner VARCHAR, worker VARCHAR, difficulty DOUBLE PRECISION, identifier VARCHAR, round INT,
      solo BOOLEAN, times DOUBLE PRECISION);`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Round Hashrate Table Exists in Database
  this.checkRoundHashrate = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'round_hashrate');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Round Hashrate Table to Database
  this.deployRoundHashrate = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText12(pool)];
    const command = `CREATE TABLE "${ pool }".round_hashrate(id SERIAL PRIMARY KEY, timestamp BIGINT,
      miner VARCHAR, worker VARCHAR, difficulty DOUBLE PRECISION);`;
    _this.logger.log('Database', 'Schema', lines);
    _this.executor(command, () => callback());
  };

  // Check if Round Unpaid Table Exists in Database
  this.checkRoundUnpaid = function(pool, callback) {
    const command = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${ pool }' AND table_name = 'round_unpaid');`;
    _this.executor(command, (results) => callback(results.rows[0].exists));
  };

  // Deploy Round Unpaid Table to Database
  this.deployRoundUnpaid = function(pool, callback) {
    const lines = [_this.text.databaseSchemaText13(pool)];
    const command = `CREATE TABLE "${ pool }".round_unpaid(id SERIAL PRIMARY KEY, timestamp BIGINT,
      miner VARCHAR, worker VARCHAR, difficulty DOUBLE PRECISION, identifier VARCHAR, round INT,
      solo BOOLEAN, times DOUBLE PRECISION);`;
    _this.logger.log('Database', 'Schema', lines, true);
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
      _this.handlePromises(pool, _this.checkSchema, _this.deploySchema)
        .then(() => _this.handlePromises(pool, _this.checkHistoricalBlocks, _this.deployHistoricalBlocks))
        .then(() => _this.handlePromises(pool, _this.checkHistoricalMiners, _this.deployHistoricalMiners))
        .then(() => _this.handlePromises(pool, _this.checkHistoricalNetwork, _this.deployHistoricalNetwork))
        .then(() => _this.handlePromises(pool, _this.checkHistoricalPool, _this.deployHistoricalPool))
        .then(() => _this.handlePromises(pool, _this.checkHistoricalTransactions, _this.deployHistoricalTransactions))
        .then(() => _this.handlePromises(pool, _this.checkHistoricalWorkers, _this.deployHistoricalWorkers))
        .then(() => _this.handlePromises(pool, _this.checkPoolMiners, _this.deployPoolMiners))
        .then(() => _this.handlePromises(pool, _this.checkPoolWorkers, _this.deployPoolWorkers))
        .then(() => _this.handlePromises(pool, _this.checkRoundCurrent, _this.deployRoundCurrent))
        .then(() => _this.handlePromises(pool, _this.checkRoundHashrate, _this.deployRoundHashrate))
        .then(() => _this.handlePromises(pool, _this.checkRoundUnpaid, _this.deployRoundUnpaid))
        .then(() => resolve());
    });
  };

  // Handle Updating Database Schema
  this.handleSchema = function(configs, callback) {
    const keys = Object.keys(configs);
    keys.reduce((promise, pool, idx) => {
      if (idx === keys.length - 1) {
        return promise.then(() => _this.handleDeployment(pool)).then(() => callback());
      } else return promise.then(() => _this.handleDeployment(pool));
    }, Promise.resolve());
  };
};

module.exports = Schema;
