const PoolMiners = require('../../main/pool/miners');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database miners functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of miners commands', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    expect(typeof miners.configMain).toBe('object');
    expect(typeof miners.selectPoolMinersCurrent).toBe('function');
    expect(typeof miners.insertPoolMinersHashrate).toBe('function');
  });

  test('Test query handling [1]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    expect(miners.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(miners.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    expect(miners.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(miners.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(miners.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(miners.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(miners.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(miners.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test miners command handling [1]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const parameters = { miner: 'miner1', type: 'primary' };
    const response = miners.selectPoolMinersCurrent('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".pool_miners WHERE miner = \'miner1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test miners command handling [2]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const parameters = { balance: 'gt0', type: 'primary' };
    const response = miners.selectPoolMinersCurrent('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".pool_miners WHERE balance > 0 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test miners command handling [3]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = miners.selectPoolMinersCurrent('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".pool_miners WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test miners command handling [4]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const parameters = { type: 'primary', hmm: 'test' };
    const response = miners.selectPoolMinersCurrent('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".pool_miners WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test miners command handling [5]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      hashrate: 1,
      type: 'primary',
    };
    const response = miners.insertPoolMinersHashrate('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
        timestamp, miner, hashrate,
        type)
      VALUES (
        1,
        'miner1',
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [6]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      hashrate: 1,
      type: 'primary',
    };
    const response = miners.insertPoolMinersHashrate('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
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
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [7]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      type: 'primary',
    };
    const response = miners.insertPoolMinersRounds('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
        timestamp, miner, efficiency,
        effort, type)
      VALUES (
        1,
        'miner1',
        100,
        100,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [8]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      type: 'primary',
    };
    const response = miners.insertPoolMinersRounds('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
        timestamp, miner, efficiency,
        effort, type)
      VALUES (
        1,
        'miner1',
        100,
        100,
        'primary'), (
        1,
        'miner1',
        100,
        100,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [9]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      balance: 0,
      paid: 0,
      type: 'primary',
    };
    const response = miners.insertPoolMinersPayments('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
        timestamp, miner, balance,
        paid, type)
      VALUES (
        1,
        'miner1',
        0,
        0,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        paid = "Pool-Main".pool_miners.paid + EXCLUDED.paid;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [10]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      balance: 0,
      paid: 0,
      type: 'primary',
    };
    const response = miners.insertPoolMinersPayments('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
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
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        paid = "Pool-Main".pool_miners.paid + EXCLUDED.paid;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [11]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      generate: 0,
      immature: 0,
      type: 'primary',
    };
    const response = miners.insertPoolMinersUpdates('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
        timestamp, miner, generate,
        immature, type)
      VALUES (
        1,
        'miner1',
        0,
        0,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        generate = EXCLUDED.generate,
        immature = EXCLUDED.immature;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [12]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      generate: 0,
      immature: 0,
      type: 'primary',
    };
    const response = miners.insertPoolMinersUpdates('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
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
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        generate = EXCLUDED.generate,
        immature = EXCLUDED.immature;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [13]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const response = miners.insertPoolMinersReset('Pool-Main', 'primary');
    const expected = `
      UPDATE "Pool-Main".pool_miners
      SET immature = 0, generate = 0
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [14]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const response = miners.deletePoolMinersInactive('Pool-Main', 1);
    const expected = `
      DELETE FROM "Pool-Main".pool_miners
      WHERE timestamp < 1 AND balance = 0
      AND generate = 0 AND immature = 0 AND paid = 0;`;
    expect(response).toBe(expected);
  });
});
