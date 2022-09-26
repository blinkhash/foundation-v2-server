const CurrentTransactions = require('../../main/current/transactions');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database transactions functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of transactions commands', () => {
    const transactions = new CurrentTransactions(logger, configMainCopy);
    expect(typeof transactions.configMain).toBe('object');
    expect(typeof transactions.selectCurrentTransactionsMain).toBe('function');
    expect(typeof transactions.insertCurrentTransactionsMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const transactions = new CurrentTransactions(logger, configMainCopy);
    expect(transactions.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(transactions.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const transactions = new CurrentTransactions(logger, configMainCopy);
    expect(transactions.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(transactions.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(transactions.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(transactions.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(transactions.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(transactions.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test query handling [3]', () => {
    const transactions = new CurrentTransactions(logger, configMainCopy);
    expect(transactions.handleSpecial({ limit: '100' }, '')).toBe(' LIMIT 100');
    expect(transactions.handleSpecial({ offset: '1' }, '')).toBe(' OFFSET 1');
    expect(transactions.handleSpecial({ order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC');
    expect(transactions.handleSpecial({ direction: 'ascending' }, '')).toBe(' ORDER BY id ASC');
    expect(transactions.handleSpecial({ limit: '100', offset: '1' }, '')).toBe(' LIMIT 100 OFFSET 1');
    expect(transactions.handleSpecial({ limit: '100', offset: '1', order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
    expect(transactions.handleSpecial({ limit: '100', offset: '1', order: 'parameter', direction: 'descending' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
  });

  test('Test transactions command handling [1]', () => {
    const transactions = new CurrentTransactions(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = transactions.selectCurrentTransactionsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_transactions WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test transactions command handling [2]', () => {
    const transactions = new CurrentTransactions(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary' };
    const response = transactions.selectCurrentTransactionsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_transactions WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test transactions command handling [3]', () => {
    const transactions = new CurrentTransactions(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary', hmm: 'test' };
    const response = transactions.selectCurrentTransactionsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_transactions WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [4]', () => {
    const transactions = new CurrentTransactions(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      round: 'round1',
      type: 'primary'
    };
    const response = transactions.insertCurrentTransactionsMain('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_transactions (
        timestamp, round, type)
      VALUES (
        1,
        'round1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_transactions_unique
      DO NOTHING RETURNING round;`;
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [5]', () => {
    const transactions = new CurrentTransactions(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      round: 'round1',
      type: 'primary'
    };
    const response = transactions.insertCurrentTransactionsMain('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_transactions (
        timestamp, round, type)
      VALUES (
        1,
        'round1',
        'primary'), (
        1,
        'round1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_transactions_unique
      DO NOTHING RETURNING round;`;
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [6]', () => {
    const transactions = new CurrentTransactions(logger, configMainCopy);
    const response = transactions.deleteCurrentTransactionsMain('Pool-Main', ['round1']);
    const expected = `
      DELETE FROM "Pool-Main".current_transactions
      WHERE round IN (round1);`;
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [7]', () => {
    const transactions = new CurrentTransactions(logger, configMainCopy);
    const response = transactions.deleteCurrentTransactionsInactive('Pool-Main', 1);
    const expected = `
      DELETE FROM "Pool-Main".current_transactions
      WHERE timestamp < 1;`;
    expect(response).toBe(expected);
  });
});
