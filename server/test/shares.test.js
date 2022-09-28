const Commands = require('../../database/main/commands');
const Logger = require('../main/logger');
const MockDate = require('mockdate');
const Shares = require('../main/shares');
const config = require('../../configs/pools/example.js');
const configMain = require('../../configs/main.js');
const events = require('events');

// Mock UUID Events
jest.mock('uuid', () => ({ v4: () => '123456789' }));

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

describe('Test shares functionality', () => {

  let configCopy, configMainCopy;
  beforeEach(() => {
    configCopy = JSON.parse(JSON.stringify(config));
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of shares', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    expect(typeof shares.handleEfficiency).toBe('function');
    expect(typeof shares.handleEffort).toBe('function');
  });

  test('Test shares database updates [1]', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    expect(shares.handleEfficiency({ valid: 1, invalid: 0, stale: 0 }, 'valid')).toBe(100);
    expect(shares.handleEfficiency({ valid: 0, invalid: 1, stale: 0 }, 'valid')).toBe(50);
    expect(shares.handleEfficiency({ valid: 1, invalid: 1, stale: 0 }, 'valid')).toBe(66.67);
    expect(shares.handleEfficiency({ valid: 1, invalid: 0, stale: 1 }, 'valid')).toBe(66.67);
    expect(shares.handleEfficiency({}, 'valid')).toBe(100);
    expect(shares.handleEfficiency({}, 'invalid')).toBe(0);
  });

  test('Test shares database updates [2]', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    expect(shares.handleEffort(100, { difficulty: 10 }, 'valid', 100)).toBe(110);
    expect(shares.handleEffort(100, { difficulty: 10 }, 'invalid', 100)).toBe(100);
    expect(shares.handleEffort(100, {}, 'valid', 100)).toBe(100);
    expect(shares.handleEffort(0, {}, 'invalid', 100)).toBe(0);
  });

  test('Test shares database updates [3]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    expect(shares.handleTimes({ timestamp: 1634742080000, times: 0 })).toBe(0.841);
    expect(shares.handleTimes({ timestamp: 1634742070000, times: 145 })).toBe(155.841);
    expect(shares.handleTimes({ timestamp: 1634742050000, times: 145 })).toBe(175.841);
    expect(shares.handleTimes({ timestamp: 1634740000000, times: 145 })).toBe(145);
    expect(shares.handleTimes({ times: 145 })).toBe(145);
  });

  test('Test shares database updates [4]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = { hash: 'hash', height: 1, identifier: 'master', transaction: 'transaction1' };
    const expected = {
      timestamp: 1634742080841,
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
    expect(shares.handleCurrentBlocks(100, 'miner1', 150, 'round', shareData, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [5]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = { hash: 'hash', height: 1, transaction: 'transaction1' };
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      worker: null,
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
    expect(shares.handleCurrentBlocks(100, null, 150, 'round', shareData, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [6]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const expected = {
      timestamp: 1634742080841,
      miner: 'miner1',
      worker: 'miner1',
      solo: false,
      type: 'primary',
      work: 1,
    };
    expect(shares.handleCurrentHashrate('miner1', 1, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [7]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const expected = {
      timestamp: 1634742080841,
      miner: 'miner1',
      worker: 'miner1',
      solo: false,
      type: 'primary',
      work: 0,
    };
    expect(shares.handleCurrentHashrate('miner1', 1, 'invalid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [8]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      worker: null,
      solo: false,
      type: 'primary',
      work: 1,
    };
    expect(shares.handleCurrentHashrate(null, 1, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [9]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const roundData = { valid: 1, invalid: 0, stale: 0 };
    const shareData = { difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 100,
      effort: 67.33,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 1,
    };
    expect(shares.handleCurrentMetadata(100, 150, roundData, shareData, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [10]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const roundData = { valid: 1, invalid: 0, stale: 0 };
    const shareData = { difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 100,
      effort: 67.33,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(shares.handleCurrentMetadata(100, 150, roundData, shareData, 'valid', true, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [11]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const roundData = { valid: 1, invalid: 0, stale: 0 };
    const shareData = { difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 50,
      effort: 66.67,
      invalid: 1,
      stale: 0,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(shares.handleCurrentMetadata(100, 150, roundData, shareData, 'invalid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [12]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const roundData = { valid: 1, invalid: 0, stale: 0 };
    const shareData = { difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 50,
      effort: 66.67,
      invalid: 0,
      stale: 1,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(shares.handleCurrentMetadata(100, 150, roundData, shareData, 'stale', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [13]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const roundData = { valid: 1, invalid: 0, stale: 0, work: 100 };
    const shareData = { difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: 'miner1',
      efficiency: 100,
      effort: 67.33,
      type: 'primary'
    };
    expect(shares.handleCurrentMiners('miner1', 150, roundData, shareData, 'valid', 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [14]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const roundData = { valid: 1, invalid: 0, stale: 0, work: 100 };
    const shareData = { difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      efficiency: 100,
      effort: 67.33,
      type: 'primary'
    };
    expect(shares.handleCurrentMiners(null, 150, roundData, shareData, 'valid', 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [15]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const workerData = { timestamp: 1634742080000, times: 0 };
    const shareData = { identifier: 'master', difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'current',
      solo: false,
      stale: 0,
      times: 0.841,
      type: 'primary',
      valid: 1,
      work: 1,
    };
    expect(shares.handleCurrentRounds('miner1', workerData, shareData, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [16]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const workerData = { timestamp: 1634742080000, times: 0 };
    const shareData = { difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      worker: null,
      identifier: 'master',
      invalid: 0,
      round: 'current',
      solo: false,
      stale: 0,
      times: 0.841,
      type: 'primary',
      valid: 1,
      work: 1,
    };
    expect(shares.handleCurrentRounds(null, workerData, shareData, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [17]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const workerData = { timestamp: 1634742080000, times: 0 };
    const shareData = { identifier: 'master', difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      worker: null,
      identifier: 'master',
      invalid: 1,
      round: 'current',
      solo: false,
      stale: 0,
      times: 0,
      type: 'primary',
      valid: 0,
      work: -1,
    };
    expect(shares.handleCurrentRounds(null, workerData, shareData, 'invalid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [18]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const workerData = { timestamp: 1634742080000, times: 0 };
    const shareData = { identifier: 'master', difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      worker: null,
      identifier: 'master',
      invalid: 0,
      round: 'current',
      solo: false,
      stale: 1,
      times: 0,
      type: 'primary',
      valid: 0,
      work: -1,
    };
    expect(shares.handleCurrentRounds(null, workerData, shareData, 'stale', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [19]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const roundData = { valid: 1, invalid: 0, stale: 0, work: 100 };
    const shareData = { difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: 'miner1',
      worker: 'miner1',
      efficiency: 100,
      effort: 67.33,
      solo: false,
      type: 'primary'
    };
    expect(shares.handleCurrentWorkers('miner1', 150, roundData, shareData, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares database updates [20]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const roundData = { valid: 1, invalid: 0, stale: 0, work: 100 };
    const shareData = { difficulty: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      worker: null,
      efficiency: 100,
      effort: 67.33,
      solo: false,
      type: 'primary'
    };
    expect(shares.handleCurrentWorkers(null, 150, roundData, shareData, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test shares primary updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [null, { rows: [{ work: 100 }] }, null, { rows: [{ work: 100 }] }, null, null];
    const shareData = { addrPrimary: 'miner1', blockDiffPrimary: 150, hash: 'hash', height: 1, identifier: 'master', transaction: 'transaction1' };
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        'miner1',
        'miner1',
        'pending',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        '123456789',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
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
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'primary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedPrimary = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND solo = false
      AND type = 'primary';`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedReset);
      expect(transaction[4]).toBe(expectedPrimary);
      done();
    });
    shares.handlePrimary(lookups, shareData, 'valid', false, () => {});
  });

  test('Test shares primary updates [2]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [null, { rows: [] }, null, { rows: [] }, null, null];
    const shareData = { addrPrimary: null, blockDiffPrimary: null, hash: 'hash', height: 1, transaction: 'transaction1' };
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        '',
        'null',
        'pending',
        -1,
        null,
        'hash',
        1,
        'master',
        0,
        0,
        '123456789',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
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
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'primary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedPrimary = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND solo = false
      AND type = 'primary';`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedReset);
      expect(transaction[4]).toBe(expectedPrimary);
      done();
    });
    shares.handlePrimary(lookups, shareData, 'valid', false, () => {});
  });

  test('Test shares primary updates [3]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [null, { rows: [{ work: 100 }] }, null, { rows: [{ work: 100 }] }, null, null];
    const shareData = { addrPrimary: 'miner1', blockDiffPrimary: 150, hash: 'hash', height: 1, identifier: 'master', transaction: 'transaction1' };
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        'miner1',
        'miner1',
        'pending',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        '123456789',
        true,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
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
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'primary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedPrimary = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND miner = 'miner1'
      AND solo = true AND type = 'primary';`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedReset);
      expect(transaction[4]).toBe(expectedPrimary);
      done();
    });
    shares.handlePrimary(lookups, shareData, 'valid', true, () => {});
  });

  test('Test shares primary updates [4]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [null, { rows: [] }, null, { rows: [] }, null, null];
    const shareData = { addrPrimary: null, blockDiffPrimary: null, hash: 'hash', height: 1, transaction: 'transaction1' };
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        '',
        'null',
        'pending',
        -1,
        null,
        'hash',
        1,
        'master',
        0,
        0,
        '123456789',
        true,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
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
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'primary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedPrimary = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND miner = ''
      AND solo = true AND type = 'primary';`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedReset);
      expect(transaction[4]).toBe(expectedPrimary);
      done();
    });
    shares.handlePrimary(lookups, shareData, 'valid', true, () => {});
  });

  test('Test shares auxiliary updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [null, null, { rows: [{ work: 100 }] }, null, { rows: [{ work: 100 }] }, null];
    const shareData = { addrAuxiliary: 'miner1', blockDiffAuxiliary: 150, hash: 'hash', height: 1, identifier: 'master', transaction: 'transaction1' };
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        'miner1',
        'miner1',
        'pending',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        '123456789',
        false,
        'transaction1',
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
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
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'auxiliary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedAuxiliary = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND solo = false
      AND type = 'auxiliary';`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedReset);
      expect(transaction[4]).toBe(expectedAuxiliary);
      done();
    });
    shares.handleAuxiliary(lookups, shareData, 'valid', false, () => {});
  });

  test('Test shares auxiliary updates [2]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [null, null, { rows: [] }, null, { rows: [] }, null];
    const shareData = { addrAuxiliary: null, blockDiffAuxiliary: null, hash: 'hash', height: 1, transaction: 'transaction1' };
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        '',
        'null',
        'pending',
        -1,
        null,
        'hash',
        1,
        'master',
        0,
        0,
        '123456789',
        false,
        'transaction1',
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
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
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'auxiliary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedAuxiliary = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND solo = false
      AND type = 'auxiliary';`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedReset);
      expect(transaction[4]).toBe(expectedAuxiliary);
      done();
    });
    shares.handleAuxiliary(lookups, shareData, 'valid', false, () => {});
  });

  test('Test shares auxiliary updates [3]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [null, null, { rows: [{ work: 100 }] }, null, { rows: [{ work: 100 }] }, null];
    const shareData = { addrAuxiliary: 'miner1', blockDiffAuxiliary: 150, hash: 'hash', height: 1, identifier: 'master', transaction: 'transaction1' };
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        'miner1',
        'miner1',
        'pending',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        '123456789',
        true,
        'transaction1',
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
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
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'auxiliary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedAuxiliary = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND miner = 'miner1'
      AND solo = true AND type = 'auxiliary';`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedReset);
      expect(transaction[4]).toBe(expectedAuxiliary);
      done();
    });
    shares.handleAuxiliary(lookups, shareData, 'valid', true, () => {});
  });

  test('Test shares auxiliary updates [4]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [null, null, { rows: [] }, null, { rows: [] }, null];
    const shareData = { addrAuxiliary: null, blockDiffAuxiliary: null, hash: 'hash', height: 1, transaction: 'transaction1' };
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        '',
        'null',
        'pending',
        -1,
        null,
        'hash',
        1,
        'master',
        0,
        0,
        '123456789',
        true,
        'transaction1',
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
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
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'auxiliary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedAuxiliary = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND miner = ''
      AND solo = true AND type = 'auxiliary';`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedReset);
      expect(transaction[4]).toBe(expectedAuxiliary);
      done();
    });
    shares.handleAuxiliary(lookups, shareData, 'valid', true, () => {});
  });

  test('Test shares updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [
      null,
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      null];
    const shareData = {
      addrPrimary: 'primary1',
      addrAuxiliary: 'auxiliary1',
      blockDiffPrimary: 150,
      blockDiffAuxiliary: 150,
      difficulty: 1,
      identifier: 'master',
    };
    const expectedHashrate = `
      INSERT INTO "Pool-Bitcoin".current_hashrate (
        timestamp, miner, worker,
        solo, type, work)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        false,
        'primary',
        1);`;
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        100,
        67.33,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_metadata.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_metadata.work + EXCLUDED.work;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, efficiency,
        effort, type)
      VALUES (
        1634742080841,
        'primary1',
        100,
        67.33,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort;`;
    const expectedRounds = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        'master',
        0,
        'current',
        false,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        efficiency, effort, solo,
        type)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        100,
        67.33,
        false,
        'primary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        solo = EXCLUDED.solo;`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedHashrate);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedMiners);
      expect(transaction[4]).toBe(expectedRounds);
      expect(transaction[5]).toBe(expectedWorkers);
      expect(transaction[6]).toBe('COMMIT;');
      done();
    });
    shares.handleShares(lookups, shareData, 'valid', false, () => {});
  });

  test('Test shares updates [2]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [null, { rows: [] }, { rows: [] }, { rows: [] }, { rows: [] }, null];
    const shareData = {
      addrPrimary: 'primary1',
      addrAuxiliary: 'auxiliary1',
      blockDiffPrimary: 150,
      blockDiffAuxiliary: 150,
      difficulty: 1,
      identifier: 'master',
    };
    const expectedHashrate = `
      INSERT INTO "Pool-Bitcoin".current_hashrate (
        timestamp, miner, worker,
        solo, type, work)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        false,
        'primary',
        1);`;
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        100,
        0.67,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_metadata.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_metadata.work + EXCLUDED.work;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, efficiency,
        effort, type)
      VALUES (
        1634742080841,
        'primary1',
        100,
        0,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort;`;
    const expectedRounds = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        'master',
        0,
        'current',
        false,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        efficiency, effort, solo,
        type)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        100,
        0,
        false,
        'primary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        solo = EXCLUDED.solo;`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedHashrate);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedMiners);
      expect(transaction[4]).toBe(expectedRounds);
      expect(transaction[5]).toBe(expectedWorkers);
      expect(transaction[6]).toBe('COMMIT;');
      done();
    });
    shares.handleShares(lookups, shareData, 'valid', false, () => {});
  });

  test('Test shares updates [3]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [
      null,
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      null];
    const shareData = {
      addrPrimary: 'primary1',
      addrAuxiliary: 'auxiliary1',
      blockDiffPrimary: 150,
      blockDiffAuxiliary: 150,
      difficulty: 1,
      identifier: 'master',
    };
    const expectedHashrate = `
      INSERT INTO "Pool-Bitcoin".current_hashrate (
        timestamp, miner, worker,
        solo, type, work)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        true,
        'primary',
        1);`;
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        100,
        67.33,
        0,
        0,
        'primary',
        0,
        0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_metadata.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_metadata.work + EXCLUDED.work;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, efficiency,
        effort, type)
      VALUES (
        1634742080841,
        'primary1',
        100,
        67.33,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort;`;
    const expectedRounds = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        'master',
        0,
        'current',
        true,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        efficiency, effort, solo,
        type)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        100,
        67.33,
        true,
        'primary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        solo = EXCLUDED.solo;`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedHashrate);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedMiners);
      expect(transaction[4]).toBe(expectedRounds);
      expect(transaction[5]).toBe(expectedWorkers);
      expect(transaction[6]).toBe('COMMIT;');
      done();
    });
    shares.handleShares(lookups, shareData, 'valid', true, () => {});
  });

  test('Test shares updates [4]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [null, { rows: [] }, { rows: [] }, { rows: [] }, { rows: [] }, null];
    const shareData = {
      addrPrimary: 'primary1',
      addrAuxiliary: 'auxiliary1',
      blockDiffPrimary: 150,
      blockDiffAuxiliary: 150,
      difficulty: 1,
      identifier: 'master',
    };
    const expectedHashrate = `
      INSERT INTO "Pool-Bitcoin".current_hashrate (
        timestamp, miner, worker,
        solo, type, work)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        true,
        'primary',
        1);`;
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        100,
        0.67,
        0,
        0,
        'primary',
        0,
        0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_metadata.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_metadata.work + EXCLUDED.work;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, efficiency,
        effort, type)
      VALUES (
        1634742080841,
        'primary1',
        100,
        0,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort;`;
    const expectedRounds = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        'master',
        0,
        'current',
        true,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        efficiency, effort, solo,
        type)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        100,
        0,
        true,
        'primary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        solo = EXCLUDED.solo;`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedHashrate);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedMiners);
      expect(transaction[4]).toBe(expectedRounds);
      expect(transaction[5]).toBe(expectedWorkers);
      expect(transaction[6]).toBe('COMMIT;');
      done();
    });
    shares.handleShares(lookups, shareData, 'valid', true, () => {});
  });

  test('Test shares updates [5]', (done) => {
    MockDate.set(1634742080841);
    configCopy.auxiliary = { enabled: true };
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const lookups = [
      null,
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      null];
    const shareData = {
      addrPrimary: 'primary1',
      addrAuxiliary: 'auxiliary1',
      blockDiffPrimary: 150,
      blockDiffAuxiliary: 150,
      difficulty: 1,
      identifier: 'master',
    };
    const expectedHashrate = `
      INSERT INTO "Pool-Bitcoin".current_hashrate (
        timestamp, miner, worker,
        solo, type, work)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        false,
        'primary',
        1);`;
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        100,
        67.33,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_metadata.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_metadata.work + EXCLUDED.work;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, efficiency,
        effort, type)
      VALUES (
        1634742080841,
        'primary1',
        100,
        67.33,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort;`;
    const expectedRounds = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        'master',
        0,
        'current',
        false,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        efficiency, effort, solo,
        type)
      VALUES (
        1634742080841,
        'primary1',
        'primary1',
        100,
        67.33,
        false,
        'primary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        solo = EXCLUDED.solo;`;
    const expectedAuxHashrate = `
      INSERT INTO "Pool-Bitcoin".current_hashrate (
        timestamp, miner, worker,
        solo, type, work)
      VALUES (
        1634742080841,
        'auxiliary1',
        'auxiliary1',
        false,
        'auxiliary',
        1);`;
    const expectedAuxMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        100,
        67.33,
        0,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_metadata.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_metadata.work + EXCLUDED.work;`;
    const expectedAuxMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, efficiency,
        effort, type)
      VALUES (
        1634742080841,
        'auxiliary1',
        100,
        67.33,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort;`;
    const expectedAuxRounds = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        'auxiliary1',
        'auxiliary1',
        'master',
        0,
        'current',
        false,
        0,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedAuxWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        efficiency, effort, solo,
        type)
      VALUES (
        1634742080841,
        'auxiliary1',
        'auxiliary1',
        100,
        67.33,
        false,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        solo = EXCLUDED.solo;`;
    client.on('transaction', (transaction) => {
      expect(transaction[1]).toBe(expectedHashrate);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedMiners);
      expect(transaction[4]).toBe(expectedRounds);
      expect(transaction[5]).toBe(expectedWorkers);
      expect(transaction[6]).toBe(expectedAuxHashrate);
      expect(transaction[7]).toBe(expectedAuxMetadata);
      expect(transaction[8]).toBe(expectedAuxMiners);
      expect(transaction[9]).toBe(expectedAuxRounds);
      expect(transaction[10]).toBe(expectedAuxWorkers);
      done();
    });
    shares.handleShares(lookups, shareData, 'valid', false, () => {});
  });

  test('Test shares submission handling [1]', (done) => {
    const lookups = [
      null,
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      job: 1,
      id: 1,
      ip: null,
      port: 3002,
      addrPrimary: 'miner1',
      addrAuxiliary: 'miner1',
      blockDiffPrimary : 150,
      blockType: 'primary',
      coinbase: null,
      difficulty: 100,
      hash: 'hash',
      hex: 'hex',
      header: 'header',
      headerDiff: 100,
      height: 1,
      identifier: 'master',
      reward: 100,
      shareDiff: 1,
    };
    shares.handleSubmissions(shareData, true, true, () => done());
  });

  test('Test shares submission handling [2]', (done) => {
    const lookups = [
      null,
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      job: 1,
      id: 1,
      ip: null,
      port: 3002,
      addrPrimary: 'miner1',
      addrAuxiliary: 'miner1',
      blockDiffPrimary : 150,
      blockType: 'primary',
      coinbase: null,
      difficulty: 100,
      hash: 'hash',
      hex: 'hex',
      header: 'header',
      headerDiff: 100,
      height: 1,
      identifier: 'master',
      reward: 100,
      shareDiff: 1,
    };
    shares.handleSubmissions(shareData, true, false, () => done());
  });

  test('Test shares submission handling [3]', (done) => {
    const lookups = [
      null,
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      job: 1,
      id: 1,
      ip: null,
      port: 3002,
      addrPrimary: 'miner1',
      addrAuxiliary: 'miner1',
      blockDiffPrimary : 150,
      blockType: 'auxiliary',
      coinbase: null,
      difficulty: 100,
      hash: 'hash',
      hex: 'hex',
      header: 'header',
      headerDiff: 100,
      height: 1,
      identifier: 'master',
      reward: 100,
      shareDiff: 1,
    };
    shares.handleSubmissions(shareData, true, true, () => done());
  });

  test('Test shares submission handling [4]', (done) => {
    const lookups = [
      null,
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      job: 1,
      id: 1,
      ip: null,
      port: 3002,
      addrPrimary: 'miner1',
      addrAuxiliary: 'miner1',
      blockDiffPrimary : 150,
      blockType: 'auxiliary',
      coinbase: null,
      difficulty: 100,
      hash: 'hash',
      hex: 'hex',
      header: 'header',
      headerDiff: 100,
      height: 1,
      identifier: 'master',
      reward: 100,
      shareDiff: 1,
    };
    shares.handleSubmissions(shareData, true, false, () => done());
  });

  test('Test shares submission handling [5]', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const lookups = [
      null,
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      job: 1,
      id: 1,
      ip: null,
      port: 3002,
      addrPrimary: 'miner1',
      addrAuxiliary: 'miner1',
      blockDiffPrimary : 150,
      blockType: 'share',
      coinbase: null,
      difficulty: 100,
      hash: 'hash',
      hex: 'hex',
      header: 'header',
      headerDiff: 100,
      height: 1,
      identifier: 'master',
      reward: 100,
      shareDiff: 1,
    };
    shares.handleSubmissions(shareData, true, false, () => {
      expect(consoleSpy).toHaveBeenCalled();
      console.log.mockClear();
      done();
    });
  });

  test('Test shares submission handling [6]', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const lookups = [
      null,
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      job: 1,
      id: 1,
      ip: null,
      port: 3002,
      addrPrimary: 'miner1',
      addrAuxiliary: 'miner1',
      blockDiffPrimary : 150,
      blockType: 'share',
      coinbase: null,
      difficulty: 100,
      hash: 'hash',
      hex: 'hex',
      header: 'header',
      headerDiff: 100,
      height: 1,
      identifier: 'master',
      reward: 100,
      shareDiff: 1,
    };
    shares.handleSubmissions(shareData, false, false, () => {
      expect(consoleSpy).toHaveBeenCalled();
      console.log.mockClear();
      done();
    });
  });

  test('Test shares submission handling [7]', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const lookups = [
      null,
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      job: 1,
      id: 1,
      ip: null,
      port: 3002,
      addrPrimary: 'miner1',
      addrAuxiliary: 'miner1',
      blockType: 'share',
      difficulty: 100,
      identifier: 'master',
      error: 'job not found',
    };
    shares.handleSubmissions(shareData, false, false, () => {
      expect(consoleSpy).toHaveBeenCalled();
      console.log.mockClear();
      done();
    });
  });

  test('Test shares submission handling [8]', (done) => {
    const lookups = [
      null,
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      { rows: [{ valid: 1, invalid: 0, stale: 0, work: 100 }] },
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      job: 1,
      id: 1,
      ip: null,
      port: 3002,
      addrPrimary: 'miner1',
      addrAuxiliary: 'miner1',
      blockDiffPrimary : 150,
      blockType: 'unknown',
      coinbase: null,
      difficulty: 100,
      hash: 'hash',
      hex: 'hex',
      header: 'header',
      headerDiff: 100,
      height: 1,
      identifier: 'master',
      reward: 100,
      shareDiff: 1,
    };
    shares.handleSubmissions(shareData, false, false, () => done());
  });
});
