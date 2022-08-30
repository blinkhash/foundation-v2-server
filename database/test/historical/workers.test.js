const HistoricalWorkers = require('../../main/historical/workers');
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
    const workers = new HistoricalWorkers(logger, configMainCopy);
    expect(typeof workers.configMain).toBe('object');
    expect(typeof workers.selectHistoricalWorkersMiner).toBe('function');
    expect(typeof workers.insertHistoricalWorkersCurrent).toBe('function');
  });

  test('Test workers command handling [1]', () => {
    const workers = new HistoricalWorkers(logger, configMainCopy);
    const response = workers.selectHistoricalWorkersMiner('Pool-Main', 'miner1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_workers
      WHERE miner = 'miner1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [2]', () => {
    const workers = new HistoricalWorkers(logger, configMainCopy);
    const response = workers.selectHistoricalWorkersWorker('Pool-Main', 'worker1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_workers
      WHERE worker = 'worker1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [3]', () => {
    const workers = new HistoricalWorkers(logger, configMainCopy);
    const response = workers.selectHistoricalWorkersType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_workers
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [4]', () => {
    const workers = new HistoricalWorkers(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      recent: 1,
      miner: 'miner1',
      worker: 'worker1',
      efficiency: 100,
      effort: 100,
      hashrate: 1,
      type: 'primary',
    };
    const response = workers.insertHistoricalWorkersCurrent('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_workers (
        timestamp, recent, miner,
        worker, efficiency, effort,
        hashrate, type)
      VALUES (
        1,
        1,
        'miner1',
        'worker1',
        100,
        100,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT historical_workers_recent
      DO NOTHING;`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [4]', () => {
    const workers = new HistoricalWorkers(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      recent: 1,
      miner: 'miner1',
      worker: 'worker1',
      efficiency: 100,
      effort: 100,
      hashrate: 1,
      type: 'primary',
    };
    const response = workers.insertHistoricalWorkersCurrent('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_workers (
        timestamp, recent, miner,
        worker, efficiency, effort,
        hashrate, type)
      VALUES (
        1,
        1,
        'miner1',
        'worker1',
        100,
        100,
        1,
        'primary'), (
        1,
        1,
        'miner1',
        'worker1',
        100,
        100,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT historical_workers_recent
      DO NOTHING;`;
    expect(response).toBe(expected);
  });
});
