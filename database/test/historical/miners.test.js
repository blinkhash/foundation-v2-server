const HistoricalMiners = require('../../main/historical/miners');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database miners functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of miners commands', () => {
    const miners = new HistoricalMiners(logger, configMainCopy);
    expect(typeof miners.configMain).toBe('object');
    expect(typeof miners.selectHistoricalMinersMain).toBe('function');
    expect(typeof miners.insertHistoricalMinersMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const miners = new HistoricalMiners(logger, configMainCopy);
    expect(miners.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(miners.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const miners = new HistoricalMiners(logger, configMainCopy);
    expect(miners.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(miners.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(miners.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(miners.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(miners.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(miners.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test miners command handling [1]', () => {
    const miners = new HistoricalMiners(logger, configMainCopy);
    const parameters = { miner: 'miner1', type: 'primary' };
    const response = miners.selectHistoricalMinersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_miners WHERE miner = \'miner1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test miners command handling [2]', () => {
    const miners = new HistoricalMiners(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = miners.selectHistoricalMinersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_miners WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test miners command handling [3]', () => {
    const miners = new HistoricalMiners(logger, configMainCopy);
    const parameters = { type: 'primary', hmm: 'test' };
    const response = miners.selectHistoricalMinersMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_miners WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test miners command handling [4]', () => {
    const miners = new HistoricalMiners(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      recent: 1,
      miner: 'miner1',
      efficiency: 100,
      effort: 100,
      hashrate: 1,
      type: 'primary',
    };
    const response = miners.insertHistoricalMinersMain('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_miners (
        timestamp, recent, miner,
        efficiency, effort, hashrate,
        type)
      VALUES (
        1,
        1,
        'miner1',
        100,
        100,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT historical_miners_recent
      DO NOTHING;`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [5]', () => {
    const miners = new HistoricalMiners(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      recent: 1,
      miner: 'miner1',
      efficiency: 100,
      effort: 100,
      hashrate: 1,
      type: 'primary',
    };
    const response = miners.insertHistoricalMinersMain('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_miners (
        timestamp, recent, miner,
        efficiency, effort, hashrate,
        type)
      VALUES (
        1,
        1,
        'miner1',
        100,
        100,
        1,
        'primary'), (
        1,
        1,
        'miner1',
        100,
        100,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT historical_miners_recent
      DO NOTHING;`;
    expect(response).toBe(expected);
  });
});
