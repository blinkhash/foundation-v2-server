const CurrentPayments = require('../../main/master/current/payments');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database payments functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of payments commands', () => {
    const payments = new CurrentPayments(logger, configMainCopy);
    expect(typeof payments.configMain).toBe('object');
    expect(typeof payments.selectCurrentPaymentsMain).toBe('function');
    expect(typeof payments.insertCurrentPaymentsMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const payments = new CurrentPayments(logger, configMainCopy);
    expect(payments.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(payments.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const payments = new CurrentPayments(logger, configMainCopy);
    expect(payments.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(payments.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(payments.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(payments.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(payments.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(payments.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test query handling [3]', () => {
    const payments = new CurrentPayments(logger, configMainCopy);
    expect(payments.handleSpecial({ limit: '100' }, '')).toBe(' LIMIT 100');
    expect(payments.handleSpecial({ offset: '1' }, '')).toBe(' OFFSET 1');
    expect(payments.handleSpecial({ order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC');
    expect(payments.handleSpecial({ direction: 'ascending' }, '')).toBe(' ORDER BY id ASC');
    expect(payments.handleSpecial({ limit: '100', offset: '1' }, '')).toBe(' LIMIT 100 OFFSET 1');
    expect(payments.handleSpecial({ limit: '100', offset: '1', order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
    expect(payments.handleSpecial({ limit: '100', offset: '1', order: 'parameter', direction: 'descending' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
  });

  test('Test payments command handling [1]', () => {
    const payments = new CurrentPayments(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = payments.selectCurrentPaymentsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_payments WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test payments command handling [2]', () => {
    const payments = new CurrentPayments(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary' };
    const response = payments.selectCurrentPaymentsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_payments WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test payments command handling [3]', () => {
    const payments = new CurrentPayments(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary', hmm: 'test' };
    const response = payments.selectCurrentPaymentsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_payments WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test payments command handling [4]', () => {
    const payments = new CurrentPayments(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      round: 'round1',
      type: 'primary'
    };
    const response = payments.insertCurrentPaymentsMain('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_payments (
        timestamp, round, type)
      VALUES (
        1,
        'round1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_payments_unique
      DO NOTHING RETURNING round;`;
    expect(response).toBe(expected);
  });

  test('Test payments command handling [5]', () => {
    const payments = new CurrentPayments(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      round: 'round1',
      type: 'primary'
    };
    const response = payments.insertCurrentPaymentsMain('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_payments (
        timestamp, round, type)
      VALUES (
        1,
        'round1',
        'primary'), (
        1,
        'round1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_payments_unique
      DO NOTHING RETURNING round;`;
    expect(response).toBe(expected);
  });

  test('Test payments command handling [6]', () => {
    const payments = new CurrentPayments(logger, configMainCopy);
    const response = payments.deleteCurrentPaymentsMain('Pool-Main', ['round1']);
    const expected = `
      DELETE FROM "Pool-Main".current_payments
      WHERE round IN (round1);`;
    expect(response).toBe(expected);
  });
});
