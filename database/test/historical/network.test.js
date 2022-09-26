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
    expect(typeof network.selectHistoricalNetworkMain).toBe('function');
    expect(typeof network.insertHistoricalNetworkMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const network = new HistoricalNetwork(logger, configMainCopy);
    expect(network.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(network.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const network = new HistoricalNetwork(logger, configMainCopy);
    expect(network.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(network.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(network.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(network.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(network.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(network.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test query handling [3]', () => {
    const network = new HistoricalNetwork(logger, configMainCopy);
    expect(network.handleSpecial({ limit: '100' }, '')).toBe(' LIMIT 100');
    expect(network.handleSpecial({ offset: '1' }, '')).toBe(' OFFSET 1');
    expect(network.handleSpecial({ order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC');
    expect(network.handleSpecial({ direction: 'ascending' }, '')).toBe(' ORDER BY id ASC');
    expect(network.handleSpecial({ limit: '100', offset: '1' }, '')).toBe(' LIMIT 100 OFFSET 1');
    expect(network.handleSpecial({ limit: '100', offset: '1', order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
    expect(network.handleSpecial({ limit: '100', offset: '1', order: 'parameter', direction: 'descending' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
  });

  test('Test network command handling [1]', () => {
    const network = new HistoricalNetwork(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = network.selectHistoricalNetworkMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_network WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test network command handling [2]', () => {
    const network = new HistoricalNetwork(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary' };
    const response = network.selectHistoricalNetworkMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_network WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test network command handling [3]', () => {
    const network = new HistoricalNetwork(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary', hmm: 'test' };
    const response = network.selectHistoricalNetworkMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_network WHERE timestamp >= 1 AND type = \'primary\';';
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
    const response = network.insertHistoricalNetworkMain('Pool-Main', [updates]);
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
    const response = network.insertHistoricalNetworkMain('Pool-Main', [updates, updates]);
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
