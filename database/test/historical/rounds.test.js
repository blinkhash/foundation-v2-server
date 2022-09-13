const HistoricalRounds = require('../../main/historical/rounds');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database rounds functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of rounds commands', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    expect(typeof rounds.configMain).toBe('object');
    expect(typeof rounds.selectHistoricalRoundsMiner).toBe('function');
    expect(typeof rounds.selectHistoricalRoundsWorker).toBe('function');
  });

  test('Test rounds command handling [1]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const response = rounds.selectHistoricalRoundsMiner('Pool-Main', 'miner1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_rounds
      WHERE miner = 'miner1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [2]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const response = rounds.selectHistoricalRoundsWorker('Pool-Main', 'worker1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_rounds
      WHERE worker = 'worker1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [3]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const response = rounds.selectHistoricalRoundsIdentifier('Pool-Main', 'master', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_rounds
      WHERE identifier = 'master AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [4]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const response = rounds.selectHistoricalRoundsSpecific('Pool-Main', true, 'round1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_rounds
      WHERE solo = true AND round = 'round1'
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [5]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const response = rounds.selectHistoricalRoundsHistorical('Pool-Main', 'worker1', true, 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_rounds
      WHERE worker = 'worker1' AND solo = true
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [6]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const response = rounds.selectHistoricalRoundsCombinedSpecific('Pool-Main', 'worker1', true, 'round1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_rounds
      WHERE worker = 'worker1' AND solo = true
      AND round = 'round1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [7]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      round: 'round1',
      identifier: 'master',
      invalid: 0,
      solo: true,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 1,
      work: 8
    };
    const response = rounds.insertHistoricalRoundsCurrent('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES (
        1,
        'miner1',
        'worker1',
        'master',
        0,
        'round1',
        true,
        0,
        100,
        'primary',
        1,
        8)
      ON CONFLICT DO NOTHING;`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [8]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      round: 'round1',
      identifier: 'master',
      invalid: 0,
      solo: true,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 1,
      work: 8
    };
    const response = rounds.insertHistoricalRoundsCurrent('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES (
        1,
        'miner1',
        'worker1',
        'master',
        0,
        'round1',
        true,
        0,
        100,
        'primary',
        1,
        8), (
        1,
        'miner1',
        'worker1',
        'master',
        0,
        'round1',
        true,
        0,
        100,
        'primary',
        1,
        8)
      ON CONFLICT DO NOTHING;`;
    expect(response).toBe(expected);
  });
});
