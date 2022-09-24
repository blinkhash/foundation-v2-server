const Text = require('../../locales/index');
const utils = require('./utils');

////////////////////////////////////////////////////////////////////////////////

// Main API Function
const Endpoints = function (logger, client, configMain) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // API Variables
  this.executor = _this.client.commands.executor;
  this.current = _this.client.commands.current;
  this.historical = _this.client.commands.historical;

  // Handle Blocks Queries
  this.handleCurrentBlocks = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      miner: 'string', worker: 'string', category: 'string', confirmations: 'number',
      difficulty: 'number', hash: 'string', height: 'number', identifier: 'string',
      luck: 'number', reward: 'number', round: 'string', solo: 'boolean',
      transaction: 'string', type: 'string' };

    // Accepted Values for Parameters
    const validCategories = ['pending', 'immature', 'generate', 'orphan', 'confirmed'];
    const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.category && !validCategories.includes(queries.category)) {
      callback(400, _this.text.websiteValidationText1('category', validCategories.join(', ')));
      return;
    } else if (queries.round && !validRound.test(queries.round)) {
      callback(400, _this.text.websiteValidationText1('round', '<uuid>'));
      return;
    } else if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Blocks Data
    const transaction = [_this.current.blocks.selectCurrentBlocksMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Hashrate Queries
  this.handleCurrentHashrate = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      miner: 'string', worker: 'string', solo: 'boolean', type: 'string' };

    // Accepted Values for Parameters
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Hashrate Data
    const transaction = [_this.current.hashrate.selectCurrentHashrateMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Metadata Queries
  this.handleCurrentMetadata = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      blocks: 'number', efficiency: 'number', effort: 'number', hashrate: 'number',
      invalid: 'number', miners: 'number', stale: 'number', type: 'string',
      valid: 'number', work: 'number', workers: 'number' };

    // Accepted Values for Parameters
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Metadata Data
    const transaction = [_this.current.metadata.selectCurrentMetadataMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Miners Queries
  this.handleCurrentMiners = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      miner: 'string', balance: 'number', efficiency: 'number', effort: 'number',
      generate: 'number', hashrate: 'number', immature: 'number', paid: 'number',
      type: 'string' };

    // Accepted Values for Parameters
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Miners Data
    const transaction = [_this.current.miners.selectCurrentMinersMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Network Queries
  this.handleCurrentNetwork = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      difficulty: 'number', hashrate: 'number', height: 'number', type: 'string' };

    // Accepted Values for Parameters
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Network Data
    const transaction = [_this.current.network.selectCurrentNetworkMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Payments Queries
  this.handleCurrentPayments = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      round: 'string', type: 'string' };

    // Accepted Values for Parameters
    const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.round && !validRound.test(queries.round)) {
      callback(400, _this.text.websiteValidationText1('round', '<uuid>'));
      return;
    } else if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Payments Data
    const transaction = [_this.current.payments.selectCurrentPaymentsMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Rounds Queries
  this.handleCurrentRounds = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      miner: 'string', worker: 'string', identifier: 'string', invalid: 'number',
      round: 'string', solo: 'boolean', stale: 'number', times: 'number',
      type: 'string', valid: 'number', work: 'number' };

    // Accepted Values for Parameters
    const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.round && (queries.round !== 'current' && !validRound.test(queries.round))) {
      callback(400, _this.text.websiteValidationText1('round', 'current, <uuid>'));
      return;
    } else if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Rounds Data
    const transaction = [_this.current.rounds.selectCurrentRoundsMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Transactions Queries
  this.handleCurrentTransactions = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      round: 'string', type: 'string' };

    // Accepted Values for Parameters
    const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.round && !validRound.test(queries.round)) {
      callback(400, _this.text.websiteValidationText1('round', '<uuid>'));
      return;
    } else if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Transactions Data
    const transaction = [_this.current.transactions.selectCurrentTransactionsMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Workers Queries
  this.handleCurrentWorkers = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      miner: 'string', worker: 'string', efficiency: 'number', effort: 'number',
      hashrate: 'number', solo: 'boolean', type: 'string' };

    // Accepted Values for Parameters
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Workers Data
    const transaction = [_this.current.workers.selectCurrentWorkersMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Blocks Queries
  this.handleHistoricalBlocks = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      miner: 'string', worker: 'string', category: 'string', confirmations: 'number',
      difficulty: 'number', hash: 'string', height: 'number', identifier: 'string',
      luck: 'number', reward: 'number', round: 'string', solo: 'boolean',
      transaction: 'string', type: 'string' };

    // Accepted Values for Parameters
    const validCategories = ['pending', 'immature', 'generate', 'orphan', 'confirmed'];
    const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.category && !validCategories.includes(queries.category)) {
      callback(400, _this.text.websiteValidationText1('category', validCategories.join(', ')));
      return;
    } else if (queries.round && !validRound.test(queries.round)) {
      callback(400, _this.text.websiteValidationText1('round', '<uuid>'));
      return;
    } else if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Blocks Data
    const transaction = [_this.historical.blocks.selectHistoricalBlocksMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Metadata Queries
  this.handleHistoricalMetadata = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      blocks: 'number', efficiency: 'number', effort: 'number', hashrate: 'number',
      invalid: 'number', miners: 'number', stale: 'number', type: 'string',
      valid: 'number', work: 'number', workers: 'number' };

    // Accepted Values for Parameters
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Metadata Data
    const transaction = [_this.historical.metadata.selectHistoricalMetadataMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Miners Queries
  this.handleHistoricalMiners = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      miner: 'string', efficiency: 'number', effort: 'number', hashrate: 'number',
      type: 'string' };

    // Accepted Values for Parameters
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Miners Data
    const transaction = [_this.historical.miners.selectHistoricalMinersMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Network Queries
  this.handleHistoricalNetwork = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      difficulty: 'number', hashrate: 'number', height: 'number', type: 'string' };

    // Accepted Values for Parameters
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Network Data
    const transaction = [_this.historical.network.selectHistoricalNetworkMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Payments Queries
  this.handleHistoricalPayments = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      miner: 'string', amount: 'number', transaction: 'string', type: 'string' };

    // Accepted Values for Parameters
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Payments Data
    const transaction = [_this.historical.payments.selectHistoricalPaymentsMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Rounds Queries
  this.handleHistoricalRounds = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      miner: 'string', worker: 'string', identifier: 'string', invalid: 'number',
      round: 'string', solo: 'boolean', stale: 'number', times: 'number',
      type: 'string', valid: 'number', work: 'number' };

    // Accepted Values for Parameters
    const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.round && (!validRound.test(queries.round))) {
      callback(400, _this.text.websiteValidationText1('round', '<uuid>'));
      return;
    } else if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Rounds Data
    const transaction = [_this.historical.rounds.selectHistoricalRoundsMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Transactions Queries
  this.handleHistoricalTransactions = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      amount: 'number', transaction: 'string', type: 'string' };

    // Accepted Values for Parameters
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Transactions Data
    const transaction = [_this.historical.transactions.selectHistoricalTransactionsMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };

  // Handle Workers Queries
  this.handleHistoricalWorkers = function(pool, queries, callback) {

    // Validated Query Types
    const parameters = { limit: 'number', offset: 'number', timestamp: 'number',
      miner: 'string', worker: 'string', efficiency: 'number', effort: 'number',
      hashrate: 'number', solo: 'boolean', type: 'string' };

    // Accepted Values for Parameters
    const validType = ['primary', 'auxiliary'];

    // General Parameter Validation
    for (let i = 0; i < Object.keys(queries).length; i++) {
      const query = Object.keys(queries)[i];
      if (!utils.handleValidation(queries[query], parameters[query])) {
        const expected = parameters[query] || 'unknown';
        callback(400, _this.text.websiteValidationText1(query, `<${ expected }>`));
        return;
      }
    }

    // Specific Parameter Validation
    if (queries.type && !validType.includes(queries.type)) {
      callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
      return;
    }

    // Make Request and Return Workers Data
    const transaction = [_this.historical.workers.selectHistoricalWorkersMain(pool, queries)];
    _this.executor(transaction, (lookups) => callback(200, lookups.rows));
  };
};

module.exports = Endpoints;
