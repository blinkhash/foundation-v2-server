const HistoricalTransactions = require('../../main/historical/transactions');
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
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    expect(typeof transactions.configMain).toBe('object');
    expect(typeof transactions.selectHistoricalTransactionsMain).toBe('function');
    expect(typeof transactions.insertHistoricalTransactionsMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    expect(transactions.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(transactions.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    expect(transactions.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(transactions.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(transactions.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(transactions.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(transactions.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(transactions.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test transaction command handling [1]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    const parameters = { transaction: 'transaction1', type: 'primary' };
    const response = transactions.selectHistoricalTransactionsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_transactions WHERE transaction = \'transaction1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [2]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = transactions.selectHistoricalTransactionsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_transactions WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [3]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary' };
    const response = transactions.selectHistoricalTransactionsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_transactions WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [4]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary', hmm: 'test' };
    const response = transactions.selectHistoricalTransactionsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_transactions WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [5]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      amount: 1,
      transaction: 'transaction1',
      type: 'primary'
    };
    const response = transactions.insertHistoricalTransactionsMain('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_transactions (
        timestamp, amount,
        transaction, type)
      VALUES (
        1,
        1,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [6]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      amount: 1,
      transaction: 'transaction1',
      type: 'primary'
    };
    const response = transactions.insertHistoricalTransactionsMain('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_transactions (
        timestamp, amount,
        transaction, type)
      VALUES (
        1,
        1,
        'transaction1',
        'primary'), (
        1,
        1,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    expect(response).toBe(expected);
  });
});
