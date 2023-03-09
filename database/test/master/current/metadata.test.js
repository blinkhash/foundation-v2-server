const CurrentMetadata = require('../../../main/master/current/metadata');
const Logger = require('../../../../server/main/logger');
const configMain = require('../../../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database metadata functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of metadata commands', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    expect(typeof metadata.configMain).toBe('object');
    expect(typeof metadata.selectCurrentMetadataMain).toBe('function');
    expect(typeof metadata.insertCurrentMetadataHashrate).toBe('function');
  });

  test('Test query handling [1]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    expect(metadata.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(metadata.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    expect(metadata.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(metadata.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(metadata.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(metadata.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(metadata.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(metadata.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test query handling [3]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    expect(metadata.handleSpecial({ limit: '100' }, '')).toBe(' LIMIT 100');
    expect(metadata.handleSpecial({ offset: '1' }, '')).toBe(' OFFSET 1');
    expect(metadata.handleSpecial({ order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC');
    expect(metadata.handleSpecial({ direction: 'ascending' }, '')).toBe(' ORDER BY id ASC');
    expect(metadata.handleSpecial({ limit: '100', offset: '1' }, '')).toBe(' LIMIT 100 OFFSET 1');
    expect(metadata.handleSpecial({ limit: '100', offset: '1', order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
    expect(metadata.handleSpecial({ limit: '100', offset: '1', order: 'parameter', direction: 'descending' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
  });

  test('Test metadata command handling [1]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = metadata.selectCurrentMetadataMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_metadata WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [2]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary' };
    const response = metadata.selectCurrentMetadataMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_metadata WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [3]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    const parameters = { timestamp: 'ge1', type: 'primary', hmm: 'test' };
    const response = metadata.selectCurrentMetadataMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".current_metadata WHERE timestamp >= 1 AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [4]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      blocks: 1,
      type: 'primary',
    };
    const response = metadata.insertCurrentMetadataBlocks('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Main".current_metadata.blocks + EXCLUDED.blocks;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [5]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      blocks: 1,
      type: 'primary',
    };
    const response = metadata.insertCurrentMetadataBlocks('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1,
        1,
        'primary'), (
        1,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Main".current_metadata.blocks + EXCLUDED.blocks;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [6]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      hashrate: 1,
      miners: 1,
      type: 'primary',
      workers: 1,
    };
    const response = metadata.insertCurrentMetadataHashrate('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_metadata (
        timestamp, hashrate, miners,
        type, workers)
      VALUES (
        1,
        1,
        1,
        'primary',
        1)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate,
        miners = EXCLUDED.miners,
        workers = EXCLUDED.workers;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [7]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      hashrate: 1,
      miners: 1,
      type: 'primary',
      workers: 1,
    };
    const response = metadata.insertCurrentMetadataHashrate('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_metadata (
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
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate,
        miners = EXCLUDED.miners,
        workers = EXCLUDED.workers;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [8]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    const updates = { timestamp: 1, type: 'primary' };
    const response = metadata.insertCurrentMetadataRoundsReset('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1,
        0, 0, 0, 0, 'primary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [9]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
    const updates = { timestamp: 1, type: 'primary' };
    const response = metadata.insertCurrentMetadataRoundsReset('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1,
        0, 0, 0, 0, 'primary', 0, 0), (
        1,
        0, 0, 0, 0, 'primary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [10]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
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
    const response = metadata.insertCurrentMetadataRounds('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_metadata (
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
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Main".current_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Main".current_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Main".current_metadata.valid + EXCLUDED.valid,
        work = "Pool-Main".current_metadata.work + EXCLUDED.work;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [11]', () => {
    const metadata = new CurrentMetadata(logger, configMainCopy);
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
    const response = metadata.insertCurrentMetadataRounds('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".current_metadata (
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
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Main".current_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Main".current_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Main".current_metadata.valid + EXCLUDED.valid,
        work = "Pool-Main".current_metadata.work + EXCLUDED.work;`;
    expect(response).toBe(expected);
  });
});
