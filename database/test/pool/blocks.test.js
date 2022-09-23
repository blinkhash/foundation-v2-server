const CurrentBlocks = require('../../main/current/blocks');
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
    const blocks = new CurrentBlocks(logger, configMainCopy);
    expect(typeof blocks.configMain).toBe('object');
    expect(typeof blocks.selectCurrentBlocksMain).toBe('function');
    expect(typeof blocks.insertCurrentBlocksMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
    expect(blocks.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(blocks.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
    expect(blocks.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(blocks.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(blocks.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(blocks.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(blocks.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(blocks.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test block command handling [1]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
    const parameters = { miner: 'miner1', type: 'primary' };
    const response = blocks.selectCurrentBlocksMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_blocks WHERE miner = \'miner1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test block command handling [2]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
    const parameters = { worker: 'worker1', type: 'primary' };
    const response = blocks.selectCurrentBlocksMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_blocks WHERE worker = \'worker1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test block command handling [3]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
    const parameters = { category: 'immature', type: 'primary' };
    const response = blocks.selectCurrentBlocksMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_blocks WHERE category = \'immature\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test block command handling [4]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
    const parameters = { identifier: 'master', type: 'primary' };
    const response = blocks.selectCurrentBlocksMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_blocks WHERE identifier = \'master\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test block command handling [5]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = blocks.selectCurrentBlocksMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_blocks WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test block command handling [6]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
    const parameters = { confirmations: 'gt100', solo: false };
    const response = blocks.selectCurrentBlocksMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_blocks WHERE confirmations > 100 AND solo = false;';
    expect(response).toBe(expected);
  });

  test('Test block command handling [7]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
    const parameters = { confirmations: 'gt100', solo: false, hmm: 'test' };
    const response = blocks.selectCurrentBlocksMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_blocks WHERE confirmations > 100 AND solo = false;';
    expect(response).toBe(expected);
  });

  test('Test block command handling [8]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
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
    const response = blocks.insertCurrentBlocksMain('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_blocks (
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
    expect(response).toBe(expected);
  });

  test('Test block command handling [9]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
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
    const response = blocks.insertCurrentBlocksMain('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_blocks (
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
    expect(response).toBe(expected);
  });

  test('Test block command handling [10]', () => {
    const blocks = new CurrentBlocks(logger, configMainCopy);
    const response = blocks.deleteCurrentBlocksMain('Pool-Main', ['round1']);
    const expected = `
      DELETE FROM "Pool-Main".current_blocks
      WHERE round IN (round1);`;
    expect(response).toBe(expected);
  });
});
