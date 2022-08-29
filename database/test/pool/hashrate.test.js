const PoolHashrate = require('../../main/pool/hashrate');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database hashrate functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of hashrate commands', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    expect(typeof hashrate.configMain).toBe('object');
    expect(typeof hashrate.selectPoolHashrateMiner).toBe('function');
    expect(typeof hashrate.insertPoolHashrateCurrent).toBe('function');
  });

  test('Test hashrate command handling [1]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const response = hashrate.selectPoolHashrateMiner('Pool-Main', 1, 'miner1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_hashrate
      WHERE timestamp >= 1
      AND miner = 'miner1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [2]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const response = hashrate.countPoolHashrateMiner('Pool-Main', 1, 'primary');
    const expected = `
      SELECT CAST(COUNT(DISTINCT miner) AS INT)
      FROM "Pool-Main".pool_hashrate
      WHERE timestamp >= 1
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [3]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const response = hashrate.sumPoolHashrateMiner('Pool-Main', 1, 'primary');
    const expected = `
      SELECT miner, SUM(work) as current_work
      FROM "Pool-Main".pool_hashrate
      WHERE timestamp >= 1
      AND type = 'primary' GROUP BY miner;`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [4]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const response = hashrate.selectPoolHashrateWorker('Pool-Main', 1, 'worker1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_hashrate
      WHERE timestamp >= 1
      AND worker = 'worker1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [5]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const response = hashrate.countPoolHashrateWorker('Pool-Main', 1, 'primary');
    const expected = `
      SELECT CAST(COUNT(DISTINCT worker) AS INT)
      FROM "Pool-Main".pool_hashrate
      WHERE timestamp >= 1
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [6]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const response = hashrate.sumPoolHashrateWorker('Pool-Main', 1, 'primary');
    const expected = `
      SELECT worker, SUM(work) as current_work
      FROM "Pool-Main".pool_hashrate
      WHERE timestamp >= 1
      AND type = 'primary' GROUP BY worker;`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [7]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const response = hashrate.selectPoolHashrateType('Pool-Main', 1, 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_hashrate
      WHERE timestamp >= 1
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [8]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const response = hashrate.sumPoolHashrateType('Pool-Main', 1, 'primary');
    const expected = `
      SELECT SUM(work) as current_work
      FROM "Pool-Main".pool_hashrate
      WHERE timestamp >= 1
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [9]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      type: 'primary',
      work: 8,
    };
    const response = hashrate.insertPoolHashrateCurrent('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_hashrate (
        timestamp, miner, worker,
        type, work)
      VALUES (
        1,
        'miner1',
        'worker1',
        'primary',
        8);`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [10]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      type: 'primary',
      work: 8,
    };
    const response = hashrate.insertPoolHashrateCurrent('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_hashrate (
        timestamp, miner, worker,
        type, work)
      VALUES (
        1,
        'miner1',
        'worker1',
        'primary',
        8), (
        1,
        'miner1',
        'worker1',
        'primary',
        8);`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [3]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const response = hashrate.deletePoolHashrateCurrent('Pool-Main', 1);
    const expected = `
      DELETE FROM "Pool-Main".pool_hashrate
      WHERE timestamp < 1;`;
    expect(response).toBe(expected);
  });
});