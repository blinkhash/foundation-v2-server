const PoolRounds = require('../../main/pool/rounds');
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
    const rounds = new PoolRounds(logger, configMainCopy);
    expect(typeof rounds.configMain).toBe('object');
    expect(typeof rounds.selectPoolRoundsMiner).toBe('function');
    expect(typeof rounds.selectPoolRoundsWorker).toBe('function');
  });

  test('Test rounds command handling [1]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
    const response = rounds.selectPoolRoundsMiner('Pool-Main', 'miner1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_rounds
      WHERE miner = 'miner1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [2]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
    const response = rounds.selectPoolRoundsWorker('Pool-Main', 'worker1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_rounds
      WHERE worker = 'worker1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [3]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
    const response = rounds.selectPoolRoundsIdentifier('Pool-Main', 'master', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_rounds
      WHERE identifier = 'master AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [4]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
    const response = rounds.selectPoolRoundsCurrent('Pool-Main', true, 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_rounds
      WHERE solo = true AND round = 'current' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [5]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
    const response = rounds.selectPoolRoundsSpecific('Pool-Main', true, 'round1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_rounds
      WHERE solo = true AND round = 'round1'
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [6]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
    const response = rounds.selectPoolRoundsHistorical('Pool-Main', 'worker1', true, 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_rounds
      WHERE worker = 'worker1' AND solo = true
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [7]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
    const response = rounds.selectPoolRoundsCombinedCurrent('Pool-Main', 'worker1', true, 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_rounds
      WHERE worker = 'worker1' AND solo = true
      AND round = 'current' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [8]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
    const response = rounds.selectPoolRoundsCombinedSpecific('Pool-Main', 'worker1', true, 'round1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_rounds
      WHERE worker = 'worker1' AND solo = true
      AND round = 'round1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [9]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
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
    const response = rounds.insertPoolRoundsCurrent('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_rounds (
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
      ON CONFLICT ON CONSTRAINT pool_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Main".pool_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Main".pool_rounds.stale + EXCLUDED.stale,
        times = EXCLUDED.times,
        valid = "Pool-Main".pool_rounds.valid + EXCLUDED.valid,
        work = "Pool-Main".pool_rounds.work + EXCLUDED.work;`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [10]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
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
    const response = rounds.insertPoolRoundsCurrent('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_rounds (
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
      ON CONFLICT ON CONSTRAINT pool_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Main".pool_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Main".pool_rounds.stale + EXCLUDED.stale,
        times = EXCLUDED.times,
        valid = "Pool-Main".pool_rounds.valid + EXCLUDED.valid,
        work = "Pool-Main".pool_rounds.work + EXCLUDED.work;`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [11]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
    const response = rounds.updatePoolRoundsCurrentSolo('Pool-Main', 'miner1', 'round1', 'primary');
    const expected = `
      UPDATE "Pool-Main".pool_rounds
      SET round = 'round1'
      WHERE round = 'current' AND miner = 'miner1'
      AND solo = true AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test rounds command handling [12]', () => {
    const rounds = new PoolRounds(logger, configMainCopy);
    const response = rounds.updatePoolRoundsCurrentShared('Pool-Main', 'round1', 'primary');
    const expected = `
      UPDATE "Pool-Main".pool_rounds
      SET round = 'round1'
      WHERE round = 'current' AND solo = false
      AND type = 'primary';`;
    expect(response).toBe(expected);
  });
});
