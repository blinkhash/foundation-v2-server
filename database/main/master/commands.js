const Schema = require('./schema');
const Text = require('../../../locales/index');

// Current Table Commands
const CurrentBlocks = require('./current/blocks');
const CurrentHashrate = require('./current/hashrate');
const CurrentMetadata = require('./current/metadata');
const CurrentMiners = require('./current/miners');
const CurrentNetwork = require('./current/network');
const CurrentPayments = require('./current/payments');
const CurrentRounds = require('./current/rounds');
const CurrentTransactions = require('./current/transactions');
const CurrentWorkers = require('./current/workers');

// Historical Table Commands
const HistoricalBlocks = require('./historical/blocks');
const HistoricalMetadata = require('./historical/metadata');
const HistoricalMiners = require('./historical/miners');
const HistoricalNetwork = require('./historical/network');
const HistoricalPayments = require('./historical/payments');
const HistoricalRounds = require('./historical/rounds');
const HistoricalTransactions = require('./historical/transactions');
const HistoricalWorkers = require('./historical/workers');

////////////////////////////////////////////////////////////////////////////////

// Main Command Function
const Commands = function (logger, client, configMain) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.configMain = configMain;
  this.text = Text[configMain.language];
  this.timing = [1000, 5000, 30000];

  // Database Table Structure
  this.current = {};
  this.historical = {};
  this.retries = 0;

  // Execute Commands
  /* eslint-disable */
  this.executor = function(commands, callback) {
    const query = commands.join(' ')
    _this.client.query(query, (error, results) => {
      if (error) _this.retry(commands, error, callback);
      else callback(results);
    });
  };

  // Handle Retries
  this.retry = function(commands, error, callback) {
    if (_this.retries < 3) {
      const lines = [_this.text.databaseCommandsText3(_this.retries)];
      _this.logger.error('Database', 'Master', lines);
      setTimeout(() => {
        _this.executor(commands, callback);
        _this.retries += 1;
      }, _this.timing[_this.retries] || 1000);
    } else throw new Error(error);
  };

  // Build Out Schema Generation
  this.schema = new Schema(_this.logger, _this.executor, _this.configMain);

  // Initialize Historical Commands
  this.historical.blocks = new HistoricalBlocks(_this.logger, _this.configMain);
  this.historical.metadata = new HistoricalMetadata(_this.logger, _this.configMain);
  this.historical.miners = new HistoricalMiners(_this.logger, _this.configMain);
  this.historical.network = new HistoricalNetwork(_this.logger, _this.configMain);
  this.historical.payments = new HistoricalPayments(_this.logger, _this.configMain);
  this.historical.rounds = new HistoricalRounds(_this.logger, _this.configMain);
  this.historical.transactions = new HistoricalTransactions(_this.logger, _this.configMain);
  this.historical.workers = new HistoricalWorkers(_this.logger, _this.configMain);

  // Initialize Current Commands
  this.current.blocks = new CurrentBlocks(_this.logger, _this.configMain);
  this.current.hashrate = new CurrentHashrate(_this.logger, _this.configMain);
  this.current.metadata = new CurrentMetadata(_this.logger, _this.configMain);
  this.current.miners = new CurrentMiners(_this.logger, _this.configMain);
  this.current.network = new CurrentNetwork(_this.logger, _this.configMain);
  this.current.payments = new CurrentPayments(_this.logger, _this.configMain);
  this.current.rounds = new CurrentRounds(_this.logger, _this.configMain);
  this.current.transactions = new CurrentTransactions(_this.logger, _this.configMain);
  this.current.workers = new CurrentWorkers(_this.logger, _this.configMain);
};

module.exports = Commands;
