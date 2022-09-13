const Schema = require('./schema');
const Text = require('../../locales/index');

// Historical Table Commands
const HistoricalBlocks = require('./historical/blocks');
const HistoricalMetadata = require('./historical/metadata');
const HistoricalMiners = require('./historical/miners');
const HistoricalNetwork = require('./historical/network');
const HistoricalPayments = require('./historical/payments');
const HistoricalRounds = require('./historical/rounds');
const HistoricalTransactions = require('./historical/transactions');
const HistoricalWorkers = require('./historical/workers');

// Current Table Commands
const PoolBlocks = require('./pool/blocks');
const PoolHashrate = require('./pool/hashrate');
const PoolMetadata = require('./pool/metadata');
const PoolMiners = require('./pool/miners');
const PoolNetwork = require('./pool/network');
const PoolRounds = require('./pool/rounds');
const PoolTransactions = require('./pool/transactions');
const PoolWorkers = require('./pool/workers');

////////////////////////////////////////////////////////////////////////////////

// Main Command Function
const Commands = function (logger, client, configMain) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Database Table Structure
  this.pool = {};
  this.historical = {};

  // Execute Commands
  /* eslint-disable */
  this.executor = function(commands, callback) {
    const handler = (error) => { throw new Error(error); };
    _this.client.query(commands.join(' '), (error, results) => {
      if (error) {
        const lines = [_this.text.databaseCommandsText1(JSON.stringify(error))];
        _this.logger.error('Database', 'Commands', lines);
        handler(error);
      } else {
        callback(results);
      }
    });
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
  this.pool.blocks = new PoolBlocks(_this.logger, _this.configMain);
  this.pool.hashrate = new PoolHashrate(_this.logger, _this.configMain);
  this.pool.metadata = new PoolMetadata(_this.logger, _this.configMain);
  this.pool.miners = new PoolMiners(_this.logger, _this.configMain);
  this.pool.network = new PoolNetwork(_this.logger, _this.configMain);
  this.pool.rounds = new PoolRounds(_this.logger, _this.configMain);
  this.pool.transactions = new PoolTransactions(_this.logger, _this.configMain);
  this.pool.workers = new PoolWorkers(_this.logger, _this.configMain);
};

module.exports = Commands;
