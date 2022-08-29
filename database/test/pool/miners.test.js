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
    expect(typeof miners.selectPoolMinersMiner).toBe('function');
    expect(typeof miners.insertPoolMinersHashrate).toBe('function');
  });

  test('Test miners command handling [1]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const response = miners.selectPoolMinersMiner('Pool-Main', 'miner1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_miners
      WHERE miner = 'miner1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [2]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const response = miners.selectPoolMinersType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_miners
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [3]', () => {
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

  test('Test miners command handling [4]', () => {
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

  test('Test miners command handling [5]', () => {
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

  test('Test miners command handling [6]', () => {
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

  test('Test miners command handling [7]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      balance: 0,
      generate: 0,
      immature: 0,
      paid: 0,
      type: 'primary',
    };
    const response = miners.insertPoolMinersPayments('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
        timestamp, miner, balance,
        generate, immature, paid,
        type)
      VALUES (
        1,
        'miner1',
        0,
        0,
        0,
        0,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        generate = EXCLUDED.generate,
        immature = EXCLUDED.immature,
        paid = EXCLUDED.paid;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [8]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      balance: 0,
      generate: 0,
      immature: 0,
      paid: 0,
      type: 'primary',
    };
    const response = miners.insertPoolMinersPayments('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
        timestamp, miner, balance,
        generate, immature, paid,
        type)
      VALUES (
        1,
        'miner1',
        0,
        0,
        0,
        0,
        'primary'), (
        1,
        'miner1',
        0,
        0,
        0,
        0,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        generate = EXCLUDED.generate,
        immature = EXCLUDED.immature,
        paid = EXCLUDED.paid;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [9]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const response = miners.deletePoolMinersCurrent('Pool-Main', 1);
    const expected = `
      DELETE FROM "Pool-Main".pool_miners
      WHERE timestamp < 1;`;
    expect(response).toBe(expected);
  });
});
