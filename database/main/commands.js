const Schema = require('./schema');
const Text = require('../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Command Function
const Commands = function (logger, client, configMain) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Execute Commands
  this.executeCommands = function(commands, callback) {
    const handler = (error) => {
      throw new Error(error); 
    };
    _this.client.query(commands, (error, results) => {
      if (error) {
        const lines = [_this.text.databaseCommandsText1(JSON.stringify(error))];
        _this.logger.error('Database', 'Commands', lines);
        handler(error);
      } else {
        callback(results);
      }
    });
  };

  // Build Out Command Modules for Client
  this.schema = new Schema(_this.logger, _this.configMain, _this.executeCommands);
};

module.exports = Commands;
