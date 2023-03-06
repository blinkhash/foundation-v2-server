const LocalTransactions = require('../../../main/worker/local/transactions');
const Logger = require('../../../../server/main/logger');
const configMain = require('../../../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database transactions functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of transactions commands', () => {
    const transactions = new LocalTransactions(logger, configMainCopy);
    expect(typeof transactions.configMain).toBe('object');
    expect(typeof transactions.selectLocalTransactionsMain).toBe('function');
    expect(typeof transactions.insertLocalTransactionsMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const transactions = new LocalTransactions(logger, configMainCopy);
    expect(transactions.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(transactions.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const transactions = new LocalTransactions(logger, configMainCopy);
    expect(transactions.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(transactions.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(transactions.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(transactions.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(transactions.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(transactions.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test query handling [3]', () => {
    const transactions = new LocalTransactions(logger, configMainCopy);
    expect(transactions.handleSpecial({ limit: '100' }, '')).toBe(' LIMIT 100');
    expect(transactions.handleSpecial({ offset: '1' }, '')).toBe(' OFFSET 1');
    expect(transactions.handleSpecial({ order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC');
    expect(transactions.handleSpecial({ direction: 'ascending' }, '')).toBe(' ORDER BY id ASC');
    expect(transactions.handleSpecial({ limit: '100', offset: '1' }, '')).toBe(' LIMIT 100 OFFSET 1');
    expect(transactions.handleSpecial({ limit: '100', offset: '1', order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
    expect(transactions.handleSpecial({ limit: '100', offset: '1', order: 'parameter', direction: 'descending' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
  });

  test('Test transactions command handling [1]', () => {
    const transactions = new LocalTransactions(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = transactions.selectLocalTransactionsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".local_transactions WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test transactions command handling [2]', () => {
    const transactions = new LocalTransactions(logger, configMainCopy);
    const parameters = { uuid: 'uuid1', type: 'primary' };
    const response = transactions.selectLocalTransactionsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".local_transactions WHERE uuid = \'uuid1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test transactions command handling [3]', () => {
    const transactions = new LocalTransactions(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      uuid: 'uuid',
      type: 'primary',
    };
    const response = transactions.insertLocalTransactionsMain('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".local_transactions (
        timestamp, uuid, type)
      VALUES (
        1,
        'uuid',
        'primary')
      ON CONFLICT ON CONSTRAINT local_transactions_unique
      DO NOTHING RETURNING uuid;`;
    expect(response).toBe(expected);
  });

  test('Test transactions command handling [4]', () => {
    const transactions = new LocalTransactions(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      uuid: 'uuid',
      type: 'primary',
    };
    const response = transactions.insertLocalTransactionsMain('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".local_transactions (
        timestamp, uuid, type)
      VALUES (
        1,
        'uuid',
        'primary'), (
        1,
        'uuid',
        'primary')
      ON CONFLICT ON CONSTRAINT local_transactions_unique
      DO NOTHING RETURNING uuid;`;
    expect(response).toBe(expected);
  });

  test('Test transactions command handling [5]', () => {
    const transactions = new LocalTransactions(logger, configMainCopy);
    const response = transactions.deleteLocalTransactionsMain('Pool-Main', ['round1']);
    const expected = `
      DELETE FROM "Pool-Main".local_transactions
      WHERE uuid IN (round1);`;
    expect(response).toBe(expected);
  });

  test('Test transactions command handling [6]', () => {
    const transactions = new LocalTransactions(logger, configMainCopy);
    const response = transactions.deleteLocalTransactionsInactive('Pool-Main', 1);
    const expected = `
      DELETE FROM "Pool-Main".local_transactions
      WHERE timestamp < 1;`;
    expect(response).toBe(expected);
  });
});
