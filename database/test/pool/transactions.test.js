const PoolTransactions = require('../../main/pool/transactions');
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
    const transactions = new PoolTransactions(logger, configMainCopy);
    expect(typeof transactions.configMain).toBe('object');
    expect(typeof transactions.selectPoolTransactionsType).toBe('function');
    expect(typeof transactions.insertPoolTransactionsCurrent).toBe('function');
  });

  test('Test transaction command handling [1]', () => {
    const transactions = new PoolTransactions(logger, configMainCopy);
    const response = transactions.selectPoolTransactionsType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_transactions
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [2]', () => {
    const transactions = new PoolTransactions(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      round: 'round1',
      type: 'primary'
    };
    const response = transactions.insertPoolTransactionsCurrent('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_transactions (
        timestamp, round, type)
      VALUES (
        1,
        'round1',
        'primary')
      ON CONFLICT ON CONSTRAINT pool_transactions_unique
      DO NOTHING RETURNING round;`;
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [3]', () => {
    const transactions = new PoolTransactions(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      round: 'round1',
      type: 'primary'
    };
    const response = transactions.insertPoolTransactionsCurrent('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_transactions (
        timestamp, round, type)
      VALUES (
        1,
        'round1',
        'primary'), (
        1,
        'round1',
        'primary')
      ON CONFLICT ON CONSTRAINT pool_transactions_unique
      DO NOTHING RETURNING round;`;
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [4]', () => {
    const transactions = new PoolTransactions(logger, configMainCopy);
    const response = transactions.deletePoolTransactionsCurrent('Pool-Main', ['round1']);
    const expected = `
      DELETE FROM "Pool-Main".pool_transactions
      WHERE round IN (round1);`;
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [5]', () => {
    const transactions = new PoolTransactions(logger, configMainCopy);
    const response = transactions.deletePoolTransactionsInactive('Pool-Main', 1);
    const expected = `
      DELETE FROM "Pool-Main".pool_transactions
      WHERE timestamp < 1;`;
    expect(response).toBe(expected);
  });
});
