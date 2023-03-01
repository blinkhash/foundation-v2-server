const CurrentWorkers = require('../../main/master/current/workers');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database workers functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of workers commands', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    expect(typeof workers.configMain).toBe('object');
    expect(typeof workers.selectCurrentWorkersMain).toBe('function');
    expect(typeof workers.insertCurrentWorkersHashrate).toBe('function');
  });

  test('Test query handling [1]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    expect(workers.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(workers.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    expect(workers.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(workers.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(workers.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(workers.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(workers.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(workers.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test query handling [3]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    expect(workers.handleSpecial({ limit: '100' }, '')).toBe(' LIMIT 100');
    expect(workers.handleSpecial({ offset: '1' }, '')).toBe(' OFFSET 1');
    expect(workers.handleSpecial({ order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC');
    expect(workers.handleSpecial({ direction: 'ascending' }, '')).toBe(' ORDER BY id ASC');
    expect(workers.handleSpecial({ limit: '100', offset: '1' }, '')).toBe(' LIMIT 100 OFFSET 1');
    expect(workers.handleSpecial({ limit: '100', offset: '1', order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
    expect(workers.handleSpecial({ limit: '100', offset: '1', order: 'parameter', direction: 'descending' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
  });

  test('Test workers command handling [1]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    const parameters = { miner: 'miner1', type: 'primary' };
    const response = workers.selectCurrentWorkersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_workers WHERE miner = \'miner1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test workers command handling [2]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    const parameters = { worker: 'worker1', type: 'primary' };
    const response = workers.selectCurrentWorkersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_workers WHERE worker = \'worker1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test workers command handling [3]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = workers.selectCurrentWorkersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_workers WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test workers command handling [4]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    const parameters = { type: 'primary', hmm: 'test' };
    const response = workers.selectCurrentWorkersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_workers WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test workers command handling [4]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    const updates = {
      worker: 'worker1',
      miner: 'miner1',
      timestamp: 1,
      hashrate: 1,
      solo: false,
      type: 'primary',
    };
    const response = workers.insertCurrentWorkersHashrate('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES (
        1,
        'miner1',
        'worker1',
        1,
        false,
        'primary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [5]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    const updates = {
      worker: 'worker1',
      miner: 'miner1',
      timestamp: 1,
      hashrate: 1,
      solo: false,
      type: 'primary',
    };
    const response = workers.insertCurrentWorkersHashrate('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_workers (
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
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [6]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    const updates = {
      worker: 'worker1',
      miner: 'miner1',
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      invalid: 0,
      solo: false,
      stale: 0,
      type: 'primary',
      valid: 1,
    };
    const response = workers.insertCurrentWorkersRounds('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_workers (
        timestamp, miner, worker,
        efficiency, effort, invalid,
        solo, stale, type, valid)
      VALUES (
        1,
        'miner1',
        'worker1',
        100,
        100,
        0,
        false,
        0,
        'primary',
        1)
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Main".current_workers.invalid + EXCLUDED.invalid,
        solo = EXCLUDED.solo,
        stale = "Pool-Main".current_workers.stale + EXCLUDED.stale,
        valid = "Pool-Main".current_workers.valid + EXCLUDED.valid;`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [7]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    const updates = {
      worker: 'worker1',
      miner: 'miner1',
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      invalid: 0,
      solo: false,
      stale: 0,
      type: 'primary',
      valid: 1,
    };
    const response = workers.insertCurrentWorkersRounds('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_workers (
        timestamp, miner, worker,
        efficiency, effort, invalid,
        solo, stale, type, valid)
      VALUES (
        1,
        'miner1',
        'worker1',
        100,
        100,
        0,
        false,
        0,
        'primary',
        1), (
        1,
        'miner1',
        'worker1',
        100,
        100,
        0,
        false,
        0,
        'primary',
        1)
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Main".current_workers.invalid + EXCLUDED.invalid,
        solo = EXCLUDED.solo,
        stale = "Pool-Main".current_workers.stale + EXCLUDED.stale,
        valid = "Pool-Main".current_workers.valid + EXCLUDED.valid;`;
    expect(response).toBe(expected);
  });

  test('Test workers command handling [8]', () => {
    const workers = new CurrentWorkers(logger, configMainCopy);
    const response = workers.deleteCurrentWorkersInactive('Pool-Main', 1);
    const expected = `
      DELETE FROM "Pool-Main".current_workers
      WHERE timestamp < 1;`;
    expect(response).toBe(expected);
  });
});
