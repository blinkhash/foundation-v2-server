const HistoricalBlocks = require('../../main/historical/blocks');
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
    const blocks = new HistoricalBlocks(logger, configMainCopy);
    expect(typeof blocks.configMain).toBe('object');
    expect(typeof blocks.selectHistoricalBlocksMiner).toBe('function');
    expect(typeof blocks.selectHistoricalBlocksWorker).toBe('function');
  });

  test('Test block command handling [1]', () => {
    const blocks = new HistoricalBlocks(logger, configMainCopy);
    const response = blocks.selectHistoricalBlocksMiner('Pool-Main', 'miner1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_blocks
      WHERE miner = 'miner1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test block command handling [2]', () => {
    const blocks = new HistoricalBlocks(logger, configMainCopy);
    const response = blocks.selectHistoricalBlocksWorker('Pool-Main', 'worker1', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_blocks
      WHERE worker = 'worker1' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test block command handling [3]', () => {
    const blocks = new HistoricalBlocks(logger, configMainCopy);
    const response = blocks.selectHistoricalBlocksCategory('Pool-Main', 'generate', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_blocks
      WHERE category = 'generate' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test block command handling [4]', () => {
    const blocks = new HistoricalBlocks(logger, configMainCopy);
    const response = blocks.selectHistoricalBlocksIdentifier('Pool-Main', 'master', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_blocks
      WHERE identifier = 'master' AND type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test block command handling [5]', () => {
    const blocks = new HistoricalBlocks(logger, configMainCopy);
    const response = blocks.selectHistoricalBlocksType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_blocks
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test block command handling [6]', () => {
    const blocks = new HistoricalBlocks(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      category: 'confirmed',
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
    const response = blocks.insertHistoricalBlocksCurrent('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_blocks (
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
        'confirmed',
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
      ON CONFLICT DO NOTHING;`;
    expect(response).toBe(expected);
  });

  test('Test block command handling [7]', () => {
    const blocks = new HistoricalBlocks(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      category: 'confirmed',
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
    const response = blocks.insertHistoricalBlocksCurrent('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_blocks (
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
        'confirmed',
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
        'confirmed',
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
      ON CONFLICT DO NOTHING;`;
    expect(response).toBe(expected);
  });
});
