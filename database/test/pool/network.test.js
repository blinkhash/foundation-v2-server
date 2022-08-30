const PoolNetwork = require('../../main/pool/network');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database network functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of network commands', () => {
    const network = new PoolNetwork(logger, configMainCopy);
    expect(typeof network.configMain).toBe('object');
    expect(typeof network.selectPoolNetworkType).toBe('function');
    expect(typeof network.insertPoolNetworkCurrent).toBe('function');
  });

  test('Test network command handling [1]', () => {
    const network = new PoolNetwork(logger, configMainCopy);
    const response = network.selectPoolNetworkType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_network
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test network command handling [2]', () => {
    const network = new PoolNetwork(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      difficulty: 1,
      hashrate: 1,
      height: 1,
      type: 'primary',
    };
    const response = network.insertPoolNetworkCurrent('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_network (
        timestamp, difficulty,
        hashrate, height, type)
      VALUES (
        1,
        1,
        1,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_network_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        difficulty = EXCLUDED.difficulty,
        hashrate = EXCLUDED.hashrate,
        height = EXCLUDED.height;`;
    expect(response).toBe(expected);
  });

  test('Test network command handling [3]', () => {
    const network = new PoolNetwork(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      difficulty: 1,
      hashrate: 1,
      height: 1,
      type: 'primary',
    };
    const response = network.insertPoolNetworkCurrent('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_network (
        timestamp, difficulty,
        hashrate, height, type)
      VALUES (
        1,
        1,
        1,
        1,
        'primary'), (
        1,
        1,
        1,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_network_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        difficulty = EXCLUDED.difficulty,
        hashrate = EXCLUDED.hashrate,
        height = EXCLUDED.height;`;
    expect(response).toBe(expected);
  });
});
