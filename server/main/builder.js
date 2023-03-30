const Text = require('../../locales/index');
const cluster = require('cluster');
const utils = require('./utils');

////////////////////////////////////////////////////////////////////////////////

// Main Builder Function
const Builder = function(logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Builder Variables
  this.workers = {};
  this.numWorkers = 0;

  // Handle Pool Server Creation
  /* istanbul ignore next */
  this.setupPoolServer = function() {

    // Establish Pool Server
    const worker = cluster.fork({
      configs: JSON.stringify(_this.configs),
      configMain: JSON.stringify(_this.configMain),
      type: 'server',
    });

    // Establish Worker Exit
    worker.on('exit', () => {
      const lines = [_this.text.builderThreadsText1(0)];
      _this.logger.error('Builder', 'Workers', lines);
      setTimeout(() => {
        _this.setupPoolServer();
      }, 2000);
    });
  };

  // Handle Pool Worker Creation
  /* istanbul ignore next */
  this.createPoolWorkers = function(forkId) {

    // Build Worker from Data
    _this.workers[forkId] = cluster.fork({
      configs: JSON.stringify(_this.configs),
      configMain: JSON.stringify(_this.configMain),
      forkId: forkId,
      type: 'worker',
    });

    // Handle Worker Failover
    _this.workers[forkId].on('exit', () => {
      const lines = [_this.text.builderThreadsText1(forkId)];
      _this.logger.error('Builder', 'Workers', lines);
      setTimeout(() => {
        _this.createPoolWorkers(forkId);
      }, 2000);
    });
  };

  // Functionality for Pool Workers
  /* istanbul ignore next */
  this.setupPoolWorkers = function() {

    // Count Number of Process Forks
    const numForks = utils.countProcessForks(_this.configMain);

    // Check if any Valid Configs Exist
    if (Object.keys(_this.configs).length === 0) {
      const lines = [_this.text.builderThreadsText2()];
      _this.logger.error('Builder', 'Workers', lines);
      return;
    }

    // Create Pool Workers
    const startInterval = setInterval(() => {
      _this.createPoolWorkers(_this.numWorkers);
      _this.numWorkers += 1;
      if (_this.numWorkers >= numForks) {
        const lines = [_this.text.builderThreadsText3(1, numForks)];
        _this.logger.debug('Builder', 'Workers', lines);
        clearInterval(startInterval);
      }
    }, 250);
  };
};

module.exports = Builder;
