const Schema = require('../main/schema');
const Logger = require('../../server/main/logger');
const configMain = require('../../configs/main/example.js');
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
        AND table_name = 'current_blocks');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectCurrentBlocks('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [4]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".current_blocks(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        submitted BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        category VARCHAR NOT NULL DEFAULT 'pending',
        confirmations INT NOT NULL DEFAULT -1,
        difficulty FLOAT NOT NULL DEFAULT -1,
        hash VARCHAR NOT NULL DEFAULT 'unknown',
        height INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        luck FLOAT NOT NULL DEFAULT 0,
        reward FLOAT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        solo BOOLEAN NOT NULL DEFAULT false,
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT current_blocks_unique UNIQUE (round, type));
      CREATE INDEX current_blocks_miner ON "Pool-Main".current_blocks(miner, type);
      CREATE INDEX current_blocks_worker ON "Pool-Main".current_blocks(worker, type);
      CREATE INDEX current_blocks_category ON "Pool-Main".current_blocks(category, type);
      CREATE INDEX current_blocks_identifier ON "Pool-Main".current_blocks(identifier, type);
      CREATE INDEX current_blocks_type ON "Pool-Main".current_blocks(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createCurrentBlocks('Pool-Main', () => {});
  });

  test('Test schema functionality [5]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'current_hashrate');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectCurrentHashrate('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [6]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".current_hashrate(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        identifier VARCHAR NOT NULL DEFAULT 'master',
        ip VARCHAR NOT NULL DEFAULT 'unknown',
        share VARCHAR NOT NULL DEFAULT 'unknown',
        solo BOOLEAN NOT NULL DEFAULT false,
        type VARCHAR NOT NULL DEFAULT 'primary',
        work FLOAT NOT NULL DEFAULT 0);
      CREATE INDEX current_hashrate_miner ON "Pool-Main".current_hashrate(timestamp, miner, solo, type);
      CREATE INDEX current_hashrate_worker ON "Pool-Main".current_hashrate(timestamp, worker, solo, type);
      CREATE INDEX current_hashrate_type ON "Pool-Main".current_hashrate(timestamp, solo, type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createCurrentHashrate('Pool-Main', () => {});
  });

  test('Test schema functionality [7]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'current_metadata');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectCurrentMetadata('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [8]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".current_metadata(
        id BIGSERIAL PRIMARY KEY,
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
        CONSTRAINT current_metadata_unique UNIQUE (type));
      CREATE INDEX current_metadata_type ON "Pool-Main".current_metadata(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createCurrentMetadata('Pool-Main', () => {});
  });

  test('Test schema functionality [9]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'current_miners');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectCurrentMiners('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [10]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".current_miners(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        balance FLOAT NOT NULL DEFAULT 0,
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        generate FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        immature FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        paid FLOAT NOT NULL DEFAULT 0,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        CONSTRAINT current_miners_unique UNIQUE (miner, type));
      CREATE INDEX current_miners_balance ON "Pool-Main".current_miners(balance, type);
      CREATE INDEX current_miners_miner ON "Pool-Main".current_miners(miner, type);
      CREATE INDEX current_miners_type ON "Pool-Main".current_miners(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createCurrentMiners('Pool-Main', () => {});
  });

  test('Test schema functionality [11]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'current_network');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectCurrentNetwork('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [12]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".current_network(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        difficulty FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        height INT NOT NULL DEFAULT -1,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT current_network_unique UNIQUE (type));
      CREATE INDEX current_network_type ON "Pool-Main".current_network(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createCurrentNetwork('Pool-Main', () => {});
  });

  test('Test schema functionality [13]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'current_payments');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectCurrentPayments('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [14]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".current_payments(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT current_payments_unique UNIQUE (round, type));
      CREATE INDEX current_payments_type ON "Pool-Main".current_payments(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createCurrentPayments('Pool-Main', () => {});
  });

  test('Test schema functionality [15]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'current_rounds');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectCurrentRounds('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [16]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".current_rounds(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        recent BIGINT NOT NULL DEFAULT -1,
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
        CONSTRAINT current_rounds_unique UNIQUE (recent, worker, solo, round, type));
      CREATE INDEX current_rounds_miner ON "Pool-Main".current_rounds(miner, type);
      CREATE INDEX current_rounds_worker ON "Pool-Main".current_rounds(worker, type);
      CREATE INDEX current_rounds_identifier ON "Pool-Main".current_rounds(identifier, type);
      CREATE INDEX current_rounds_round ON "Pool-Main".current_rounds(solo, round, type);
      CREATE INDEX current_rounds_historical ON "Pool-Main".current_rounds(worker, solo, type);
      CREATE INDEX current_rounds_combined ON "Pool-Main".current_rounds(worker, solo, round, type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createCurrentRounds('Pool-Main', () => {});
  });

  test('Test schema functionality [17]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'current_transactions');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectCurrentTransactions('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [18]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".current_transactions(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT current_transactions_unique UNIQUE (round, type));
      CREATE INDEX current_transactions_type ON "Pool-Main".current_transactions(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createCurrentTransactions('Pool-Main', () => {});
  });

  test('Test schema functionality [19]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'current_workers');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectCurrentWorkers('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [20]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".current_workers(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        solo BOOLEAN NOT NULL DEFAULT false,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        CONSTRAINT current_workers_unique UNIQUE (worker, solo, type));
      CREATE INDEX current_workers_miner ON "Pool-Main".current_workers(miner, type);
      CREATE INDEX current_workers_solo ON "Pool-Main".current_workers(solo, type);
      CREATE INDEX current_workers_worker ON "Pool-Main".current_workers(worker, type);
      CREATE INDEX current_workers_type ON "Pool-Main".current_workers(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createCurrentWorkers('Pool-Main', () => {});
  });

  test('Test schema functionality [21]', () => {
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

  test('Test schema functionality [22]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_blocks(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        submitted BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        category VARCHAR NOT NULL DEFAULT 'pending',
        confirmations INT NOT NULL DEFAULT -1,
        difficulty FLOAT NOT NULL DEFAULT -1,
        hash VARCHAR NOT NULL DEFAULT 'unknown',
        height INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        luck FLOAT NOT NULL DEFAULT 0,
        reward FLOAT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'unknown',
        solo BOOLEAN NOT NULL DEFAULT false,
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT historical_blocks_unique UNIQUE (round, type));
      CREATE INDEX historical_blocks_miner ON "Pool-Main".historical_blocks(miner, type);
      CREATE INDEX historical_blocks_worker ON "Pool-Main".historical_blocks(worker, type);
      CREATE INDEX historical_blocks_category ON "Pool-Main".historical_blocks(category, type);
      CREATE INDEX historical_blocks_identifier ON "Pool-Main".historical_blocks(identifier, type);
      CREATE INDEX historical_blocks_type ON "Pool-Main".historical_blocks(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalBlocks('Pool-Main', () => {});
  });

  test('Test schema functionality [23]', () => {
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

  test('Test schema functionality [24]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_metadata(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        recent BIGINT NOT NULL DEFAULT -1,
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
        CONSTRAINT historical_metadata_recent UNIQUE (recent, type));
      CREATE INDEX historical_metadata_type ON "Pool-Main".historical_metadata(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalMetadata('Pool-Main', () => {});
  });

  test('Test schema functionality [25]', () => {
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

  test('Test schema functionality [26]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_miners(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        recent BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        CONSTRAINT historical_miners_recent UNIQUE (recent, miner, type));
      CREATE INDEX historical_miners_miner ON "Pool-Main".historical_miners(miner, type);
      CREATE INDEX historical_miners_type ON "Pool-Main".historical_miners(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalMiners('Pool-Main', () => {});
  });

  test('Test schema functionality [27]', () => {
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

  test('Test schema functionality [28]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_network(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        recent BIGINT NOT NULL DEFAULT -1,
        difficulty FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        height INT NOT NULL DEFAULT -1,
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT historical_network_recent UNIQUE (recent, type));
      CREATE INDEX historical_network_type ON "Pool-Main".historical_network(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalNetwork('Pool-Main', () => {});
  });

  test('Test schema functionality [29]', () => {
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

  test('Test schema functionality [30]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_payments(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        amount FLOAT NOT NULL DEFAULT 0,
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary');
      CREATE INDEX historical_payments_miner ON "Pool-Main".historical_payments(miner, type);
      CREATE INDEX historical_payments_transaction ON "Pool-Main".historical_payments(transaction, type);
      CREATE INDEX historical_payments_type ON "Pool-Main".historical_payments(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalPayments('Pool-Main', () => {});
  });

  test('Test schema functionality [31]', () => {
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

  test('Test schema functionality [32]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_rounds(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        identifier VARCHAR NOT NULL DEFAULT 'master',
        invalid INT NOT NULL DEFAULT 0,
        round VARCHAR NOT NULL DEFAULT 'unknown',
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

  test('Test schema functionality [33]', () => {
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

  test('Test schema functionality [34]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_transactions(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        amount FLOAT NOT NULL DEFAULT 0,
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary');
      CREATE INDEX historical_transactions_transaction ON "Pool-Main".historical_transactions(transaction, type);
      CREATE INDEX historical_transactions_type ON "Pool-Main".historical_transactions(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalTransactions('Pool-Main', () => {});
  });

  test('Test schema functionality [35]', () => {
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

  test('Test schema functionality [36]', () => {
    const expected = `
      CREATE TABLE "Pool-Main".historical_workers(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        recent BIGINT NOT NULL DEFAULT -1,
        miner VARCHAR NOT NULL DEFAULT 'unknown',
        worker VARCHAR NOT NULL DEFAULT 'unknown',
        efficiency FLOAT NOT NULL DEFAULT 0,
        effort FLOAT NOT NULL DEFAULT 0,
        hashrate FLOAT NOT NULL DEFAULT 0,
        invalid INT NOT NULL DEFAULT 0,
        solo BOOLEAN NOT NULL DEFAULT false,
        stale INT NOT NULL DEFAULT 0,
        type VARCHAR NOT NULL DEFAULT 'primary',
        valid INT NOT NULL DEFAULT 0,
        CONSTRAINT historical_workers_recent UNIQUE (recent, worker, type));
      CREATE INDEX historical_workers_miner ON "Pool-Main".historical_workers(miner, type);
      CREATE INDEX historical_workers_worker ON "Pool-Main".historical_workers(worker, type);
      CREATE INDEX historical_workers_type ON "Pool-Main".historical_workers(type);`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.createHistoricalWorkers('Pool-Main', () => {});
  });
});
