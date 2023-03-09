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

  // Database Table Structure
  this.local = {};

  // Execute Commands
  /* eslint-disable */
  this.executor = function(commands, callback) {
    const query = commands.join(' ')
    const handler = (error) => { throw new Error(error); };
    _this.client.query(query, (error, results) => {
      if (error) {
        const lines = [_this.text.databaseCommandsText1(query, JSON.stringify(error))];
        _this.logger.error('Database', 'Worker', lines);
        handler(error);
      } else {
        callback(results);
      }
    });
  };

  // Build Out Schema Generation
  this.schema = new Schema(_this.logger, _this.executor, _this.configMain);

  // Initialize Local Commands
  this.local.shares = new LocalShares(_this.logger, _this.configMain);
  this.local.transactions = new LocalTransactions(_this.logger, _this.configMain);
};

module.exports = Commands;
