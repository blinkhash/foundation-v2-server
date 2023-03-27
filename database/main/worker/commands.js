const Schema = require('./schema');
const Text = require('../../../locales/index');

// Local Table Commands
const LocalShares = require('./local/shares');
const LocalTransactions = require('./local/transactions');

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
  this.local = {};
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
      _this.logger.error('Database', 'Worker', lines);
      setTimeout(() => {
        _this.executor(commands, callback);
        _this.retries += 1;
      }, _this.timing[_this.retries] || 1000);
    } else throw new Error(error);
  };

  // Build Out Schema Generation
  this.schema = new Schema(_this.logger, _this.executor, _this.configMain);

  // Initialize Local Commands
  this.local.shares = new LocalShares(_this.logger, _this.configMain);
  this.local.transactions = new LocalTransactions(_this.logger, _this.configMain);
};

module.exports = Commands;
