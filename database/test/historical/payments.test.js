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
    expect(typeof payments.selectHistoricalPaymentsCurrent).toBe('function');
    expect(typeof payments.insertHistoricalPaymentsCurrent).toBe('function');
  });

  test('Test query handling [1]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    expect(payments.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(payments.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    expect(payments.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(payments.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(payments.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(payments.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(payments.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(payments.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test payment command handling [1]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    const parameters = { miner: 'miner1', type: 'primary' };
    const response = payments.selectHistoricalPaymentsCurrent('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_payments WHERE miner = \'miner1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test payment command handling [2]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    const parameters = { transaction: 'transaction1', type: 'primary' };
    const response = payments.selectHistoricalPaymentsCurrent('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_payments WHERE transaction = \'transaction1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test payment command handling [3]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = payments.selectHistoricalPaymentsCurrent('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_payments WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test payment command handling [4]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    const parameters = { type: 'primary', hmm: 'test' };
    const response = payments.selectHistoricalPaymentsCurrent('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_payments WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test payment command handling [5]', () => {
    const payments = new HistoricalPayments(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      amount: 1,
      transaction: 'transaction1',
      type: 'primary'
    };
    const response = payments.insertHistoricalPaymentsCurrent('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_payments (
        timestamp, miner, amount,
        transaction, type)
      VALUES (
        1,
        'miner1',
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
      amount: 1,
      transaction: 'transaction1',
      type: 'primary'
    };
    const response = payments.insertHistoricalPaymentsCurrent('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_payments (
        timestamp, miner, amount,
        transaction, type)
      VALUES (
        1,
        'miner1',
        1,
        'transaction1',
        'primary'), (
        1,
        'miner1',
        1,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    expect(response).toBe(expected);
  });
});
