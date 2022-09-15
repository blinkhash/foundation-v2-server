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
    expect(typeof transactions.selectHistoricalTransactionsType).toBe('function');
    expect(typeof transactions.selectHistoricalTransactionsTransaction).toBe('function');
  });

  test('Test transaction command handling [1]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    const response = transactions.selectHistoricalTransactionsTransaction('Pool-Main', 'transaction1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_transactions
      WHERE transaction = 'transaction1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [2]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    const response = transactions.selectHistoricalTransactionsType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_transactions
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [3]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      amount: 1,
      transaction: 'transaction1',
      type: 'primary'
    };
    const response = transactions.insertHistoricalTransactionsCurrent('Pool-Main', [updates]);
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

  test('Test transaction command handling [4]', () => {
    const transactions = new HistoricalTransactions(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      amount: 1,
      transaction: 'transaction1',
      type: 'primary'
    };
    const response = transactions.insertHistoricalTransactionsCurrent('Pool-Main', [updates, updates]);
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
