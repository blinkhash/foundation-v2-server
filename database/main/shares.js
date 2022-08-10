const Text = require('../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const Shares = function (logger, configMain, executor) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.executor = executor;
  this.text = Text[configMain.language];

  // Handle Updating Shares Object
  this.selectPoolCurrentMiner = function(miner, callback) {
  };
};

module.exports = Shares;
