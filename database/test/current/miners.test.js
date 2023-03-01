const CurrentMiners = require('../../main/master/current/miners');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database miners functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of miners commands', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    expect(typeof miners.configMain).toBe('object');
    expect(typeof miners.selectCurrentMinersMain).toBe('function');
    expect(typeof miners.insertCurrentMinersHashrate).toBe('function');
  });

  test('Test query handling [1]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    expect(miners.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(miners.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    expect(miners.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(miners.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(miners.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(miners.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(miners.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(miners.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test query handling [3]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    expect(miners.handleSpecial({ limit: '100' }, '')).toBe(' LIMIT 100');
    expect(miners.handleSpecial({ offset: '1' }, '')).toBe(' OFFSET 1');
    expect(miners.handleSpecial({ order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC');
    expect(miners.handleSpecial({ direction: 'ascending' }, '')).toBe(' ORDER BY id ASC');
    expect(miners.handleSpecial({ limit: '100', offset: '1' }, '')).toBe(' LIMIT 100 OFFSET 1');
    expect(miners.handleSpecial({ limit: '100', offset: '1', order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
    expect(miners.handleSpecial({ limit: '100', offset: '1', order: 'parameter', direction: 'descending' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
  });

  test('Test miners command handling [1]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const parameters = { miner: 'miner1', type: 'primary' };
    const response = miners.selectCurrentMinersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_miners WHERE miner = \'miner1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test miners command handling [2]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const parameters = { balance: 'gt0', type: 'primary' };
    const response = miners.selectCurrentMinersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_miners WHERE balance > 0 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test miners command handling [3]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = miners.selectCurrentMinersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_miners WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test miners command handling [4]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const parameters = { type: 'primary', hmm: 'test' };
    const response = miners.selectCurrentMinersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_miners WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test miners command handling [5]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      hashrate: 1,
      type: 'primary',
    };
    const response = miners.insertCurrentMinersHashrate('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_miners (
        timestamp, miner, hashrate,
        type)
      VALUES (
        1,
        'miner1',
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [6]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      hashrate: 1,
      type: 'primary',
    };
    const response = miners.insertCurrentMinersHashrate('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_miners (
        timestamp, miner, hashrate,
        type)
      VALUES (
        1,
        'miner1',
        1,
        'primary'), (
        1,
        'miner1',
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [7]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 1,
    };
    const response = miners.insertCurrentMinersRounds('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_miners (
        timestamp, miner, efficiency,
        effort, invalid, stale, type,
        valid)
      VALUES (
        1,
        'miner1',
        100,
        100,
        0,
        0,
        'primary',
        1)
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Main".current_miners.invalid + EXCLUDED.invalid,
        stale = "Pool-Main".current_miners.stale + EXCLUDED.stale,
        valid = "Pool-Main".current_miners.valid + EXCLUDED.valid;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [8]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 1,
    };
    const response = miners.insertCurrentMinersRounds('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_miners (
        timestamp, miner, efficiency,
        effort, invalid, stale, type,
        valid)
      VALUES (
        1,
        'miner1',
        100,
        100,
        0,
        0,
        'primary',
        1), (
        1,
        'miner1',
        100,
        100,
        0,
        0,
        'primary',
        1)
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Main".current_miners.invalid + EXCLUDED.invalid,
        stale = "Pool-Main".current_miners.stale + EXCLUDED.stale,
        valid = "Pool-Main".current_miners.valid + EXCLUDED.valid;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [9]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      balance: 0,
      paid: 0,
      type: 'primary',
    };
    const response = miners.insertCurrentMinersPayments('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_miners (
        timestamp, miner, balance,
        paid, type)
      VALUES (
        1,
        'miner1',
        0,
        0,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        paid = "Pool-Main".current_miners.paid + EXCLUDED.paid;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [10]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      balance: 0,
      paid: 0,
      type: 'primary',
    };
    const response = miners.insertCurrentMinersPayments('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_miners (
        timestamp, miner, balance,
        paid, type)
      VALUES (
        1,
        'miner1',
        0,
        0,
        'primary'), (
        1,
        'miner1',
        0,
        0,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        paid = "Pool-Main".current_miners.paid + EXCLUDED.paid;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [11]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      generate: 0,
      immature: 0,
      type: 'primary',
    };
    const response = miners.insertCurrentMinersUpdates('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_miners (
        timestamp, miner, generate,
        immature, type)
      VALUES (
        1,
        'miner1',
        0,
        0,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        generate = "Pool-Main".current_miners.generate + EXCLUDED.generate,
        immature = "Pool-Main".current_miners.immature + EXCLUDED.immature;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [12]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      generate: 0,
      immature: 0,
      type: 'primary',
    };
    const response = miners.insertCurrentMinersUpdates('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_miners (
        timestamp, miner, generate,
        immature, type)
      VALUES (
        1,
        'miner1',
        0,
        0,
        'primary'), (
        1,
        'miner1',
        0,
        0,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        generate = "Pool-Main".current_miners.generate + EXCLUDED.generate,
        immature = "Pool-Main".current_miners.immature + EXCLUDED.immature;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [13]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const response = miners.insertCurrentMinersReset('Pool-Main', 'primary');
    const expected = `
      UPDATE "Pool-Main".current_miners
      SET generate = 0 WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [14]', () => {
    const miners = new CurrentMiners(logger, configMainCopy);
    const response = miners.deleteCurrentMinersInactive('Pool-Main', 1);
    const expected = `
      DELETE FROM "Pool-Main".current_miners
      WHERE timestamp < 1 AND balance = 0
      AND generate = 0 AND immature = 0 AND paid = 0;`;
    expect(response).toBe(expected);
  });
});
