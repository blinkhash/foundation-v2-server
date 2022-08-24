const PoolWorkers = require('../../main/pool/workers');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database workers functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of workers commands', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    expect(typeof workers.configMain).toBe('object');
    expect(typeof workers.selectPoolWorkersMiner).toBe('function');
    expect(typeof workers.insertPoolWorkersHashrate).toBe('function');
  });

  test('Test workers command handling [1]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const response = workers.selectPoolWorkersWorker('Pool-Main', 'worker1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_workers
      WHERE worker = 'worker1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [2]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const response = workers.selectPoolWorkersMiner('Pool-Main', 'miner1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_workers
      WHERE miner = 'miner1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [3]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const response = workers.selectPoolWorkersType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_workers
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [4]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const updates = {
      worker: 'worker1',
      miner: 'miner1',
      timestamp: 1,
      hashrate: 1,
      type: 'primary',
    };
    const response = workers.insertPoolWorkersHashrate('Pool-Main', updates);
    const expected = `
      INSERT INTO "Pool-Main".pool_workers (
        worker, miner, timestamp,
        hashrate, type)
      VALUES (
        'worker1',
        'miner1',
        1,
        1,
        'primary')
      ON CONFLICT (worker)
      DO UPDATE SET
        timestamp = 1,
        hashrate = 1;`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [5]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const updates = {
      worker: 'worker1',
      miner: 'miner1',
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      type: 'primary',
    };
    const response = workers.insertPoolWorkersRounds('Pool-Main', updates);
    const expected = `
      INSERT INTO "Pool-Main".pool_workers (
        worker, miner, timestamp,
        efficiency, effort, type)
      VALUES (
        'worker1',
        'miner1',
        1,
        100,
        100,
        'primary')
      ON CONFLICT (worker)
      DO UPDATE SET
        timestamp = 1,
        efficiency = 100,
        effort = 100;`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [6]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const updates = {
      worker: 'worker1',
      miner: 'miner1',
      timestamp: 1,
      balance: 0,
      generate: 0,
      immature: 0,
      paid: 0,
      type: 'primary',
    };
    const response = workers.insertPoolWorkersPayments('Pool-Main', updates);
    const expected = `
      INSERT INTO "Pool-Main".pool_workers (
        worker, miner, timestamp,
        balance, generate, immature,
        paid, type)
      VALUES (
        'worker1',
        'miner1',
        1,
        0,
        0,
        0,
        0,
        'primary')
      ON CONFLICT (worker)
      DO UPDATE SET
        timestamp = 1,
        balance = 0,
        generate = 0,
        immature = 0,
        paid = 0;`;
    expect(response).toBe(expected);
  });
});
