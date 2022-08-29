const PoolMetadata = require('../../main/pool/metadata');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database metadata functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of metadata commands', () => {
    const metadata = new PoolMetadata(logger, configMainCopy);
    expect(typeof metadata.configMain).toBe('object');
    expect(typeof metadata.selectPoolMetadataType).toBe('function');
    expect(typeof metadata.insertPoolMetadataHashrateUpdate).toBe('function');
  });

  test('Test metadata command handling [1]', () => {
    const metadata = new PoolMetadata(logger, configMainCopy);
    const response = metadata.selectPoolMetadataType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".pool_metadata
      WHERE type = 'primary';`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [2]', () => {
    const metadata = new PoolMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      blocks: 1,
      type: 'primary',
    };
    const response = metadata.insertPoolMetadataBlocksUpdate('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_metadata (
        timestamp, blocks, type)
      VALUES (
        1,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Main".pool_metadata.blocks + EXCLUDED.blocks;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [3]', () => {
    const metadata = new PoolMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      blocks: 1,
      type: 'primary',
    };
    const response = metadata.insertPoolMetadataBlocksUpdate('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_metadata (
        timestamp, blocks, type)
      VALUES (
        1,
        1,
        'primary'), (
        1,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Main".pool_metadata.blocks + EXCLUDED.blocks;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [4]', () => {
    const metadata = new PoolMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      hashrate: 1,
      miners: 1,
      type: 'primary',
      workers: 1,
    };
    const response = metadata.insertPoolMetadataHashrateUpdate('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_metadata (
        timestamp, hashrate, miners,
        type, workers)
      VALUES (
        1,
        1,
        1,
        'primary',
        1)
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate,
        miners = EXCLUDED.miners,
        workers = EXCLUDED.workers;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [5]', () => {
    const metadata = new PoolMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      hashrate: 1,
      miners: 1,
      type: 'primary',
      workers: 1,
    };
    const response = metadata.insertPoolMetadataHashrateUpdate('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_metadata (
        timestamp, hashrate, miners,
        type, workers)
      VALUES (
        1,
        1,
        1,
        'primary',
        1), (
        1,
        1,
        1,
        'primary',
        1)
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate,
        miners = EXCLUDED.miners,
        workers = EXCLUDED.workers;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [6]', () => {
    const metadata = new PoolMetadata(logger, configMainCopy);
    const updates = { timestamp: 1, type: 'primary' };
    const response = metadata.insertPoolMetadataRoundsReset('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1,
        0, 0, 0, 0, 'primary', 0, 0)
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [7]', () => {
    const metadata = new PoolMetadata(logger, configMainCopy);
    const updates = { timestamp: 1, type: 'primary' };
    const response = metadata.insertPoolMetadataRoundsReset('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1,
        0, 0, 0, 0, 'primary', 0, 0), (
        1,
        0, 0, 0, 0, 'primary', 0, 0)
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [8]', () => {
    const metadata = new PoolMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 8,
    };
    const response = metadata.insertPoolMetadataRoundsUpdate('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1,
        100,
        100,
        0,
        0,
        'primary',
        1,
        8)
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Main".pool_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Main".pool_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Main".pool_metadata.valid + EXCLUDED.valid,
        work = "Pool-Main".pool_metadata.work + EXCLUDED.work;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [9]', () => {
    const metadata = new PoolMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      efficiency: 100,
      effort: 100,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 8,
    };
    const response = metadata.insertPoolMetadataRoundsUpdate('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".pool_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1,
        100,
        100,
        0,
        0,
        'primary',
        1,
        8), (
        1,
        100,
        100,
        0,
        0,
        'primary',
        1,
        8)
      ON CONFLICT ON CONSTRAINT pool_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Main".pool_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Main".pool_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Main".pool_metadata.valid + EXCLUDED.valid,
        work = "Pool-Main".pool_metadata.work + EXCLUDED.work;`;
    expect(response).toBe(expected);
  });
});
