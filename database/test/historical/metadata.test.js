const HistoricalMetadata = require('../../main/historical/metadata');
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
    const metadata = new HistoricalMetadata(logger, configMainCopy);
    expect(typeof metadata.configMain).toBe('object');
    expect(typeof metadata.selectHistoricalMetadataType).toBe('function');
    expect(typeof metadata.insertHistoricalMetadataCurrentUpdate).toBe('function');
  });

  test('Test metadata command handling [1]', () => {
    const metadata = new HistoricalMetadata(logger, configMainCopy);
    const response = metadata.selectHistoricalMetadataType('Pool-Main', 'primary');
    const expected = `
      SELECT * FROM "Pool-Main".historical_metadata
      WHERE type = 'primary'`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [2]', () => {
    const metadata = new HistoricalMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      recent: 1,
      blocks: 1,
      efficiency: 100,
      effort: 100,
      hashrate: 1,
      invalid: 0,
      miners: 1,
      stale: 1,
      type: 'primary',
      valid: 1,
      work: 8,
      workers: 1,
    };
    const response = metadata.insertHistoricalMetadataCurrentUpdate('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_metadata (
        timestamp, recent, blocks,
        efficiency, effort, hashrate,
        invalid, miners, stale,
        type, valid, work, workers)
      VALUES (
        1,
        1,
        1,
        100,
        100,
        1,
        0,
        1,
        1,
        'primary',
        1,
        8,
        1)
      ON CONFLICT ON CONSTRAINT historical_metadata_recent
      DO NOTHING;`;
    expect(response).toBe(expected);
  });

  test('Test metadata command handling [3]', () => {
    const metadata = new HistoricalMetadata(logger, configMainCopy);
    const updates = {
      timestamp: 1,
      recent: 1,
      blocks: 1,
      efficiency: 100,
      effort: 100,
      hashrate: 1,
      invalid: 0,
      miners: 1,
      stale: 1,
      type: 'primary',
      valid: 1,
      work: 8,
      workers: 1,
    };
    const response = metadata.insertHistoricalMetadataCurrentUpdate('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".historical_metadata (
        timestamp, recent, blocks,
        efficiency, effort, hashrate,
        invalid, miners, stale,
        type, valid, work, workers)
      VALUES (
        1,
        1,
        1,
        100,
        100,
        1,
        0,
        1,
        1,
        'primary',
        1,
        8,
        1), (
        1,
        1,
        1,
        100,
        100,
        1,
        0,
        1,
        1,
        'primary',
        1,
        8,
        1)
      ON CONFLICT ON CONSTRAINT historical_metadata_recent
      DO NOTHING;`;
    expect(response).toBe(expected);
  });
});
