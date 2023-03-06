const CurrentHashrate = require('../../../main/master/current/hashrate');
const Logger = require('../../../../server/main/logger');
const configMain = require('../../../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database hashrate functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of hashrate commands', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    expect(typeof hashrate.configMain).toBe('object');
    expect(typeof hashrate.selectCurrentHashrateMain).toBe('function');
    expect(typeof hashrate.insertCurrentHashrateMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    expect(hashrate.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(hashrate.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    expect(hashrate.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(hashrate.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(hashrate.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(hashrate.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(hashrate.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(hashrate.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test query handling [3]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    expect(hashrate.handleSpecial({ limit: '100' }, '')).toBe(' LIMIT 100');
    expect(hashrate.handleSpecial({ offset: '1' }, '')).toBe(' OFFSET 1');
    expect(hashrate.handleSpecial({ order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC');
    expect(hashrate.handleSpecial({ direction: 'ascending' }, '')).toBe(' ORDER BY id ASC');
    expect(hashrate.handleSpecial({ limit: '100', offset: '1' }, '')).toBe(' LIMIT 100 OFFSET 1');
    expect(hashrate.handleSpecial({ limit: '100', offset: '1', order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
    expect(hashrate.handleSpecial({ limit: '100', offset: '1', order: 'parameter', direction: 'descending' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
  });

  test('Test hashrate command handling [1]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', miner: 'miner1', solo: false, type: 'primary' };
    const response = hashrate.selectCurrentHashrateMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_hashrate WHERE timestamp >= 1 AND miner = \'miner1\' AND solo = false AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [2]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const response = hashrate.countCurrentHashrateMiner('Pool-Main', 1, 'primary');
    const expected = `
      SELECT CAST(COUNT(DISTINCT miner) AS INT)
      FROM "Pool-Main".current_hashrate
      WHERE timestamp >= 1
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [3]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const response = hashrate.sumCurrentHashrateMiner('Pool-Main', 1, 'primary');
    const expected = `
      SELECT miner, SUM(work) as current_work
      FROM "Pool-Main".current_hashrate
      WHERE timestamp >= 1
      AND type = 'primary' GROUP BY miner;`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [4]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', worker: 'worker1', solo: false, type: 'primary' };
    const response = hashrate.selectCurrentHashrateMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_hashrate WHERE timestamp >= 1 AND worker = \'worker1\' AND solo = false AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [5]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const response = hashrate.countCurrentHashrateWorker('Pool-Main', 1, false, 'primary');
    const expected = `
      SELECT CAST(COUNT(DISTINCT worker) AS INT)
      FROM "Pool-Main".current_hashrate
      WHERE timestamp >= 1
      AND solo = false AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [6]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const response = hashrate.sumCurrentHashrateWorker('Pool-Main', 1, false, 'primary');
    const expected = `
      SELECT worker, SUM(work) as current_work
      FROM "Pool-Main".current_hashrate
      WHERE timestamp >= 1
      AND solo = false AND type = 'primary'
      GROUP BY worker;`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [7]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', solo: false, type: 'primary' };
    const response = hashrate.selectCurrentHashrateMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_hashrate WHERE timestamp >= 1 AND solo = false AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [8]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const response = hashrate.sumCurrentHashrateType('Pool-Main', 1, false, 'primary');
    const expected = `
      SELECT SUM(work) as current_work
      FROM "Pool-Main".current_hashrate
      WHERE timestamp >= 1
      AND solo = false AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [9]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', solo: false, type: 'primary', hmm: 'test' };
    const response = hashrate.selectCurrentHashrateMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_hashrate WHERE timestamp >= 1 AND solo = false AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [10]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      identifier: 'master',
      share: 'valid',
      solo: false,
      type: 'primary',
      work: 8,
    };
    const response = hashrate.insertCurrentHashrateMain('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_hashrate (
        timestamp, miner, worker,
        identifier, share, solo,
        type, work)
      VALUES (
        1,
        'miner1',
        'worker1',
        'master',
        'valid',
        false,
        'primary',
        8);`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [11]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      identifier: 'master',
      share: 'valid',
      solo: false,
      type: 'primary',
      work: 8,
    };
    const response = hashrate.insertCurrentHashrateMain('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_hashrate (
        timestamp, miner, worker,
        identifier, share, solo,
        type, work)
      VALUES (
        1,
        'miner1',
        'worker1',
        'master',
        'valid',
        false,
        'primary',
        8), (
        1,
        'miner1',
        'worker1',
        'master',
        'valid',
        false,
        'primary',
        8);`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [12]', () => {
    const hashrate = new CurrentHashrate(logger, configMainCopy);
    const response = hashrate.deleteCurrentHashrateInactive('Pool-Main', 1);
    const expected = `
      DELETE FROM "Pool-Main".current_hashrate
      WHERE timestamp < 1;`;
    expect(response).toBe(expected);
  });
});
