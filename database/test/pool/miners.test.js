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
    const response = miners.insertPoolMinersHashrate('Pool-Main', updates);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
        miner, timestamp, hashrate,
        type)
      VALUES (
        'miner1',
        1,
        1,
        'primary')
      ON CONFLICT (miner)
      DO UPDATE SET
        timestamp = 1,
        hashrate = 1;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [4]', () => {
    const miners = new PoolMiners(logger, configMainCopy);
    const updates = {
      miner: 'miner1',
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      type: 'primary',
    };
    const response = miners.insertPoolMinersRounds('Pool-Main', updates);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
        miner, timestamp, efficiency,
        effort, type)
      VALUES (
        'miner1',
        1,
        100,
        100,
        'primary')
      ON CONFLICT (miner)
      DO UPDATE SET
        timestamp = 1,
        efficiency = 100,
        effort = 100;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [5]', () => {
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
    const response = miners.insertPoolMinersPayments('Pool-Main', updates);
    const expected = `
      INSERT INTO "Pool-Main".pool_miners (
        miner, timestamp, balance,
        generate, immature, paid,
        type)
      VALUES (
        'miner1',
        1,
        0,
        0,
        0,
        0,
        'primary')
      ON CONFLICT (miner)
      DO UPDATE SET
        timestamp = 1,
        balance = 0,
        generate = 0,
        immature = 0,
        paid = 0;`;
    expect(response).toBe(expected);
  });
});
