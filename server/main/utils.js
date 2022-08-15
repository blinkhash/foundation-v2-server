const os = require('os');

////////////////////////////////////////////////////////////////////////////////

// Check if Miner is Solo Mining
exports.checkSoloMining = function(poolConfig, data) {
  let isSoloMining = false;
  const activePort = poolConfig.ports.filter((port) => port.port === data.port);
  if (activePort.length >= 1) {
    isSoloMining = activePort[0].type === 'solo';
  }
  return isSoloMining;
};

// Count Number of Process Forks
exports.countProcessForks = function(configMain) {
  if (!configMain.clustering || !configMain.clustering.enabled) {
    return 1;
  } else if (configMain.clustering.forks === 'auto') {
    return os.cpus().length <= 4 ? os.cpus().length : 4;
  } else if (!configMain.clustering.forks || isNaN(configMain.clustering.forks)) {
    return 1;
  }
  return configMain.clustering.forks;
};

// Indicate Severity By Colors
exports.loggerColors = function(severity, text) {
  switch (severity) {
  case 'debug':
    return text.blue;
  case 'log':
    return text.green;
  case 'warning':
    return text.yellow;
  case 'special':
    return text.cyan;
  case 'error':
    return text.red;
  default:
    return text.italic;
  }
};

// Severity Mapping Values
exports.loggerSeverity = {
  'debug': 1,
  'log': 2,
  'warning': 3,
  'special': 4,
  'error': 5,
};

// Round to # of Digits Given
exports.roundTo = function(n, digits) {
  if (!digits) {
    digits = 0;
  }
  const multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  const test = Math.round(n) / multiplicator;
  return +(test.toFixed(digits));
};
