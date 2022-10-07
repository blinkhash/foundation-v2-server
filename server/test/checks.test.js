const Commands = require('../../database/main/commands');
const Logger = require('../main/logger');
const MockDate = require('mockdate');
const Checks = require('../main/checks');
const config = require('../../configs/pools/example.js');
const configMain = require('../../configs/main/example.js');
const events = require('events');

////////////////////////////////////////////////////////////////////////////////

function mockClient(configMain, result) {
  const client = new events.EventEmitter();
  client.commands = new Commands(null, null, configMain);
  client.commands.executor = (commands, callback) => {
    client.emit('transaction', commands);
    callback(result);
  };
  return client;
}

////////////////////////////////////////////////////////////////////////////////

describe('Test checks functionality', () => {

  let configCopy, configMainCopy;
  beforeEach(() => {
    configCopy = JSON.parse(JSON.stringify(config));
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of checks', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    expect(typeof checks.handleCurrentBlocks).toBe('function');
    expect(typeof checks.handleCurrentMiners).toBe('function');
  });

  test('Test checks database updates [1]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const blocks = [{
      timestamp: 1,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    }];
    const expected = [{
      timestamp: 1634742080841,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    }];
    expect(checks.handleCurrentBlocks(blocks)).toStrictEqual(expected);
  });

  test('Test checks database updates [2]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const miners = { 'miner1': {
      timestamp: 1,
      miner: 'miner1',
      generate: 10,
      immature: 10
    }};
    const expected = [{
      timestamp: 1634742080841,
      miner: 'miner1',
      generate: 10,
      immature: 10,
      type: 'primary',
    }];
    expect(checks.handleCurrentMiners(miners, 'primary')).toStrictEqual(expected);
  });

  test('Test checks database updates [3]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const miner1 = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const miner2 = { ...miner1, miner: 'miner2', worker: 'miner2' };
    const miner3 = { ...miner1, miner: 'miner3', worker: 'miner3' };
    const rounds = [[miner1, miner2, miner3], [miner1, miner2, miner3]];
    const expected = [
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner1', 'round': 'current', 'solo': false, 'stale': 0, 'times': 100, 'timestamp': 1634742080841, 'recent': 1634742060000, 'type': 'primary', 'valid': 200, 'work': 200, 'worker': 'miner1'},
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner2', 'round': 'current', 'solo': false, 'stale': 0, 'times': 100, 'timestamp': 1634742080841, 'recent': 1634742060000, 'type': 'primary', 'valid': 200, 'work': 200, 'worker': 'miner2'},
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner3', 'round': 'current', 'solo': false, 'stale': 0, 'times': 100, 'timestamp': 1634742080841, 'recent': 1634742060000, 'type': 'primary', 'valid': 200, 'work': 200, 'worker': 'miner3'}];
    expect(checks.handleCurrentOrphans(rounds)).toStrictEqual(expected);
  });

  test('Test checks database updates [4]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const miner1 = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const miner2 = { ...miner1, miner: 'miner2', worker: 'miner2' };
    const miner3 = { ...miner1, miner: 'miner3', worker: 'miner3' };
    const rounds = [[miner1, miner2, miner3]];
    const expected = [
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner1', 'round': 'current', 'solo': false, 'stale': 0, 'times': 100, 'timestamp': 1634742080841, 'recent': 1634742060000, 'type': 'primary', 'valid': 100, 'work': 100, 'worker': 'miner1'},
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner2', 'round': 'current', 'solo': false, 'stale': 0, 'times': 100, 'timestamp': 1634742080841, 'recent': 1634742060000, 'type': 'primary', 'valid': 100, 'work': 100, 'worker': 'miner2'},
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner3', 'round': 'current', 'solo': false, 'stale': 0, 'times': 100, 'timestamp': 1634742080841, 'recent': 1634742060000, 'type': 'primary', 'valid': 100, 'work': 100, 'worker': 'miner3'}];
    expect(checks.handleCurrentOrphans(rounds)).toStrictEqual(expected);
  });

  test('Test checks database updates [5]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const miner1 = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    const miner2 = { ...miner1, miner: 'miner2', worker: 'miner2' };
    const miner3 = { ...miner1, miner: 'miner3', worker: 'miner3' };
    const rounds = [[miner1, miner2, miner3], [miner1, miner2, miner3]];
    const expected = [
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner1', 'round': 'current', 'solo': false, 'stale': 0, 'times': 100, 'timestamp': 1634742080841, 'recent': 1634742060000, 'type': 'primary', 'valid': 0, 'work': 0, 'worker': 'miner1'},
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner2', 'round': 'current', 'solo': false, 'stale': 0, 'times': 100, 'timestamp': 1634742080841, 'recent': 1634742060000, 'type': 'primary', 'valid': 0, 'work': 0, 'worker': 'miner2'},
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner3', 'round': 'current', 'solo': false, 'stale': 0, 'times': 100, 'timestamp': 1634742080841, 'recent': 1634742060000, 'type': 'primary', 'valid': 0, 'work': 0, 'worker': 'miner3'}];
    expect(checks.handleCurrentOrphans(rounds)).toStrictEqual(expected);
  });

  test('Test checks database updates [6]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    expect(checks.handleCurrentOrphans([])).toStrictEqual([]);
  });

  test('Test checks miscellaneous updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const blocks = [
      { round: 'round1' }, { round: 'round2' }, { round: 'round3' },
      { round: 'round4' }, { round: 'round5' }, { round: 'round6' }];
    const expected = `
      DELETE FROM "Pool-Bitcoin".current_transactions
      WHERE round IN ('round1', 'round2', 'round3', 'round4', 'round5', 'round6');`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(3);
      expect(transaction[1]).toBe(expected);
      done();
    });
    checks.handleFinal(blocks, () => {});
  });

  test('Test checks miscellaneous updates [2]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const expected = `
      UPDATE "Pool-Bitcoin".current_miners
      SET immature = 0, generate = 0
      WHERE type = 'primary';`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(3);
      expect(transaction[1]).toBe(expected);
      done();
    });
    checks.handleReset('primary', () => {});
  });

  test('Test checks main updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    };
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const blocks = [
      { ...initialBlock, category: 'orphan', round: 'round1' },
      { ...initialBlock, category: 'immature', round: 'round2' },
      { ...initialBlock, category: 'immature', round: 'round3' },
      { ...initialBlock, category: 'immature', round: 'round4' },
      { ...initialBlock, category: 'orphan', round: 'round5' },
      { ...initialBlock, category: 'generate', round: 'round6' }];
    const rounds = [
      [{ ...initialMiner, miner: 'miner1', worker: 'miner1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2' }],
      [{ ...initialMiner, miner: 'miner1', worker: 'miner1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2' }]];
    const payments = {
      'miner1': { miner: 'miner1', generate: 10, immature: 10 },
      'miner2': { miner: 'miner2', generate: 40, immature: 1000 },
      'miner3': { miner: 'miner3', generate: 100, immature: 100 }};
    const expectedOrphanBlocksDeletes = `
      DELETE FROM "Pool-Bitcoin".current_blocks
      WHERE round IN ('round1', 'round5');`;
    const expectedImmatureUpdates = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'immature',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round2',
        false,
        'transaction1',
        'primary'), (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'immature',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round3',
        false,
        'transaction1',
        'primary'), (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'immature',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round4',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedGenerateUpdates = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round6',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, generate,
        immature, type)
      VALUES (
        1634742080841,
        'miner1',
        10,
        10,
        'primary'), (
        1634742080841,
        'miner2',
        40,
        1000,
        'primary'), (
        1634742080841,
        'miner3',
        100,
        100,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        generate = EXCLUDED.generate,
        immature = EXCLUDED.immature;`;
    const expectedOrphanRoundsDeletes = `
      DELETE FROM "Pool-Bitcoin".current_rounds
      WHERE round IN ('round1', 'round5');`;
    const expectedOrphanRoundsUpdates = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, recent, miner,
        worker, identifier, invalid,
        round, solo, stale, times,
        type, valid, work)
      VALUES (
        1634742080841,
        1634742060000,
        'miner1',
        'miner1',
        'master',
        0,
        'current',
        false,
        0,
        100,
        'primary',
        100,
        100), (
        1634742080841,
        1634742060000,
        'miner2',
        'miner2',
        'master',
        0,
        'current',
        false,
        0,
        100,
        'primary',
        200,
        200)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedOrphanBlocksUpdates = `
      INSERT INTO "Pool-Bitcoin".historical_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'orphan',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round1',
        false,
        'transaction1',
        'primary'), (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'orphan',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round5',
        false,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(9);
      expect(transaction[1]).toBe(expectedOrphanBlocksDeletes);
      expect(transaction[2]).toBe(expectedImmatureUpdates);
      expect(transaction[3]).toBe(expectedGenerateUpdates);
      expect(transaction[4]).toBe(expectedMiners);
      expect(transaction[5]).toBe(expectedOrphanRoundsDeletes);
      expect(transaction[6]).toBe(expectedOrphanRoundsUpdates);
      expect(transaction[7]).toBe(expectedOrphanBlocksUpdates);
      done();
    });
    checks.handleUpdates(blocks, rounds, payments, 'primary', () => {});
  });

  test('Test checks main updates [2]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    };
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const blocks = [
      { ...initialBlock, category: 'orphan', round: 'round1' },
      { ...initialBlock, category: 'orphan', round: 'round2' }];
    const rounds = [
      [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }],
      [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]];
    const expectedOrphanBlocksDeletes = `
      DELETE FROM "Pool-Bitcoin".current_blocks
      WHERE round IN ('round1', 'round2');`;
    const expectedOrphanRoundsDeletes = `
      DELETE FROM "Pool-Bitcoin".current_rounds
      WHERE round IN ('round1', 'round2');`;
    const expectedOrphanRoundsUpdates = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, recent, miner,
        worker, identifier, invalid,
        round, solo, stale, times,
        type, valid, work)
      VALUES (
        1634742080841,
        1634742060000,
        'miner1',
        'miner1',
        'master',
        0,
        'current',
        false,
        0,
        100,
        'primary',
        100,
        100), (
        1634742080841,
        1634742060000,
        'miner2',
        'miner2',
        'master',
        0,
        'current',
        false,
        0,
        100,
        'primary',
        200,
        200), (
        1634742080841,
        1634742060000,
        'miner1',
        'miner1',
        'master',
        0,
        'current',
        false,
        0,
        100,
        'primary',
        100,
        100), (
        1634742080841,
        1634742060000,
        'miner2',
        'miner2',
        'master',
        0,
        'current',
        false,
        0,
        100,
        'primary',
        200,
        200)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedOrphanBlocksUpdates = `
      INSERT INTO "Pool-Bitcoin".historical_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'orphan',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round1',
        false,
        'transaction1',
        'primary'), (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'orphan',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round2',
        false,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(6);
      expect(transaction[1]).toBe(expectedOrphanBlocksDeletes);
      expect(transaction[2]).toBe(expectedOrphanRoundsDeletes);
      expect(transaction[3]).toBe(expectedOrphanRoundsUpdates);
      expect(transaction[4]).toBe(expectedOrphanBlocksUpdates);
      done();
    });
    checks.handleUpdates(blocks, rounds, {}, 'primary', () => {});
  });

  test('Test checks main updates [3]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    };
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    const rounds = [
      [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }],
      [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]];
    const expectedImmatureUpdates = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'immature',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round1',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedGenerateUpdates = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round2',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(4);
      expect(transaction[1]).toBe(expectedImmatureUpdates);
      expect(transaction[2]).toBe(expectedGenerateUpdates);
      done();
    });
    checks.handleUpdates(blocks, rounds, {}, 'primary', () => {});
  });

  test('Test checks primary updates [1]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    const payments = {
      'miner1': { miner: 'miner1', generate: 10, immature: 10 },
      'miner2': { miner: 'miner2', generate: 40, immature: 1000 },
      'miner3': { miner: 'miner3', generate: 100, immature: 100 }};
    checks.stratum = { stratum: {
      handlePrimaryRounds: (blocks, callback) => callback(null, blocks),
      handlePrimaryWorkers: (blocks, rounds, callback) => callback(payments)
    }};
    const expectedImmatureUpdates = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'immature',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round1',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedGenerateUpdates = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round2',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, generate,
        immature, type)
      VALUES (
        1634742080841,
        'miner1',
        10,
        10,
        'primary'), (
        1634742080841,
        'miner2',
        40,
        1000,
        'primary'), (
        1634742080841,
        'miner3',
        100,
        100,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        generate = EXCLUDED.generate,
        immature = EXCLUDED.immature;`;
    let currentIdx = 0;
    client.on('transaction', (transaction) => {
      if (currentIdx === 1) {
        expect(transaction.length).toBe(5);
        expect(transaction[1]).toBe(expectedImmatureUpdates);
        expect(transaction[2]).toBe(expectedGenerateUpdates);
        expect(transaction[3]).toBe(expectedMiners);
      } else currentIdx += 1;
    });
    checks.handlePrimary(blocks, () => done());
  });

  test('Test checks primary updates [2]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    checks.stratum = { stratum: {
      handlePrimaryRounds: (blocks, callback) => callback(true, blocks),
    }};
    checks.handlePrimary(blocks, () => done());
  });

  test('Test checks auxiliary updates [1]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'auxiliary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'auxiliary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    const payments = {
      'miner1': { miner: 'miner1', generate: 10, immature: 10 },
      'miner2': { miner: 'miner2', generate: 40, immature: 1000 },
      'miner3': { miner: 'miner3', generate: 100, immature: 100 }};
    checks.stratum = { stratum: {
      handleAuxiliaryRounds: (blocks, callback) => callback(null, blocks),
      handleAuxiliaryWorkers: (blocks, rounds, callback) => callback(payments)
    }};
    const expectedImmatureUpdates = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'immature',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round1',
        false,
        'transaction1',
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedGenerateUpdates = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round2',
        false,
        'transaction1',
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, generate,
        immature, type)
      VALUES (
        1634742080841,
        'miner1',
        10,
        10,
        'auxiliary'), (
        1634742080841,
        'miner2',
        40,
        1000,
        'auxiliary'), (
        1634742080841,
        'miner3',
        100,
        100,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        generate = EXCLUDED.generate,
        immature = EXCLUDED.immature;`;
    let currentIdx = 0;
    client.on('transaction', (transaction) => {
      if (currentIdx === 1) {
        expect(transaction.length).toBe(5);
        expect(transaction[1]).toBe(expectedImmatureUpdates);
        expect(transaction[2]).toBe(expectedGenerateUpdates);
        expect(transaction[3]).toBe(expectedMiners);
      } else currentIdx += 1;
    });
    checks.handleAuxiliary(blocks, () => done());
  });

  test('Test checks auxiliary updates [2]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'auxiliary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'auxiliary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    checks.stratum = { stratum: {
      handleAuxiliaryRounds: (blocks, callback) => callback(true, blocks),
    }};
    checks.handleAuxiliary(blocks, () => done());
  });

  test('Test checks rounds updates [1]', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'auxiliary',
    };
    const initial = [
      null,
      { rows: [
        { ...initialBlock, category: 'immature', round: 'round1' },
        { ...initialBlock, category: 'generate', round: 'round2' }]},
      null];
    checks.handleRounds(initial, 'primary', () => {
      expect(consoleSpy).toHaveBeenCalled();
      console.log.mockClear();
      done();
    });
  });

  test('Test checks rounds updates [2]', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initial = [null, { rows: [] }, null];
    checks.handleRounds(initial, 'primary', () => {
      expect(consoleSpy).toHaveBeenCalled();
      console.log.mockClear();
      done();
    });
  });

  test('Test checks rounds updates [3]', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'auxiliary',
    };
    const initial = [
      null,
      { rows: [
        { ...initialBlock, category: 'immature', round: 'round1' },
        { ...initialBlock, category: 'generate', round: 'round2' }]},
      null];
    checks.handleRounds(initial, 'auxiliary', () => {
      expect(consoleSpy).toHaveBeenCalled();
      console.log.mockClear();
      done();
    });
  });

  test('Test checks rounds updates [4]', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initial = [null, { rows: [] }, null];
    checks.handleRounds(initial, 'auxiliary', () => {
      expect(consoleSpy).toHaveBeenCalled();
      console.log.mockClear();
      done();
    });
  });

  test('Test checks rounds updates [5]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    const initial = [null, { rows: [] }, null];
    checks.handleRounds(initial, 'unknown', () => done());
  });

  test('Test checks submission handling', (done) => {
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const checks = new Checks(logger, client, configCopy, configMainCopy);
    checks.handleChecks('primary', () => done());
  });
});
