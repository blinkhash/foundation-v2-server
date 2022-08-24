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
    expect(typeof hashrate.selectPoolHashrateCurrent).toBe('function');
    expect(typeof hashrate.insertPoolHashrateCurrent).toBe('function');
  });

  test('Test hashrate command handling [1]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const response = hashrate.selectPoolHashrateCurrent('Pool-Main', 1);
    const expected = `
      SELECT SUM(work) as current_hashrate
      FROM "Pool-Main".pool_hashrate
      WHERE timestamp >= 1;`;
    expect(response).toBe(expected);
  });

  test('Test hashrate command handling [2]', () => {
    const hashrate = new PoolHashrate(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      work: 8,
    };
    const response = hashrate.insertPoolHashrateCurrent('Pool-Main', updates);
    const expected = `
      INSERT INTO "Pool-Main".pool_hashrate (
        timestamp, miner, worker, work)
      VALUES (
        1,
        'miner1',
        'worker1',
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
