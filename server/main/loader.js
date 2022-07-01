const Text = require('../../locales/index');
const fs = require('fs');
const path = require('path');

////////////////////////////////////////////////////////////////////////////////

// Main Loader Function
const Loader = function(logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Check for Valid Portal TLS Files
  /* istanbul ignore next */
  this.checkPoolCertificates = function(config) {
    if (_this.configMain.tls.key.length >= 1) {
      const keyExists = fs.existsSync(`./certificates/${ config.tls.key }`);
      const certExists = fs.existsSync(`./certificates/${ config.tls.cert }`);
      const authorityExists = fs.existsSync(`./certificates/${ config.tls.ca }`);
      if (!keyExists || !certExists || !authorityExists) {
        const lines = [_this.text.loaderCertificateText1()];
        _this.logger.error('Loader', config.name, lines);
        return false;
      }
    }
    return true;
  };

  // Check Configuration Daemons
  this.checkPoolDaemons = function(config) {
    if (!Array.isArray(config.primary.daemons) || config.primary.daemons.length < 1) {
      const lines = [_this.text.loaderDaemonsText1()];
      _this.logger.error('Loader', config.name, lines);
      return false;
    }
    if (config.auxiliary && config.auxiliary.enabled) {
      if (!Array.isArray(config.auxiliary.daemons) || config.auxiliary.daemons.length < 1) {
        const lines = [_this.text.loaderDaemonsText2()];
        _this.logger.error('Loader', config.name, lines);
        return false;
      }
    }
    return true;
  };

  // Check for Overlapping Pool Names
  this.checkPoolNames = function(configs, config) {
    const names = Object.keys(configs).concat(config.name);
    if (config.name.split(' ').length > 1) {
      const lines = [_this.text.loaderNamesText1()];
      _this.logger.error('Loader', config.name, lines);
      return false;
    }
    if (new Set(names).size !== names.length) {
      const lines = [_this.text.loaderNamesText2()];
      _this.logger.error('Loader', config.name, lines);
      return false;
    }
    return true;
  };

  // Check Configuration Ports
  this.checkPoolPorts = function(configs, config) {
    const ports = Object.values(configs).flatMap((val) => val.ports).flatMap(((val) => val.port));
    const currentPorts = config.ports.flatMap((val) => val.port);
    for (let i = 0; i < currentPorts.length; i++) {
      const currentPort = currentPorts[i];
      if (ports.includes(currentPort)) {
        const lines = [_this.text.loaderPortsText1(currentPort)];
        _this.logger.error('Loader', config.name, lines);
        return false;
      }
      ports.push(currentPort);
    }
    return true;
  };

  // Check Configuration Recipients
  this.checkPoolRecipients = function(config) {
    const recipients = config.primary.recipients;
    if (recipients && recipients.length >= 1) {
      const percentage = recipients.reduce((p_sum, a) => p_sum + a.percentage, 0);
      if (percentage >= 1) {
        const lines = [_this.text.loaderRecipientsText1()];
        _this.logger.error('Loader', config.name, lines);
        return false;
      }
      if (percentage >= 0.4) {
        const lines = [_this.text.loaderRecipientsText2()];
        _this.logger.warning('Loader', config.name, lines);
      }
    }
    return true;
  };

  // Check Configuration Template
  /* istanbul ignore next */
  this.checkPoolTemplate = function(config) {
    try {
      require('foundation-v2-' + config.template);
    } catch(e) {
      const lines = [_this.text.loaderTemplateText1()];
      _this.logger.error('Loader', config.name, lines);
      return false;
    }
    return true;
  };

  // Load and Validate Configuration Files
  /* istanbul ignore next */
  this.handleConfigs = function() {
    const configs = {};
    const normalizedPath = path.join(__dirname, '../../configs/pools/');
    if (!_this.checkPoolCertificates(_this.configMain)) return;
    fs.readdirSync(normalizedPath).forEach((file) => {
      if (fs.existsSync(normalizedPath + file) && path.extname(normalizedPath + file) === '.js') {
        const config = require(normalizedPath + file);
        if (!config.enabled) return;
        if (!_this.checkPoolDaemons(config)) return;
        if (!_this.checkPoolNames(configs, config)) return;
        if (!_this.checkPoolPorts(configs, config)) return;
        if (!_this.checkPoolRecipients(config)) return;
        if (!_this.checkPoolTemplate(config)) return;
        configs[config.name] = config;
      }
    });
    return configs;
  };
};

module.exports = Loader;
