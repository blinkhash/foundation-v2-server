const Schema = require('../main/schema');
const Logger = require('../../server/main/logger');
const configMain = require('../../configs/main.js');
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
        AND table_name = 'historical_blocks');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectHistoricalBlocks('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [4]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_blocks(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        difficulty FLOAT NOT NULL DEFAULT -1,
        hash VARCHAR NOT NULL DEFAULT 'unknown',
        height INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        luck FLOAT NOT NULL DEFAULT 0,
        orphan BOOLEAN NOT NULL DEFAULT false,
        reward FLOAT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        solo BOOLEAN NOT NULL DEFAULT false,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT historical_blocks_unique UNIQUE (round, type));
      CREATE INDEX historical_blocks_miner ON "Pool-Main".historical_blocks(miner, type);
      CREATE INDEX historical_blocks_worker ON "Pool-Main".historical_blocks(worker, type);
      CREATE INDEX historical_blocks_identifier ON "Pool-Main".historical_blocks(identifier, type);
      CREATE INDEX historical_blocks_type ON "Pool-Main".historical_blocks(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalBlocks('Pool-Main', () => {});
  });

  test('Test schema functionality [5]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'historical_metadata');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectHistoricalMetadata('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [6]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_metadata(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        blocks INT NOT NULL DEFAULT 0,
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        miners INT NOT NULL DEFAULT 0,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        work FLOAT NOT NULL DEFAULT 0,
        workers INT NOT NULL DEFAULT 0);
      CREATE INDEX historical_metadata_type ON "Pool-Main".historical_metadata(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalMetadata('Pool-Main', () => {});
  });

  test('Test schema functionality [7]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'historical_miners');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectHistoricalMiners('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [8]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_miners(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        efficiency FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary');
      CREATE INDEX historical_miners_miner ON "Pool-Main".historical_miners(miner, type);
      CREATE INDEX historical_miners_type ON "Pool-Main".historical_miners(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalMiners('Pool-Main', () => {});
  });

  test('Test schema functionality [9]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'historical_network');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectHistoricalNetwork('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [10]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_network(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        difficulty FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        height INT NOT NULL DEFAULT -1,
        type VARCHAR NOT NULL DEFAULT 'primary');
      CREATE INDEX historical_network_type ON "Pool-Main".historical_network(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalNetwork('Pool-Main', () => {});
  });

  test('Test schema functionality [11]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'historical_payments');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectHistoricalPayments('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [12]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_payments(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        amount FLOAT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary');
      CREATE INDEX historical_payments_miner ON "Pool-Main".historical_payments(miner, type);
      CREATE INDEX historical_payments_worker ON "Pool-Main".historical_payments(worker, type);
      CREATE INDEX historical_payments_round ON "Pool-Main".historical_payments(round, type);
      CREATE INDEX historical_payments_transaction ON "Pool-Main".historical_payments(transaction, type);
      CREATE INDEX historical_payments_type ON "Pool-Main".historical_payments(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalPayments('Pool-Main', () => {});
  });

  test('Test schema functionality [13]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'historical_rounds');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectHistoricalRounds('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [14]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_rounds(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        round VARCHAR NOT NULL DEFAULT 'unknown',
        identifier VARCHAR NOT NULL DEFAULT 'master',
        invalid INT NOT NULL DEFAULT 0,
        solo BOOLEAN NOT NULL DEFAULT false,
        stale INT NOT NULL DEFAULT 0,
        times FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        work FLOAT NOT NULL DEFAULT 0,
        CONSTRAINT historical_rounds_unique UNIQUE (worker, solo, round, type));
      CREATE INDEX historical_rounds_miner ON "Pool-Main".historical_rounds(miner, type);
      CREATE INDEX historical_rounds_worker ON "Pool-Main".historical_rounds(worker, type);
      CREATE INDEX historical_rounds_identifier ON "Pool-Main".historical_rounds(identifier, type);
      CREATE INDEX historical_rounds_round ON "Pool-Main".historical_rounds(solo, round, type);
      CREATE INDEX historical_rounds_historical ON "Pool-Main".historical_rounds(worker, solo, type);
      CREATE INDEX historical_rounds_combined ON "Pool-Main".historical_rounds(worker, solo, round, type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalRounds('Pool-Main', () => {});
  });

  test('Test schema functionality [15]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'historical_transactions');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectHistoricalTransactions('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [16]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_transactions(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        amount FLOAT NOT NULL DEFAULT 0,
        round VARCHAR UNIQUE NOT NULL DEFAULT 'unknown',
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary');
      CREATE INDEX historical_transactions_round ON "Pool-Main".historical_transactions(round, type);
      CREATE INDEX historical_transactions_transaction ON "Pool-Main".historical_transactions(transaction, type);
      CREATE INDEX historical_transactions_type ON "Pool-Main".historical_transactions(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalTransactions('Pool-Main', () => {});
  });

  test('Test schema functionality [17]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'historical_workers');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectHistoricalWorkers('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [18]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_workers(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        efficiency FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary');
      CREATE INDEX historical_workers_miner ON "Pool-Main".historical_workers(miner, type);
      CREATE INDEX historical_workers_worker ON "Pool-Main".historical_workers(worker, type);
      CREATE INDEX historical_workers_type ON "Pool-Main".historical_workers(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalWorkers('Pool-Main', () => {});
  });

  test('Test schema functionality [19]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'pool_blocks');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectPoolBlocks('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [20]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".pool_blocks(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        difficulty FLOAT NOT NULL DEFAULT -1,
        hash VARCHAR NOT NULL DEFAULT 'unknown',
        height INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        luck FLOAT NOT NULL DEFAULT 0,
        orphan BOOLEAN NOT NULL DEFAULT false,
        reward FLOAT NOT NULL DEFAULT 0,
        round VARCHAR UNIQUE NOT NULL DEFAULT 'unknown',
        solo BOOLEAN NOT NULL DEFAULT false,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT pool_blocks_unique UNIQUE (round, type));
      CREATE INDEX pool_blocks_miner ON "Pool-Main".pool_blocks(miner, type);
      CREATE INDEX pool_blocks_worker ON "Pool-Main".pool_blocks(worker, type);
      CREATE INDEX pool_blocks_identifier ON "Pool-Main".pool_blocks(identifier, type);
      CREATE INDEX pool_blocks_type ON "Pool-Main".pool_blocks(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createPoolBlocks('Pool-Main', () => {});
  });

  test('Test schema functionality [21]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'pool_hashrate');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectPoolHashrate('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [22]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".pool_hashrate(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        work FLOAT NOT NULL DEFAULT 0);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createPoolHashrate('Pool-Main', () => {});
  });

  test('Test schema functionality [23]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'pool_metadata');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectPoolMetadata('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [24]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".pool_metadata(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        blocks INT NOT NULL DEFAULT 0,
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        miners INT NOT NULL DEFAULT 0,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        work FLOAT NOT NULL DEFAULT 0,
        workers INT NOT NULL DEFAULT 0,
        CONSTRAINT pool_metadata_unique UNIQUE (type));
      CREATE INDEX pool_metadata_type ON "Pool-Main".pool_metadata(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createPoolMetadata('Pool-Main', () => {});
  });

  test('Test schema functionality [25]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'pool_miners');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectPoolMiners('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [26]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".pool_miners(
        miner VARCHAR PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        balance FLOAT NOT NULL DEFAULT 0,
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        generate FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        immature FLOAT NOT NULL DEFAULT 0,
        paid FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary');
      CREATE INDEX pool_miners_miner ON "Pool-Main".pool_miners(miner, type);
      CREATE INDEX pool_miners_type ON "Pool-Main".pool_miners(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createPoolMiners('Pool-Main', () => {});
  });

  test('Test schema functionality [27]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'pool_rounds');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectPoolRounds('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [28]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".pool_rounds(
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        identifier VARCHAR NOT NULL DEFAULT 'master',
        invalid INT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'current',
        solo BOOLEAN NOT NULL DEFAULT false,
        stale INT NOT NULL DEFAULT 0,
        times FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        work FLOAT NOT NULL DEFAULT 0,
        CONSTRAINT pool_rounds_unique UNIQUE (worker, solo, round, type));
      CREATE INDEX pool_rounds_miner ON "Pool-Main".pool_rounds(miner, type);
      CREATE INDEX pool_rounds_worker ON "Pool-Main".pool_rounds(worker, type);
      CREATE INDEX pool_rounds_identifier ON "Pool-Main".pool_rounds(identifier, type);
      CREATE INDEX pool_rounds_round ON "Pool-Main".pool_rounds(solo, round, type);
      CREATE INDEX pool_rounds_historical ON "Pool-Main".pool_rounds(worker, solo, type);
      CREATE INDEX pool_rounds_combined ON "Pool-Main".pool_rounds(worker, solo, round, type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createPoolRounds('Pool-Main', () => {});
  });

  test('Test schema functionality [29]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'pool_workers');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectPoolWorkers('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [30]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".pool_workers(
        worker VARCHAR PRIMARY KEY,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        timestamp BIGINT NOT NULL DEFAULT -1,
        balance FLOAT NOT NULL DEFAULT 0,
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        generate FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        immature FLOAT NOT NULL DEFAULT 0,
        paid FLOAT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary');
      CREATE INDEX pool_workers_miner ON "Pool-Main".pool_workers(miner, type);
      CREATE INDEX pool_workers_worker ON "Pool-Main".pool_workers(worker, type);
      CREATE INDEX pool_workers_type ON "Pool-Main".pool_workers(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createPoolWorkers('Pool-Main', () => {});
  });
});
