const Commands = require('../../database/main/commands');
const Logger = require('../main/logger');
const MockDate = require('mockdate');
const Network = require('../main/network');
const config = require('../../configs/pools/example.js');
const configMain = require('../../configs/main.js');
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

describe('Test network functionality', () => {

  let configCopy, configMainCopy;
  beforeEach(() => {
    configCopy = JSON.parse(JSON.stringify(config));
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of network', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const network = new Network(logger, client, configCopy, configMainCopy);
    expect(typeof network.handleCurrentNetwork).toBe('function');
    expect(typeof network.handlePrimary).toBe('function');
  });

  test('Test network database updates', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const network = new Network(logger, client, configCopy, configMainCopy);
    const current = { difficulty: 1, hashrate: 1, height: 1};
    const expected = { timestamp: 1634742080841, difficulty: 1, hashrate: 1, height: 1, type: 'primary' };
    expect(network.handleCurrentNetwork(current, 'primary')).toStrictEqual(expected);
  });

  test('Test network primary updates', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const network = new Network(logger, client, configCopy, configMainCopy);
    const current = { difficulty: 1, hashrate: 1, height: 1};
    const expected = `
      INSERT INTO "Pool-Bitcoin".current_network (
        timestamp, difficulty,
        hashrate, height, type)
      VALUES (
        1634742080841,
        1,
        1,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_network_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        difficulty = EXCLUDED.difficulty,
        hashrate = EXCLUDED.hashrate,
        height = EXCLUDED.height;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(3);
      expect(transaction[1]).toBe(expected);
      done();
    });
    network.handlePrimary(current, () => {});
  });

  test('Test network auxiliary updates', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const network = new Network(logger, client, configCopy, configMainCopy);
    const current = { difficulty: 1, hashrate: 1, height: 1};
    const expected = `
      INSERT INTO "Pool-Bitcoin".current_network (
        timestamp, difficulty,
        hashrate, height, type)
      VALUES (
        1634742080841,
        1,
        1,
        1,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_network_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        difficulty = EXCLUDED.difficulty,
        hashrate = EXCLUDED.hashrate,
        height = EXCLUDED.height;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(3);
      expect(transaction[1]).toBe(expected);
      done();
    });
    network.handleAuxiliary(current, () => {});
  });

  test('Test network submission handling [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const network = new Network(logger, client, configCopy, configMainCopy);
    const current = { difficulty: 1, hashrate: 1, height: 1, networkType: 'primary' };
    const expected = `
      INSERT INTO "Pool-Bitcoin".current_network (
        timestamp, difficulty,
        hashrate, height, type)
      VALUES (
        1634742080841,
        1,
        1,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_network_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        difficulty = EXCLUDED.difficulty,
        hashrate = EXCLUDED.hashrate,
        height = EXCLUDED.height;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(3);
      expect(transaction[1]).toBe(expected);
      done();
    });
    network.handleSubmissions(current, () => {});
  });

  test('Test network submission handling [2]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const network = new Network(logger, client, configCopy, configMainCopy);
    const current = { difficulty: 1, hashrate: 1, height: 1, networkType: 'auxiliary' };
    const expected = `
      INSERT INTO "Pool-Bitcoin".current_network (
        timestamp, difficulty,
        hashrate, height, type)
      VALUES (
        1634742080841,
        1,
        1,
        1,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_network_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        difficulty = EXCLUDED.difficulty,
        hashrate = EXCLUDED.hashrate,
        height = EXCLUDED.height;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(3);
      expect(transaction[1]).toBe(expected);
      done();
    });
    network.handleSubmissions(current, () => {});
  });

  test('Test network submission handling [3]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const network = new Network(logger, client, configCopy, configMainCopy);
    const current = { difficulty: 1, hashrate: 1, height: 1 };
    network.handleSubmissions(current, () => done());
  });
});
