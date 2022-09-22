const PoolPayments = require('../../main/pool/payments');
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
    const payments = new PoolPayments(logger, configMainCopy);
    expect(typeof payments.configMain).toBe('object');
    expect(typeof payments.selectPoolPaymentsCurrent).toBe('function');
    expect(typeof payments.insertPoolPaymentsCurrent).toBe('function');
  });

  test('Test query handling [1]', () => {
    const payments = new PoolPayments(logger, configMainCopy);
    expect(payments.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(payments.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const payments = new PoolPayments(logger, configMainCopy);
    expect(payments.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(payments.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(payments.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(payments.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(payments.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(payments.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test payments command handling [1]', () => {
    const payments = new PoolPayments(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = payments.selectPoolPaymentsCurrent('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".pool_payments WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test payments command handling [2]', () => {
    const payments = new PoolPayments(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary' };
    const response = payments.selectPoolPaymentsCurrent('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".pool_payments WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test payments command handling [3]', () => {
    const payments = new PoolPayments(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary', hmm: 'test' };
    const response = payments.selectPoolPaymentsCurrent('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".pool_payments WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test payments command handling [4]', () => {
    const payments = new PoolPayments(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      round: 'round1',
      type: 'primary'
    };
    const response = payments.insertPoolPaymentsCurrent('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_payments (
        timestamp, round, type)
      VALUES (
        1,
        'round1',
        'primary')
      ON CONFLICT ON CONSTRAINT pool_payments_unique
      DO NOTHING RETURNING round;`;
    expect(response).toBe(expected);
  });

  test('Test payments command handling [5]', () => {
    const payments = new PoolPayments(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      round: 'round1',
      type: 'primary'
    };
    const response = payments.insertPoolPaymentsCurrent('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_payments (
        timestamp, round, type)
      VALUES (
        1,
        'round1',
        'primary'), (
        1,
        'round1',
        'primary')
      ON CONFLICT ON CONSTRAINT pool_payments_unique
      DO NOTHING RETURNING round;`;
    expect(response).toBe(expected);
  });

  test('Test payments command handling [6]', () => {
    const payments = new PoolPayments(logger, configMainCopy);
    const response = payments.deletePoolPaymentsCurrent('Pool-Main', ['round1']);
    const expected = `
      DELETE FROM "Pool-Main".pool_payments
      WHERE round IN (round1);`;
    expect(response).toBe(expected);
  });
});
