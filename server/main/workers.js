const Stratum = require('./stratum');

////////////////////////////////////////////////////////////////////////////////

// Main Workers Function
const Workers = function (logger) {

  const _this = this;
  this.logger = logger;
  this.stratums = {};
  this.configs = JSON.parse(process.env.configs);
  this.configMain = JSON.parse(process.env.configMain);

  // Build Promise from Input Configuration
  /* istanbul ignore next */
  this.createPromises = function(name) {
    return new Promise((resolve) => {
      const config = _this.configs[name];
      const template = require('foundation-v2-' + config.template);
      const stratum = new Stratum(_this.logger, config, _this.configMain, template);
      stratum.setupStratum(() => resolve(stratum));
      resolve(stratum);
    });
  };

  // Start Worker Capabilities
  /* istanbul ignore next */
  this.setupWorkers = function(callback) {
    const keys = Object.keys(_this.configs);
    const promises = keys.map((name) => _this.createPromises(name));
    Promise.all(promises).then((stratums) => {
      stratums.forEach((stratum) => _this.stratums[stratum.config.name] = stratum);
      callback();
    });
  };
};

module.exports = Workers;
