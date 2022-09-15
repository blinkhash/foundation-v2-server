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
    expect(typeof payments.selectPoolPaymentsType).toBe('function');
    expect(typeof payments.insertPoolPaymentsCurrent).toBe('function');
  });

  test('Test transaction command handling [1]', () => {
    const payments = new PoolPayments(logger, configMainCopy);
    const response = payments.selectPoolPaymentsType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_payments
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test transaction command handling [2]', () => {
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

  test('Test transaction command handling [3]', () => {
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

  test('Test transaction command handling [4]', () => {
    const payments = new PoolPayments(logger, configMainCopy);
    const response = payments.deletePoolPaymentsCurrent('Pool-Main', ['round1']);
    const expected = `
      DELETE FROM "Pool-Main".pool_payments
      WHERE round IN (round1);`;
    expect(response).toBe(expected);
  });
});
