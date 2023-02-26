const Client = require('./database/main/client');
const Logger = require('./server/main/logger');
const Threads = require('./server/main/threads');
const path = require('path');

////////////////////////////////////////////////////////////////////////////////

// Start Main Stratum Server
/* eslint-disable */
try {
  const config = require(path.join(__dirname, './configs/main/config.js'));
  const logger = new Logger(config);

  // Initialize Local/Remote Databases
  const client = new Client(logger, config);
  client.handleClientMaster(() => {
    client.handleClientWorker(() => {
      const threads = new Threads(logger, client, config).setupThreads();
    });
  });

// Error on Startup
} catch(e) {
  throw new Error(e);
}
