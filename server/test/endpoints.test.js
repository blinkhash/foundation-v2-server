const Commands = require('../../database/main/commands');
const Endpoints = require('../main/endpoints');
const Logger = require('../main/logger');
const configMain = require('../../configs/main/example.js');
const events = require('events');

////////////////////////////////////////////////////////////////////////////////

function mockClient(configMain, result) {
  const client = new events.EventEmitter();
  client.commands = new Commands(null, null, configMain);
  client.commands.executor = (commands, callback) => {
    client.emit('transaction', commands);
    callback(result);
  };
  return client;
}

////////////////////////////////////////////////////////////////////////////////

describe('Test endpoints functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of endpoints', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    expect(typeof endpoints.handleCurrentBlocks).toBe('function');
    expect(typeof endpoints.handleCurrentHashrate).toBe('function');
  });

  test('Test handleCurrentBlocks endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".current_blocks;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentBlocks('Pool1', {}, () => {});
  });

  test('Test handleCurrentBlocks endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".current_blocks LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentBlocks('Pool1', queries, () => {});
  });

  test('Test handleCurrentBlocks endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleCurrentBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentBlocks endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (category: pending, immature, generate, orphan, confirmed). Verify your input and try again';
    const queries = { category: 'unknown' };
    endpoints.handleCurrentBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentBlocks endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleCurrentBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentBlocks endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleCurrentBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentBlocks endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleCurrentBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentBlocks endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, miner, worker, category, confirmations, difficulty, hash, height, identifier, luck, reward, round, solo, transaction, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleCurrentBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentBlocks endpoint [9]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (round: <uuid>). Verify your input and try again';
    const queries = { round: 'unknown' };
    endpoints.handleCurrentBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentBlocks endpoint [10]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleCurrentBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentHashrate endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".current_hashrate;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentHashrate('Pool1', {}, () => {});
  });

  test('Test handleCurrentHashrate endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".current_hashrate LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentHashrate('Pool1', queries, () => {});
  });

  test('Test handleCurrentHashrate endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleCurrentHashrate('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentHashrate endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleCurrentHashrate('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentHashrate endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleCurrentHashrate('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentHashrate endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleCurrentHashrate('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentHashrate endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, miner, worker, solo, type, work). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleCurrentHashrate('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentHashrate endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (share: valid, invalid, stale). Verify your input and try again';
    const queries = { share: 'unknown' };
    endpoints.handleCurrentHashrate('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentHashrate endpoint [9]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleCurrentHashrate('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMetadata endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".current_metadata;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentMetadata('Pool1', {}, () => {});
  });

  test('Test handleCurrentMetadata endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".current_metadata LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentMetadata('Pool1', queries, () => {});
  });

  test('Test handleCurrentMetadata endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleCurrentMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMetadata endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleCurrentMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMetadata endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleCurrentMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMetadata endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleCurrentMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMetadata endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, blocks, efficiency, effort, hashrate, invalid, miners, stale, type, valid, work, workers). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleCurrentMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMetadata endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleCurrentMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMiners endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".current_miners;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentMiners('Pool1', {}, () => {});
  });

  test('Test handleCurrentMiners endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".current_miners LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentMiners('Pool1', queries, () => {});
  });

  test('Test handleCurrentMiners endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleCurrentMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMiners endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleCurrentMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMiners endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleCurrentMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMiners endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleCurrentMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMiners endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, miner, balance, efficiency, effort, generate, hashrate, immature, paid, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleCurrentMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentMiners endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleCurrentMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentNetwork endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".current_network;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentNetwork('Pool1', {}, () => {});
  });

  test('Test handleCurrentNetwork endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".current_network LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentNetwork('Pool1', queries, () => {});
  });

  test('Test handleCurrentNetwork endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleCurrentNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentNetwork endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleCurrentNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentNetwork endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleCurrentNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentNetwork endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleCurrentNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentNetwork endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, difficulty, hashrate, height, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleCurrentNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentNetwork endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleCurrentNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentPayments endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".current_payments;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentPayments('Pool1', {}, () => {});
  });

  test('Test handleCurrentPayments endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".current_payments LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentPayments('Pool1', queries, () => {});
  });

  test('Test handleCurrentPayments endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleCurrentPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentPayments endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleCurrentPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentPayments endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleCurrentPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentPayments endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleCurrentPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentPayments endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, round, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleCurrentPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentPayments endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (round: <uuid>). Verify your input and try again';
    const queries = { round: 'unknown' };
    endpoints.handleCurrentPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentPayments endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleCurrentPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentRounds endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".current_rounds;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentRounds('Pool1', {}, () => {});
  });

  test('Test handleCurrentRounds endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".current_rounds LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentRounds('Pool1', queries, () => {});
  });

  test('Test handleCurrentRounds endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleCurrentRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentRounds endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleCurrentRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentRounds endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleCurrentRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentRounds endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleCurrentRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentRounds endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, miner, worker, identifier, invalid, round, solo, stale, times, type, valid, work). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleCurrentRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentRounds endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (round: current, <uuid>). Verify your input and try again';
    const queries = { round: 'unknown' };
    endpoints.handleCurrentRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentRounds endpoint [9]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleCurrentRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentTransactions endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".current_transactions;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentTransactions('Pool1', {}, () => {});
  });

  test('Test handleCurrentTransactions endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".current_transactions LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentTransactions('Pool1', queries, () => {});
  });

  test('Test handleCurrentTransactions endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleCurrentTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentTransactions endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleCurrentTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentTransactions endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleCurrentTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentTransactions endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleCurrentTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentTransactions endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, round, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleCurrentTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentTransactions endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (round: <uuid>). Verify your input and try again';
    const queries = { round: 'unknown' };
    endpoints.handleCurrentTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentTransactions endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleCurrentTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentWorkers endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".current_workers;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentWorkers('Pool1', {}, () => {});
  });

  test('Test handleCurrentWorkers endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".current_workers LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleCurrentWorkers('Pool1', queries, () => {});
  });

  test('Test handleCurrentWorkers endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleCurrentWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentWorkers endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleCurrentWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentWorkers endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleCurrentWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentWorkers endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleCurrentWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentWorkers endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, miner, worker, efficiency, effort, hashrate, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleCurrentWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleCurrentWorkers endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleCurrentWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalBlocks endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".historical_blocks;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalBlocks('Pool1', {}, () => {});
  });

  test('Test handleHistoricalBlocks endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".historical_blocks LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalBlocks('Pool1', queries, () => {});
  });

  test('Test handleHistoricalBlocks endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleHistoricalBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalBlocks endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (category: pending, immature, generate, orphan, confirmed). Verify your input and try again';
    const queries = { category: 'unknown' };
    endpoints.handleHistoricalBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalBlocks endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleHistoricalBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalBlocks endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleHistoricalBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalBlocks endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleHistoricalBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalBlocks endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, miner, worker, category, confirmations, difficulty, hash, height, identifier, luck, reward, round, solo, transaction, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleHistoricalBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalBlocks endpoint [9]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (round: <uuid>). Verify your input and try again';
    const queries = { round: 'unknown' };
    endpoints.handleHistoricalBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalBlocks endpoint [10]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleHistoricalBlocks('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMetadata endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".historical_metadata;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalMetadata('Pool1', {}, () => {});
  });

  test('Test handleHistoricalMetadata endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".historical_metadata LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalMetadata('Pool1', queries, () => {});
  });

  test('Test handleHistoricalMetadata endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleHistoricalMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMetadata endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleHistoricalMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMetadata endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleHistoricalMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMetadata endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleHistoricalMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMetadata endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, blocks, efficiency, effort, hashrate, invalid, miners, stale, type, valid, work, workers). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleHistoricalMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMetadata endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleHistoricalMetadata('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMiners endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".historical_miners;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalMiners('Pool1', {}, () => {});
  });

  test('Test handleHistoricalMiners endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".historical_miners LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalMiners('Pool1', queries, () => {});
  });

  test('Test handleHistoricalMiners endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleHistoricalMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMiners endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleHistoricalMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMiners endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleHistoricalMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMiners endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleHistoricalMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMiners endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, miner, efficiency, effort, hashrate, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleHistoricalMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalMiners endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleHistoricalMiners('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalNetwork endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".historical_network;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalNetwork('Pool1', {}, () => {});
  });

  test('Test handleHistoricalNetwork endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".historical_network LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalNetwork('Pool1', queries, () => {});
  });

  test('Test handleHistoricalNetwork endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleHistoricalNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalNetwork endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleHistoricalNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalNetwork endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleHistoricalNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalNetwork endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleHistoricalNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalNetwork endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, difficulty, hashrate, height, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleHistoricalNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalNetwork endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleHistoricalNetwork('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalPayments endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".historical_payments;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalPayments('Pool1', {}, () => {});
  });

  test('Test handleHistoricalPayments endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".historical_payments LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalPayments('Pool1', queries, () => {});
  });

  test('Test handleHistoricalPayments endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleHistoricalPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalPayments endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleHistoricalPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalPayments endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleHistoricalPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalPayments endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleHistoricalPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalPayments endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, miner, amount, transaction, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleHistoricalPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalPayments endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleHistoricalPayments('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalRounds endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".historical_rounds;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalRounds('Pool1', {}, () => {});
  });

  test('Test handleHistoricalRounds endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".historical_rounds LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalRounds('Pool1', queries, () => {});
  });

  test('Test handleHistoricalRounds endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleHistoricalRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalRounds endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleHistoricalRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalRounds endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleHistoricalRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalRounds endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleHistoricalRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalRounds endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, miner, worker, identifier, invalid, round, solo, stale, times, type, valid, work). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleHistoricalRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalRounds endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (round: <uuid>). Verify your input and try again';
    const queries = { round: 'unknown' };
    endpoints.handleHistoricalRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalRounds endpoint [9]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleHistoricalRounds('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalTransactions endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".historical_transactions;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalTransactions('Pool1', {}, () => {});
  });

  test('Test handleHistoricalTransactions endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".historical_transactions LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalTransactions('Pool1', queries, () => {});
  });

  test('Test handleHistoricalTransactions endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleHistoricalTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalTransactions endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleHistoricalTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalTransactions endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleHistoricalTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalTransactions endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleHistoricalTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalTransactions endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, amount, transaction, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleHistoricalTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalTransactions endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleHistoricalTransactions('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalWorkers endpoint [1]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'SELECT * FROM "Pool1".historical_workers;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalWorkers('Pool1', {}, () => {});
  });

  test('Test handleHistoricalWorkers endpoint [2]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const queries = { limit: 100 };
    const expected = 'SELECT * FROM "Pool1".historical_workers LIMIT 100;';
    client.on('transaction', (transaction) => {
      expect(transaction[0]).toBe(expected);
      done();
    });
    endpoints.handleHistoricalWorkers('Pool1', queries, () => {});
  });

  test('Test handleHistoricalWorkers endpoint [3]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (unknown: <unknown>). Verify your input and try again';
    const queries = { unknown: 'unknown' };
    endpoints.handleHistoricalWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalWorkers endpoint [4]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (direction: ascending, descending). Verify your input and try again';
    const queries = { direction: 'unknown' };
    endpoints.handleHistoricalWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalWorkers endpoint [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (limit: <number>). Verify your input and try again';
    const queries = { limit: 'unknown' };
    endpoints.handleHistoricalWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalWorkers endpoint [6]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (offset: <number>). Verify your input and try again';
    const queries = { offset: 'unknown' };
    endpoints.handleHistoricalWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalWorkers endpoint [7]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (order: timestamp, miner, worker, efficiency, effort, hashrate, type). Verify your input and try again';
    const queries = { order: 'unknown' };
    endpoints.handleHistoricalWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });

  test('Test handleHistoricalWorkers endpoint [8]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const endpoints = new Endpoints(logger, client, configMainCopy);
    const expected = 'Invalid query parameter specified (type: primary, auxiliary). Verify your input and try again';
    const queries = { type: 'unknown' };
    endpoints.handleHistoricalWorkers('Pool1', queries, (code, message) => {
      expect(code).toBe(400);
      expect(message).toBe(expected);
      done();
    });
  });
});
