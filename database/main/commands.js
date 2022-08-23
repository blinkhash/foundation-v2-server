const Schema = require('./schema');
const Text = require('../../locales/index');

// Database Table Commands
const PoolBlocks = require('./pool/blocks');
const PoolHashrate = require('./pool/hashrate');
const PoolMetadata = require('./pool/metadata');
const PoolMiners = require('./pool/miners');
const PoolRounds = require('./pool/rounds');
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

  // Build Out Schema Generation for Client
  this.schema = new Schema(_this.logger, _this.configMain, _this.executor);

  // Build Out Pool Command Modules for Client
  this.pool.blocks = new PoolBlocks(_this.logger, _this.configMain);
  this.pool.hashrate = new PoolHashrate(_this.logger, _this.configMain);
  this.pool.metadata = new PoolMetadata(_this.logger, _this.configMain);
  this.pool.miners = new PoolMiners(_this.logger, _this.configMain);
  this.pool.rounds = new PoolRounds(_this.logger, _this.configMain);
  this.pool.workers = new PoolWorkers(_this.logger, _this.configMain);
};

module.exports = Commands;
