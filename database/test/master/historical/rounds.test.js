const HistoricalRounds = require('../../../main/master/historical/rounds');
const Logger = require('../../../../server/main/logger');
const configMain = require('../../../../configs/main/example.js');
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
    expect(typeof rounds.selectHistoricalRoundsMain).toBe('function');
    expect(typeof rounds.insertHistoricalRoundsMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    expect(rounds.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(rounds.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    expect(rounds.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(rounds.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(rounds.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(rounds.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(rounds.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(rounds.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test query handling [3]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    expect(rounds.handleSpecial({ limit: '100' }, '')).toBe(' LIMIT 100');
    expect(rounds.handleSpecial({ offset: '1' }, '')).toBe(' OFFSET 1');
    expect(rounds.handleSpecial({ order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC');
    expect(rounds.handleSpecial({ direction: 'ascending' }, '')).toBe(' ORDER BY id ASC');
    expect(rounds.handleSpecial({ limit: '100', offset: '1' }, '')).toBe(' LIMIT 100 OFFSET 1');
    expect(rounds.handleSpecial({ limit: '100', offset: '1', order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
    expect(rounds.handleSpecial({ limit: '100', offset: '1', order: 'parameter', direction: 'descending' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
  });

  test('Test rounds command handling [1]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const parameters = { miner: 'miner1', type: 'primary' };
    const response = rounds.selectHistoricalRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_rounds WHERE miner = \'miner1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [2]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const parameters = { worker: 'worker1', type: 'primary' };
    const response = rounds.selectHistoricalRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_rounds WHERE worker = \'worker1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [3]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const parameters = { identifier: 'master', type: 'primary' };
    const response = rounds.selectHistoricalRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_rounds WHERE identifier = \'master\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [4]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const parameters = { solo: true, round: 'round1', type: 'primary' };
    const response = rounds.selectHistoricalRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_rounds WHERE solo = true AND round = \'round1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [5]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const parameters = { worker: 'worker1', solo: true, type: 'primary' };
    const response = rounds.selectHistoricalRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_rounds WHERE worker = \'worker1\' AND solo = true AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [6]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const parameters = { worker: 'worker1', solo: true, round: 'round1', type: 'primary' };
    const response = rounds.selectHistoricalRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_rounds WHERE worker = \'worker1\' AND solo = true AND round = \'round1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [7]', () => {
    const rounds = new HistoricalRounds(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary', hmm: 'test' };
    const response = rounds.selectHistoricalRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".historical_rounds WHERE timestamp >= 1 AND type = \'primary\';';
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
    const response = rounds.insertHistoricalRoundsMain('Pool-Main', [updates]);
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

  test('Test rounds command handling [9]', () => {
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
    const response = rounds.insertHistoricalRoundsMain('Pool-Main', [updates, updates]);
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
