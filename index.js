const Logger = require('./server/main/logger');
const Threads = require('./server/main/threads');
const path = require('path');

////////////////////////////////////////////////////////////////////////////////

// Start Main Stratum Server
/* eslint-disable */
try {
  const config = require(path.join(__dirname, './configs/main.js'));
  const logger = new Logger(config);
  const threads = new Threads(logger, config).setupThreads();

// Error on Startup
} catch(e) {
  throw new Error(e);
}
