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
    expect(typeof miners.selectHistoricalMinersMiner).toBe('function');
    expect(typeof miners.insertHistoricalMinersCurrentUpdate).toBe('function');
  });

  test('Test miners command handling [1]', () => {
    const miners = new HistoricalMiners(logger, configMainCopy);
    const response = miners.selectHistoricalMinersMiner('Pool-Main', 'miner1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_miners
      WHERE miner = 'miner1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [2]', () => {
    const miners = new HistoricalMiners(logger, configMainCopy);
    const response = miners.selectHistoricalMinersType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_miners
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test miners command handling [3]', () => {
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
    const response = miners.insertHistoricalMinersCurrentUpdate('Pool-Main', [updates]);
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
    const response = miners.insertHistoricalMinersCurrentUpdate('Pool-Main', [updates, updates]);
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
