const PoolBlocks = require('../../main/pool/blocks');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database blocks functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of blocks commands', () => {
    const blocks = new PoolBlocks(logger, configMainCopy);
    expect(typeof blocks.configMain).toBe('object');
    expect(typeof blocks.selectPoolBlocksMiner).toBe('function');
    expect(typeof blocks.selectPoolBlocksWorker).toBe('function');
  });

  test('Test block command handling [1]', () => {
    const blocks = new PoolBlocks(logger, configMainCopy);
    const response = blocks.selectPoolBlocksMiner('Pool-Main', 'miner1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_blocks
      WHERE miner = 'miner1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test block command handling [2]', () => {
    const blocks = new PoolBlocks(logger, configMainCopy);
    const response = blocks.selectPoolBlocksWorker('Pool-Main', 'worker1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_blocks
      WHERE worker = 'worker1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test block command handling [3]', () => {
    const blocks = new PoolBlocks(logger, configMainCopy);
    const response = blocks.selectPoolBlocksCategory('Pool-Main', 'immature', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_blocks
      WHERE category = 'immature' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test block command handling [3]', () => {
    const blocks = new PoolBlocks(logger, configMainCopy);
    const response = blocks.selectPoolBlocksIdentifier('Pool-Main', 'master', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_blocks
      WHERE identifier = 'master' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test block command handling [4]', () => {
    const blocks = new PoolBlocks(logger, configMainCopy);
    const response = blocks.selectPoolBlocksType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_blocks
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test block command handling [5]', () => {
    const blocks = new PoolBlocks(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      category: 'immature',
      confirmations: 0,
      difficulty: 8,
      hash: 'hash1',
      height: 1,
      identifier: 'master',
      luck: 100,
      reward: 100,
      round: 'current',
      solo: false,
      transaction: 'transaction1',
      type: 'primary'
    };
    const response = blocks.insertPoolBlocksCurrent('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1,
        'miner1',
        'worker1',
        'immature',
        0,
        8,
        'hash1',
        1,
        'master',
        100,
        100,
        'current',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT pool_blocks_unique
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
    expect(response).toBe(expected);
  });

  test('Test block command handling [6]', () => {
    const blocks = new PoolBlocks(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      category: 'immature',
      confirmations: 0,
      difficulty: 8,
      hash: 'hash1',
      height: 1,
      identifier: 'master',
      luck: 100,
      reward: 100,
      round: 'current',
      solo: false,
      transaction: 'transaction1',
      type: 'primary'
    };
    const response = blocks.insertPoolBlocksCurrent('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1,
        'miner1',
        'worker1',
        'immature',
        0,
        8,
        'hash1',
        1,
        'master',
        100,
        100,
        'current',
        false,
        'transaction1',
        'primary'), (
        1,
        'miner1',
        'worker1',
        'immature',
        0,
        8,
        'hash1',
        1,
        'master',
        100,
        100,
        'current',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT pool_blocks_unique
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
    expect(response).toBe(expected);
  });

  test('Test block command handling [7]', () => {
    const blocks = new PoolBlocks(logger, configMainCopy);
    const response = blocks.deletePoolBlocksCurrent('Pool-Main', ['round1']);
    const expected = `
      DELETE FROM "Pool-Main".pool_blocks
      WHERE round IN (round1);`;
    expect(response).toBe(expected);
  });
});
