const HistoricalNetwork = require('../../main/historical/network');
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
    const network = new HistoricalNetwork(logger, configMainCopy);
    expect(typeof network.configMain).toBe('object');
    expect(typeof network.selectHistoricalNetworkType).toBe('function');
    expect(typeof network.insertHistoricalNetworkCurrentUpdate).toBe('function');
  });

  test('Test network command handling [1]', () => {
    const network = new HistoricalNetwork(logger, configMainCopy);
    const response = network.selectHistoricalNetworkType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_network
      WHERE type = 'primary'`;
    expect(response).toBe(expected);
  });

  test('Test network command handling [2]', () => {
    const network = new HistoricalNetwork(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      recent: 1,
      difficulty: 1,
      hashrate: 1,
      height: 1,
      type: 'primary',
    };
    const response = network.insertHistoricalNetworkCurrentUpdate('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_network (
        timestamp, recent, difficulty,
        hashrate, height, type)
      VALUES (
        1,
        1,
        1,
        1,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT historical_network_recent
      DO NOTHING;`;
    expect(response).toBe(expected);
  });

  test('Test network command handling [3]', () => {
    const network = new HistoricalNetwork(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      recent: 1,
      difficulty: 1,
      hashrate: 1,
      height: 1,
      type: 'primary',
    };
    const response = network.insertHistoricalNetworkCurrentUpdate('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_network (
        timestamp, recent, difficulty,
        hashrate, height, type)
      VALUES (
        1,
        1,
        1,
        1,
        1,
        'primary'), (
        1,
        1,
        1,
        1,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT historical_network_recent
      DO NOTHING;`;
    expect(response).toBe(expected);
  });
});
