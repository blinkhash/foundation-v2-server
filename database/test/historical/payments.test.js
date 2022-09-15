const HistoricalPayments = require('../../main/historical/payments');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database payments functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of payments commands', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    expect(typeof payments.configMain).toBe('object');
    expect(typeof payments.selectHistoricalPaymentsMiner).toBe('function');
    expect(typeof payments.selectHistoricalPaymentsWorker).toBe('function');
  });

  test('Test payment command handling [1]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    const response = payments.selectHistoricalPaymentsMiner('Pool-Main', 'miner1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_payments
      WHERE miner = 'miner1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test payment command handling [2]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    const response = payments.selectHistoricalPaymentsWorker('Pool-Main', 'worker1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_payments
      WHERE worker = 'worker1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test payment command handling [3]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    const response = payments.selectHistoricalPaymentsTransaction('Pool-Main', 'transaction1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_payments
      WHERE transaction = 'transaction1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test payment command handling [4]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    const response = payments.selectHistoricalPaymentsType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_payments
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test payment command handling [5]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      amount: 1,
      transaction: 'transaction1',
      type: 'primary'
    };
    const response = payments.insertHistoricalPaymentsCurrent('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_payments (
        timestamp, miner, worker,
        amount, transaction, type)
      VALUES (
        1,
        'miner1',
        'worker1',
        1,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    expect(response).toBe(expected);
  });

  test('Test payment command handling [6]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      amount: 1,
      transaction: 'transaction1',
      type: 'primary'
    };
    const response = payments.insertHistoricalPaymentsCurrent('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_payments (
        timestamp, miner, worker,
        amount, transaction, type)
      VALUES (
        1,
        'miner1',
        'worker1',
        1,
        'transaction1',
        'primary'), (
        1,
        'miner1',
        'worker1',
        1,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    expect(response).toBe(expected);
  });
});
