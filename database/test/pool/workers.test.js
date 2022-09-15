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
    const response = workers.selectPoolWorkersMiner('Pool-Main', 'miner1', false, 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_workers
      WHERE miner = 'miner1' AND solo = false
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [2]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const response = workers.selectPoolWorkersWorker('Pool-Main', 'worker1', false, 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_workers
      WHERE worker = 'worker1' AND solo = false
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [3]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const response = workers.selectPoolWorkersType('Pool-Main', false, 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_workers
      WHERE solo = false AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [4]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const updates = {
      worker: 'worker1',
      miner: 'miner1',
      timestamp: 1,
      hashrate: 1,
      solo: false,
      type: 'primary',
    };
    const response = workers.insertPoolWorkersHashrate('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES (
        1,
        'miner1',
        'worker1',
        1,
        false,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [5]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const updates = {
      worker: 'worker1',
      miner: 'miner1',
      timestamp: 1,
      hashrate: 1,
      solo: false,
      type: 'primary',
    };
    const response = workers.insertPoolWorkersHashrate('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES (
        1,
        'miner1',
        'worker1',
        1,
        false,
        'primary'), (
        1,
        'miner1',
        'worker1',
        1,
        false,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [6]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const updates = {
      worker: 'worker1',
      miner: 'miner1',
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      solo: false,
      type: 'primary',
    };
    const response = workers.insertPoolWorkersRounds('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_workers (
        timestamp, miner, worker,
        efficiency, effort, solo,
        type)
      VALUES (
        1,
        'miner1',
        'worker1',
        100,
        100,
        false,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        solo = EXCLUDED.solo;`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [7]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const updates = {
      worker: 'worker1',
      miner: 'miner1',
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      solo: false,
      type: 'primary',
    };
    const response = workers.insertPoolWorkersRounds('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_workers (
        timestamp, miner, worker,
        efficiency, effort, solo,
        type)
      VALUES (
        1,
        'miner1',
        'worker1',
        100,
        100,
        false,
        'primary'), (
        1,
        'miner1',
        'worker1',
        100,
        100,
        false,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        solo = EXCLUDED.solo;`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [8]', () => {
    const workers = new PoolWorkers(logger, configMainCopy);
    const response = workers.deletePoolWorkersInactive('Pool-Main', 1);
    const expected = `
      DELETE FROM "Pool-Main".pool_workers
      WHERE timestamp < 1;`;
    expect(response).toBe(expected);
  });
});
