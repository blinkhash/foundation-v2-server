const CurrentRounds = require('../../main/current/rounds');
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
    const rounds = new CurrentRounds(logger, configMainCopy);
    expect(typeof rounds.configMain).toBe('object');
    expect(typeof rounds.selectCurrentRoundsMain).toBe('function');
    expect(typeof rounds.insertCurrentRoundsMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    expect(rounds.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(rounds.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    expect(rounds.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(rounds.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(rounds.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(rounds.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(rounds.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(rounds.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test query handling [3]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    expect(rounds.handleSpecial({ limit: '100' }, '')).toBe(' LIMIT 100');
    expect(rounds.handleSpecial({ offset: '1' }, '')).toBe(' OFFSET 1');
    expect(rounds.handleSpecial({ order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC');
    expect(rounds.handleSpecial({ direction: 'ascending' }, '')).toBe(' ORDER BY id ASC');
    expect(rounds.handleSpecial({ limit: '100', offset: '1' }, '')).toBe(' LIMIT 100 OFFSET 1');
    expect(rounds.handleSpecial({ limit: '100', offset: '1', order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
    expect(rounds.handleSpecial({ limit: '100', offset: '1', order: 'parameter', direction: 'descending' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
  });

  test('Test rounds command handling [1]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const parameters = { miner: 'miner1', type: 'primary' };
    const response = rounds.selectCurrentRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_rounds WHERE miner = \'miner1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [2]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const parameters = { worker: 'worker1', type: 'primary' };
    const response = rounds.selectCurrentRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_rounds WHERE worker = \'worker1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [3]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const parameters = { identifier: 'master', type: 'primary' };
    const response = rounds.selectCurrentRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_rounds WHERE identifier = \'master\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [4]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const parameters = { solo: true, round: 'round1', type: 'primary' };
    const response = rounds.selectCurrentRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_rounds WHERE solo = true AND round = \'round1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [5]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const parameters = { worker: 'worker1', solo: true, type: 'primary' };
    const response = rounds.selectCurrentRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_rounds WHERE worker = \'worker1\' AND solo = true AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [6]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const parameters = { worker: 'worker1', solo: true, round: 'round1', type: 'primary' };
    const response = rounds.selectCurrentRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_rounds WHERE worker = \'worker1\' AND solo = true AND round = \'round1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [7]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary', hmm: 'test' };
    const response = rounds.selectCurrentRoundsMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_rounds WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [8]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      recent: 1,
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
    const response = rounds.insertCurrentRoundsMain('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_rounds (
        timestamp, recent, miner,
        worker, identifier, invalid,
        round, solo, stale, times,
        type, valid, work)
      VALUES (
        1,
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
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Main".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Main".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Main".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Main".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Main".current_rounds.work + EXCLUDED.work;`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [9]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      recent: 1,
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
    const response = rounds.insertCurrentRoundsMain('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_rounds (
        timestamp, recent, miner,
        worker, identifier, invalid,
        round, solo, stale, times,
        type, valid, work)
      VALUES (
        1,
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
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Main".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Main".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Main".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Main".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Main".current_rounds.work + EXCLUDED.work;`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [10]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const response = rounds.updateCurrentRoundsMainSolo('Pool-Main', 'miner1', 'round1', 'primary');
    const expected = `
      UPDATE "Pool-Main".current_rounds
      SET round = 'round1'
      WHERE round = 'current' AND miner = 'miner1'
      AND solo = true AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [11]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const response = rounds.updateCurrentRoundsMainShared('Pool-Main', 'round1', 'primary');
    const expected = `
      UPDATE "Pool-Main".current_rounds
      SET round = 'round1'
      WHERE round = 'current' AND solo = false
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [12]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const response = rounds.deleteCurrentRoundsInactive('Pool-Main', 1);
    const expected = `
      DELETE FROM "Pool-Main".current_rounds
      WHERE round = 'current' AND timestamp < 1;`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [13]', () => {
    const rounds = new CurrentRounds(logger, configMainCopy);
    const response = rounds.deleteCurrentRoundsMain('Pool-Main', ['round1']);
    const expected = `
      DELETE FROM "Pool-Main".current_rounds
      WHERE round IN (round1);`;
    expect(response).toBe(expected);
  });
});
