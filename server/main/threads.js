const Builder = require('./builder');
const Loader = require('./loader');
const Server = require('./server');
const Workers = require('./workers');
const cluster = require('cluster');

////////////////////////////////////////////////////////////////////////////////

// Main Initializer Function
const Threads = function(logger, client, configMain) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.configMain = configMain;

  // Start Pool Server
  /* istanbul ignore next */
  this.setupThreads = function() {

    // Handle Master Forks
    if (cluster.isMaster) {
      const loader = new Loader(_this.logger, _this.configMain);
      const builder = new Builder(_this.logger, _this.configMain);
      const configs = loader.handleConfigs();
      _this.client.master.commands.schema.handleSchema(configs, () => {
        _this.client.worker.commands.schema.handleSchema(configs, () => {
          builder.configs = configs;
          builder.setupPoolServer();
          builder.setupPoolWorkers();
        });
      });
    }

    // Handle Worker Forks
    if (cluster.isWorker) {
      switch (process.env.type) {
      case 'server':
        new Server(_this.logger, _this.client).setupServer(() => {});
        break;
      case 'worker':
        new Workers(_this.logger, _this.client).setupWorkers(() => {});
        break;
      default:
        break;
      }
    }
  };
};

module.exports = Threads;
