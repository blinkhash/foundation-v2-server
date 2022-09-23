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
    expect(typeof workers.selectHistoricalWorkersMain).toBe('function');
    expect(typeof workers.insertHistoricalWorkersMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const workers = new HistoricalWorkers(logger, configMainCopy);
    expect(workers.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(workers.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const workers = new HistoricalWorkers(logger, configMainCopy);
    expect(workers.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(workers.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(workers.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(workers.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(workers.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(workers.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test workers command handling [1]', () => {
    const workers = new HistoricalWorkers(logger, configMainCopy);
    const parameters = { miner: 'miner1', type: 'primary' };
    const response = workers.selectHistoricalWorkersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_workers WHERE miner = \'miner1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test workers command handling [2]', () => {
    const workers = new HistoricalWorkers(logger, configMainCopy);
    const parameters = { worker: 'worker1', type: 'primary' };
    const response = workers.selectHistoricalWorkersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_workers WHERE worker = \'worker1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test workers command handling [3]', () => {
    const workers = new HistoricalWorkers(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = workers.selectHistoricalWorkersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_workers WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test workers command handling [4]', () => {
    const workers = new HistoricalWorkers(logger, configMainCopy);
    const parameters = { type: 'primary', hmm: 'test' };
    const response = workers.selectHistoricalWorkersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_workers WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test workers command handling [5]', () => {
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
    const response = workers.insertHistoricalWorkersMain('Pool-Main', [updates]);
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

  test('Test workers command handling [6]', () => {
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
    const response = workers.insertHistoricalWorkersMain('Pool-Main', [updates, updates]);
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
