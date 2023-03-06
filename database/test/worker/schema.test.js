const Schema = require('../../main/worker/schema');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

function mockExecutor(results, expected) {
  return (expecteds, callback) => {
    expect(expecteds[0]).toBe(expected);
    callback(results);
  };
}

////////////////////////////////////////////////////////////////////////////////

describe('Test schema functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of schema', () => {
    const executor = mockExecutor();
    const schema = new Schema(logger, executor, configMainCopy);
    expect(typeof schema.configMain).toBe('object');
    expect(typeof schema.selectSchema).toBe('function');
  });

  test('Test schema functionality [1]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT 1 FROM pg_namespace
        WHERE nspname = 'Pool-Main');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectSchema('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [2]', () => {
    const expected = 'CREATE SCHEMA IF NOT EXISTS "Pool-Main";';
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createSchema('Pool-Main', () => {});
  });

  test('Test schema functionality [3]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'local_shares');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectLocalShares('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [4]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".local_shares(
        id BIGSERIAL PRIMARY KEY,
        error VARCHAR NOT NULL DEFAULT 'unknown',
        uuid VARCHAR NOT NULL DEFAULT 'unknown',
        timestamp BIGINT NOT NULL DEFAULT -1,
        submitted BIGINT NOT NULL DEFAULT -1,
        ip VARCHAR NOT NULL DEFAULT '0.0.0.0',
        port INT NOT NULL DEFAULT -1,
        addrprimary VARCHAR NOT NULL DEFAULT 'unknown',
        addrauxiliary VARCHAR NOT NULL DEFAULT 'unknown',
        blockdiffprimary FLOAT NOT NULL DEFAULT -1,
        blockdiffauxiliary FLOAT NOT NULL DEFAULT -1,
        blockvalid BOOLEAN NOT NULL DEFAULT false,
        blocktype VARCHAR NOT NULL DEFAULT 'share',
        clientdiff FLOAT NOT NULL DEFAULT -1,
        hash VARCHAR NOT NULL DEFAULT 'unknown',
        height INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        reward FLOAT NOT NULL DEFAULT 0,
        sharediff FLOAT NOT NULL DEFAULT -1,
        sharevalid BOOLEAN NOT NULL DEFAULT false,
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        CONSTRAINT local_shares_unique UNIQUE (uuid));`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createLocalShares('Pool-Main', () => {});
  });

  test('Test schema functionality [5]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'local_transactions');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectLocalTransactions('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [6]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".local_transactions(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        uuid VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT local_transactions_unique UNIQUE (uuid));`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createLocalTransactions('Pool-Main', () => {});
  });
});
