const CommandsMaster = require('../../database/main/master/commands');
const CommandsWorker = require('../../database/main/worker/commands');
const Logger = require('../main/logger');
const MockDate = require('mockdate');
const Statistics = require('../main/statistics');
const config = require('../../configs/pools/example.js');
const configMain = require('../../configs/main/example.js');
const events = require('events');

////////////////////////////////////////////////////////////////////////////////

function mockClient(configMain, result) {
  const client = new events.EventEmitter();
  client.master = { commands: new CommandsMaster(null, null, configMain) };
  client.worker = { commands: new CommandsWorker(null, null, configMain) };
  client.master.commands.executor = (commands, callback) => {
    client.emit('transaction', commands);
    callback(result);
  };
  client.worker.commands.executor = (commands, callback) => {
    client.emit('transaction', commands);
    callback(result);
  };
  return client;
}

////////////////////////////////////////////////////////////////////////////////

describe('Test statistics functionality', () => {

  let configCopy, configMainCopy;
  beforeEach(() => {
    configCopy = JSON.parse(JSON.stringify(config));
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of statistics', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    expect(typeof statistics.handleCurrentMetadata).toBe('function');
    expect(typeof statistics.handleCurrentMiners).toBe('function');
  });

  test('Test statistics database updates [1]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const expected = {
      timestamp: 1634742080841,
      hashrate: 1431655765.3333333,
      miners: 1,
      type: 'primary',
      workers: 1,
    };
    expect(statistics.handleCurrentMetadata(1, 1, 100, 'primary')).toStrictEqual(expected);
  });

  test('Test statistics database updates [2]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    delete configCopy.primary.coin.algorithm;
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const expected = {
      timestamp: 1634742080841,
      hashrate: 1431655765.3333333,
      miners: 1,
      type: 'primary',
      workers: 1,
    };
    expect(statistics.handleCurrentMetadata(1, 1, 100, 'primary')).toStrictEqual(expected);
  });

  test('Test statistics database updates [3]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const hashrate = [
      { miner: 'miner1', current_work: 100 },
      { miner: 'miner2', current_work: 10 },
      { miner: 'miner3', current_work: 140 }];
    const miners = [{ miner: 'miner1'}, { miner: 'miner2'}, { miner: 'miner3'}];
    const expected = [
      { timestamp: 1634742080841, miner: 'miner1', hashrate: 1431655765.3333333, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner2', hashrate: 143165576.53333333, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner3', hashrate: 2004318071.4666667, type: 'primary' }];
    expect(statistics.handleCurrentMiners(hashrate, miners, 'primary')).toStrictEqual(expected);
  });

  test('Test statistics database updates [4]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    delete configCopy.primary.coin.algorithm;
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const hashrate = [
      { miner: 'miner1', current_work: 100 },
      { miner: 'miner3', current_work: 140 }];
    const miners = [{ miner: 'miner1'}, { miner: 'miner2'}, { miner: 'miner3'}];
    const expected = [
      { timestamp: 1634742080841, miner: 'miner1', hashrate: 1431655765.3333333, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner2', hashrate: 0, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner3', hashrate: 2004318071.4666667, type: 'primary' }];
    expect(statistics.handleCurrentMiners(hashrate, miners, 'primary')).toStrictEqual(expected);
  });

  test('Test statistics database updates [5]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const hashrate = [
      { worker: 'miner1', current_work: 100 },
      { worker: 'miner2', current_work: 10 },
      { worker: 'miner3', current_work: 140 }];
    const workers = [
      { worker: 'miner1', solo: false },
      { worker: 'miner2', solo: false },
      { worker: 'miner3', solo: false }];
    const expected = [
      { timestamp: 1634742080841, miner: 'miner1', worker: 'miner1', hashrate: 1431655765.3333333, solo: false, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner2', worker: 'miner2', hashrate: 143165576.53333333, solo: false, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner3', worker: 'miner3', hashrate: 2004318071.4666667, solo: false, type: 'primary' }];
    expect(statistics.handleCurrentWorkers(hashrate, workers, 'primary')).toStrictEqual(expected);
  });

  test('Test statistics database updates [6]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    delete configCopy.primary.coin.algorithm;
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const hashrate = [
      { worker: 'miner1', current_work: 100 },
      { worker: 'miner3', current_work: 140 }];
    const workers = [
      { worker: 'miner1', solo: false },
      { worker: 'miner2', solo: false },
      { worker: 'miner3', solo: false }];
    const expected = [
      { timestamp: 1634742080841, miner: 'miner1', worker: 'miner1', hashrate: 1431655765.3333333, solo: false, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner2', worker: 'miner2', hashrate: 0, solo: false, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner3', worker: 'miner3', hashrate: 2004318071.4666667, solo: false, type: 'primary' }];
    expect(statistics.handleCurrentWorkers(hashrate, workers, 'primary')).toStrictEqual(expected);
  });

  test('Test statistics database updates [7]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const hashrate = [
      { worker: null, current_work: 100 },
      { worker: 'miner2', current_work: 10 },
      { worker: 'miner3', current_work: 140 }];
    const workers = [
      { worker: null, solo: false },
      { worker: 'miner2', solo: false },
      { worker: 'miner3', solo: false }];
    const expected = [
      { timestamp: 1634742080841, miner: '', worker: null, hashrate: 1431655765.3333333, solo: false, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner2', worker: 'miner2', hashrate: 143165576.53333333, solo: false, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner3', worker: 'miner3', hashrate: 2004318071.4666667, solo: false, type: 'primary' }];
    expect(statistics.handleCurrentWorkers(hashrate, workers, 'primary')).toStrictEqual(expected);
  });

  test('Test statistics database updates [8]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const metadata = {
      timestamp: 1,
      blocks: 1,
      efficiency: 100,
      effort: 100,
      hashrate: 100,
      invalid: 0,
      miners: 1,
      stale: 0,
      type: 'primary',
      valid: 100,
      work: 100,
      workers: 1,
    };
    const expected = {
      timestamp: 1634742080841,
      recent: 1634742000000,
      blocks: 1,
      efficiency: 100,
      effort: 100,
      hashrate: 100,
      invalid: 0,
      miners: 1,
      stale: 0,
      type: 'primary',
      valid: 100,
      work: 100,
      workers: 1,
    };
    expect(statistics.handleHistoricalMetadata(metadata)).toStrictEqual(expected);
  });

  test('Test statistics database updates [9]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const miners = [{
      timestamp: 1,
      miner: 'miner1',
      efficiency: 100,
      effort: 100,
      hashrate: 100,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 1,
    }];
    const expected = [{
      timestamp: 1634742080841,
      recent: 1634742000000,
      miner: 'miner1',
      efficiency: 100,
      effort: 100,
      hashrate: 100,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 1,
    }];
    expect(statistics.handleHistoricalMiners(miners)).toStrictEqual(expected);
  });

  test('Test statistics database updates [10]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const network = {
      timestamp: 1,
      difficulty: 1,
      hashrate: 100,
      height: 1,
      type: 'primary',
    };
    const expected = {
      timestamp: 1634742080841,
      recent: 1634742000000,
      difficulty: 1,
      hashrate: 100,
      height: 1,
      type: 'primary',
    };
    expect(statistics.handleHistoricalNetwork(network)).toStrictEqual(expected);
  });

  test('Test statistics database updates [11]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const workers = [{
      timestamp: 1,
      miner: 'miner1',
      worker: 'worker1',
      efficiency: 100,
      effort: 100,
      hashrate: 100,
      invalid: 0,
      solo: false,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 1,
    }];
    const expected = [{
      timestamp: 1634742080841,
      recent: 1634742000000,
      miner: 'miner1',
      worker: 'worker1',
      efficiency: 100,
      effort: 100,
      hashrate: 100,
      invalid: 0,
      solo: false,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 1,
    }];
    expect(statistics.handleHistoricalWorkers(workers)).toStrictEqual(expected);
  });

  test('Test statistics primary updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const lookups = [
      null,
      null,
      { rows: [{ count: 1 }] },
      { rows: [{ count: 1 }] },
      { rows: [{ count: 2 }] },
      { rows: [
        { miner: 'miner1', current_work: 100 },
        { miner: 'miner2', current_work: 10 },
        { miner: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [{ current_work: 100 }] },
      { rows: [{
        timestamp: 1,
        blocks: 1,
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        miners: 1,
        stale: 0,
        type: 'primary',
        valid: 100,
        work: 100,
        workers: 1,
      }]},
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        stale: 0,
        type: 'primary',
        valid: 1,
        work: 1,
      }]},
      { rows: [{
        timestamp: 1,
        difficulty: 1,
        hashrate: 100,
        height: 1,
        type: 'primary',
      }]},
      null,
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        solo: true,
        stale: 0,
        type: 'primary',
        valid: 1,
        work: 1,
      }]},
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        solo: false,
        stale: 0,
        type: 'primary',
        valid: 1,
        work: 1,
      }]},
      null];
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, hashrate, miners,
        type, workers)
      VALUES (
        1634742080841,
        1431655765.3333333,
        1,
        'primary',
        3)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate,
        miners = EXCLUDED.miners,
        workers = EXCLUDED.workers;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, hashrate,
        type)
      VALUES (
        1634742080841,
        'miner1',
        1431655765.3333333,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedSoloWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES (
        1634742080841,
        'worker1',
        'worker1',
        0,
        true,
        'primary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedSharedWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES (
        1634742080841,
        'worker1',
        'worker1',
        0,
        false,
        'primary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedHistoricalMetadata = `
      INSERT INTO "Pool-Bitcoin".historical_metadata (
        timestamp, recent, blocks,
        efficiency, effort, hashrate,
        invalid, miners, stale,
        type, valid, work, workers)
      VALUES (
        1634742080841,
        1634742000000,
        1,
        100,
        100,
        100,
        0,
        1,
        0,
        'primary',
        100,
        100,
        1)
      ON CONFLICT ON CONSTRAINT historical_metadata_recent
      DO NOTHING;`;
    const expectedHistoricalMiners = `
      INSERT INTO "Pool-Bitcoin".historical_miners (
        timestamp, recent, miner,
        efficiency, effort, hashrate,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        100,
        100,
        100,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_miners_recent
      DO NOTHING;`;
    const expectedHistoricalNetwork = `
      INSERT INTO "Pool-Bitcoin".historical_network (
        timestamp, recent, difficulty,
        hashrate, height, type)
      VALUES (
        1634742080841,
        1634742000000,
        1,
        100,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT historical_network_recent
      DO NOTHING;`;
    const expectedSoloHistoricalWorkers = `
      INSERT INTO "Pool-Bitcoin".historical_workers (
        timestamp, recent, miner,
        worker, efficiency, effort,
        hashrate, invalid, solo,
        stale, type, valid, work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        'worker1',
        100,
        100,
        100,
        0,
        true,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_workers_recent
      DO NOTHING;`;
    const expectedSharedHistoricalWorkers = `
      INSERT INTO "Pool-Bitcoin".historical_workers (
        timestamp, recent, miner,
        worker, efficiency, effort,
        hashrate, invalid, solo,
        stale, type, valid, work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        'worker1',
        100,
        100,
        100,
        0,
        false,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_workers_recent
      DO NOTHING;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(11);
      expect(transaction[1]).toBe(expectedMetadata);
      expect(transaction[2]).toBe(expectedMiners);
      expect(transaction[3]).toBe(expectedSoloWorkers);
      expect(transaction[4]).toBe(expectedSharedWorkers);
      expect(transaction[5]).toBe(expectedHistoricalMetadata);
      expect(transaction[6]).toBe(expectedHistoricalMiners);
      expect(transaction[7]).toBe(expectedHistoricalNetwork);
      expect(transaction[8]).toBe(expectedSoloHistoricalWorkers);
      expect(transaction[9]).toBe(expectedSharedHistoricalWorkers);
      done();
    });
    statistics.handlePrimary(lookups, () => {});
  });

  test('Test statistics primary updates [2]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const lookups = [
      null,
      null,
      { rows: [{}] },
      { rows: [{}] },
      { rows: [{}] },
      { rows: [
        { miner: 'miner1', current_work: 100 },
        { miner: 'miner2', current_work: 10 },
        { miner: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [{}] },
      { rows: [{
        timestamp: 1,
        blocks: 1,
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        miners: 1,
        stale: 0,
        type: 'primary',
        valid: 100,
        work: 100,
        workers: 1,
      }]},
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        stale: 0,
        type: 'primary',
        valid: 1,
        work: 1,
      }]},
      { rows: [{
        timestamp: 1,
        difficulty: 1,
        hashrate: 100,
        height: 1,
        type: 'primary',
      }]},
      null,
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        solo: true,
        stale: 0,
        type: 'primary',
        valid: 1,
        work: 1,
      }]},
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        solo: false,
        stale: 0,
        type: 'primary',
        valid: 1,
        work: 1,
      }]},
      null];
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, hashrate, miners,
        type, workers)
      VALUES (
        1634742080841,
        0,
        0,
        'primary',
        0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate,
        miners = EXCLUDED.miners,
        workers = EXCLUDED.workers;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, hashrate,
        type)
      VALUES (
        1634742080841,
        'miner1',
        1431655765.3333333,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedSoloWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES (
        1634742080841,
        'worker1',
        'worker1',
        0,
        true,
        'primary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedSharedWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES (
        1634742080841,
        'worker1',
        'worker1',
        0,
        false,
        'primary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedHistoricalMetadata = `
      INSERT INTO "Pool-Bitcoin".historical_metadata (
        timestamp, recent, blocks,
        efficiency, effort, hashrate,
        invalid, miners, stale,
        type, valid, work, workers)
      VALUES (
        1634742080841,
        1634742000000,
        1,
        100,
        100,
        100,
        0,
        1,
        0,
        'primary',
        100,
        100,
        1)
      ON CONFLICT ON CONSTRAINT historical_metadata_recent
      DO NOTHING;`;
    const expectedHistoricalMiners = `
      INSERT INTO "Pool-Bitcoin".historical_miners (
        timestamp, recent, miner,
        efficiency, effort, hashrate,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        100,
        100,
        100,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_miners_recent
      DO NOTHING;`;
    const expectedHistoricalNetwork = `
      INSERT INTO "Pool-Bitcoin".historical_network (
        timestamp, recent, difficulty,
        hashrate, height, type)
      VALUES (
        1634742080841,
        1634742000000,
        1,
        100,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT historical_network_recent
      DO NOTHING;`;
    const expectedSoloHistoricalWorkers = `
      INSERT INTO "Pool-Bitcoin".historical_workers (
        timestamp, recent, miner,
        worker, efficiency, effort,
        hashrate, invalid, solo,
        stale, type, valid, work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        'worker1',
        100,
        100,
        100,
        0,
        true,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_workers_recent
      DO NOTHING;`;
    const expectedSharedHistoricalWorkers = `
      INSERT INTO "Pool-Bitcoin".historical_workers (
        timestamp, recent, miner,
        worker, efficiency, effort,
        hashrate, invalid, solo,
        stale, type, valid, work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        'worker1',
        100,
        100,
        100,
        0,
        false,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_workers_recent
      DO NOTHING;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(11);
      expect(transaction[1]).toBe(expectedMetadata);
      expect(transaction[2]).toBe(expectedMiners);
      expect(transaction[3]).toBe(expectedSoloWorkers);
      expect(transaction[4]).toBe(expectedSharedWorkers);
      expect(transaction[5]).toBe(expectedHistoricalMetadata);
      expect(transaction[6]).toBe(expectedHistoricalMiners);
      expect(transaction[7]).toBe(expectedHistoricalNetwork);
      expect(transaction[8]).toBe(expectedSoloHistoricalWorkers);
      expect(transaction[9]).toBe(expectedSharedHistoricalWorkers);
      done();
    });
    statistics.handlePrimary(lookups, () => {});
  });

  test('Test statistics primary updates [3]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const lookups = [
      null,
      null,
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      null,
      { rows: [] },
      { rows: [] },
      null,
      null,
      { rows: [] },
      { rows: [] },
      null];
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(2);
      done();
    });
    statistics.handlePrimary(lookups, () => {});
  });

  test('Test statistics auxiliary updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const lookups = [
      null,
      null,
      { rows: [{ count: 1 }] },
      { rows: [{ count: 1 }] },
      { rows: [{ count: 2 }] },
      { rows: [
        { miner: 'miner1', current_work: 100 },
        { miner: 'miner2', current_work: 10 },
        { miner: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [{ current_work: 100 }] },
      { rows: [{
        timestamp: 1,
        blocks: 1,
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        miners: 1,
        stale: 0,
        type: 'auxiliary',
        valid: 100,
        work: 100,
        workers: 1,
      }]},
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        stale: 0,
        type: 'auxiliary',
        valid: 1,
        work: 1,
      }]},
      { rows: [{
        timestamp: 1,
        difficulty: 1,
        hashrate: 100,
        height: 1,
        type: 'auxiliary',
      }]},
      null,
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        solo: true,
        stale: 0,
        type: 'auxiliary',
        valid: 1,
        work: 1,
      }]},
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        solo: false,
        stale: 0,
        type: 'auxiliary',
        valid: 1,
        work: 1,
      }]},
      null];
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, hashrate, miners,
        type, workers)
      VALUES (
        1634742080841,
        1431655765.3333333,
        1,
        'auxiliary',
        3)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate,
        miners = EXCLUDED.miners,
        workers = EXCLUDED.workers;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, hashrate,
        type)
      VALUES (
        1634742080841,
        'miner1',
        1431655765.3333333,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedSoloWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES (
        1634742080841,
        'worker1',
        'worker1',
        0,
        true,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedSharedWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES (
        1634742080841,
        'worker1',
        'worker1',
        0,
        false,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedHistoricalMetadata = `
      INSERT INTO "Pool-Bitcoin".historical_metadata (
        timestamp, recent, blocks,
        efficiency, effort, hashrate,
        invalid, miners, stale,
        type, valid, work, workers)
      VALUES (
        1634742080841,
        1634742000000,
        1,
        100,
        100,
        100,
        0,
        1,
        0,
        'auxiliary',
        100,
        100,
        1)
      ON CONFLICT ON CONSTRAINT historical_metadata_recent
      DO NOTHING;`;
    const expectedHistoricalMiners = `
      INSERT INTO "Pool-Bitcoin".historical_miners (
        timestamp, recent, miner,
        efficiency, effort, hashrate,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        100,
        100,
        100,
        0,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_miners_recent
      DO NOTHING;`;
    const expectedHistoricalNetwork = `
      INSERT INTO "Pool-Bitcoin".historical_network (
        timestamp, recent, difficulty,
        hashrate, height, type)
      VALUES (
        1634742080841,
        1634742000000,
        1,
        100,
        1,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT historical_network_recent
      DO NOTHING;`;
    const expectedSoloHistoricalWorkers = `
      INSERT INTO "Pool-Bitcoin".historical_workers (
        timestamp, recent, miner,
        worker, efficiency, effort,
        hashrate, invalid, solo,
        stale, type, valid, work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        'worker1',
        100,
        100,
        100,
        0,
        true,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_workers_recent
      DO NOTHING;`;
    const expectedSharedHistoricalWorkers = `
      INSERT INTO "Pool-Bitcoin".historical_workers (
        timestamp, recent, miner,
        worker, efficiency, effort,
        hashrate, invalid, solo,
        stale, type, valid, work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        'worker1',
        100,
        100,
        100,
        0,
        false,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_workers_recent
      DO NOTHING;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(11);
      expect(transaction[1]).toBe(expectedMetadata);
      expect(transaction[2]).toBe(expectedMiners);
      expect(transaction[3]).toBe(expectedSoloWorkers);
      expect(transaction[4]).toBe(expectedSharedWorkers);
      expect(transaction[5]).toBe(expectedHistoricalMetadata);
      expect(transaction[6]).toBe(expectedHistoricalMiners);
      expect(transaction[7]).toBe(expectedHistoricalNetwork);
      expect(transaction[8]).toBe(expectedSoloHistoricalWorkers);
      expect(transaction[9]).toBe(expectedSharedHistoricalWorkers);
      done();
    });
    statistics.handleAuxiliary(lookups, () => {});
  });

  test('Test statistics auxiliary updates [2]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const lookups = [
      null,
      null,
      { rows: [{}] },
      { rows: [{}] },
      { rows: [{}] },
      { rows: [
        { miner: 'miner1', current_work: 100 },
        { miner: 'miner2', current_work: 10 },
        { miner: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [{}] },
      { rows: [{
        timestamp: 1,
        blocks: 1,
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        miners: 1,
        stale: 0,
        type: 'auxiliary',
        valid: 100,
        work: 100,
        workers: 1,
      }]},
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        stale: 0,
        type: 'auxiliary',
        valid: 1,
        work: 1,
      }]},
      { rows: [{
        timestamp: 1,
        difficulty: 1,
        hashrate: 100,
        height: 1,
        type: 'auxiliary',
      }]},
      null,
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        solo: true,
        stale: 0,
        type: 'auxiliary',
        valid: 1,
        work: 1,
      }]},
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        solo: false,
        stale: 0,
        type: 'auxiliary',
        valid: 1,
        work: 1,
      }]},
      null];
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, hashrate, miners,
        type, workers)
      VALUES (
        1634742080841,
        0,
        0,
        'auxiliary',
        0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate,
        miners = EXCLUDED.miners,
        workers = EXCLUDED.workers;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, hashrate,
        type)
      VALUES (
        1634742080841,
        'miner1',
        1431655765.3333333,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedSoloWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES (
        1634742080841,
        'worker1',
        'worker1',
        0,
        true,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedSharedWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        hashrate, solo, type)
      VALUES (
        1634742080841,
        'worker1',
        'worker1',
        0,
        false,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        hashrate = EXCLUDED.hashrate;`;
    const expectedHistoricalMetadata = `
      INSERT INTO "Pool-Bitcoin".historical_metadata (
        timestamp, recent, blocks,
        efficiency, effort, hashrate,
        invalid, miners, stale,
        type, valid, work, workers)
      VALUES (
        1634742080841,
        1634742000000,
        1,
        100,
        100,
        100,
        0,
        1,
        0,
        'auxiliary',
        100,
        100,
        1)
      ON CONFLICT ON CONSTRAINT historical_metadata_recent
      DO NOTHING;`;
    const expectedHistoricalMiners = `
      INSERT INTO "Pool-Bitcoin".historical_miners (
        timestamp, recent, miner,
        efficiency, effort, hashrate,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        100,
        100,
        100,
        0,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_miners_recent
      DO NOTHING;`;
    const expectedHistoricalNetwork = `
      INSERT INTO "Pool-Bitcoin".historical_network (
        timestamp, recent, difficulty,
        hashrate, height, type)
      VALUES (
        1634742080841,
        1634742000000,
        1,
        100,
        1,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT historical_network_recent
      DO NOTHING;`;
    const expectedSoloHistoricalWorkers = `
      INSERT INTO "Pool-Bitcoin".historical_workers (
        timestamp, recent, miner,
        worker, efficiency, effort,
        hashrate, invalid, solo,
        stale, type, valid, work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        'worker1',
        100,
        100,
        100,
        0,
        true,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_workers_recent
      DO NOTHING;`;
    const expectedSharedHistoricalWorkers = `
      INSERT INTO "Pool-Bitcoin".historical_workers (
        timestamp, recent, miner,
        worker, efficiency, effort,
        hashrate, invalid, solo,
        stale, type, valid, work)
      VALUES (
        1634742080841,
        1634742000000,
        'miner1',
        'worker1',
        100,
        100,
        100,
        0,
        false,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT historical_workers_recent
      DO NOTHING;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(11);
      expect(transaction[1]).toBe(expectedMetadata);
      expect(transaction[2]).toBe(expectedMiners);
      expect(transaction[3]).toBe(expectedSoloWorkers);
      expect(transaction[4]).toBe(expectedSharedWorkers);
      expect(transaction[5]).toBe(expectedHistoricalMetadata);
      expect(transaction[6]).toBe(expectedHistoricalMiners);
      expect(transaction[7]).toBe(expectedHistoricalNetwork);
      expect(transaction[8]).toBe(expectedSoloHistoricalWorkers);
      expect(transaction[9]).toBe(expectedSharedHistoricalWorkers);
      done();
    });
    statistics.handleAuxiliary(lookups, () => {});
  });

  test('Test statistics auxiliary updates [3]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    const lookups = [
      null,
      null,
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      null,
      { rows: [] },
      { rows: [] },
      null,
      null,
      { rows: [] },
      { rows: [] },
      null];
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(2);
      done();
    });
    statistics.handleAuxiliary(lookups, () => {});
  });

  test('Test statistics submission handling [1]', (done) => {
    const lookups = [
      null,
      null,
      { rows: [{ count: 1 }] },
      { rows: [{ count: 1 }] },
      { rows: [{ count: 2 }] },
      { rows: [
        { miner: 'miner1', current_work: 100 },
        { miner: 'miner2', current_work: 10 },
        { miner: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [{ current_work: 100 }] },
      { rows: [{
        timestamp: 1,
        blocks: 1,
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        miners: 1,
        stale: 0,
        type: 'primary',
        valid: 100,
        work: 100,
        workers: 1,
      }]},
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        type: 'primary',
      }]},
      { rows: [{
        timestamp: 1,
        difficulty: 1,
        hashrate: 100,
        height: 1,
        type: 'primary',
      }]},
      null,
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        solo: true,
        type: 'primary',
      }]},
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        solo: false,
        type: 'primary',
      }]},
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    statistics.handleStatistics('primary', () => done());
  });

  test('Test statistics submission handling [2]', (done) => {
    const lookups = [
      null,
      null,
      { rows: [{ count: 1 }] },
      { rows: [{ count: 1 }] },
      { rows: [{ count: 2 }] },
      { rows: [
        { miner: 'miner1', current_work: 100 },
        { miner: 'miner2', current_work: 10 },
        { miner: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [{ current_work: 100 }] },
      { rows: [{
        timestamp: 1,
        blocks: 1,
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        miners: 1,
        stale: 0,
        type: 'primary',
        valid: 100,
        work: 100,
        workers: 1,
      }]},
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        type: 'primary',
      }]},
      { rows: [{
        timestamp: 1,
        difficulty: 1,
        hashrate: 100,
        height: 1,
        type: 'primary',
      }]},
      null,
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        solo: true,
        type: 'primary',
      }]},
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        solo: false,
        type: 'primary',
      }]},
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    statistics.handleStatistics('primary', () => done());
  });

  test('Test statistics submission handling [3]', (done) => {
    const lookups = [
      null,
      null,
      { rows: [{ count: 1 }] },
      { rows: [{ count: 1 }] },
      { rows: [{ count: 2 }] },
      { rows: [
        { miner: 'miner1', current_work: 100 },
        { miner: 'miner2', current_work: 10 },
        { miner: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [{ current_work: 100 }] },
      { rows: [{
        timestamp: 1,
        blocks: 1,
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        miners: 1,
        stale: 0,
        type: 'auxiliary',
        valid: 100,
        work: 100,
        workers: 1,
      }]},
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        type: 'auxiliary',
      }]},
      { rows: [{
        timestamp: 1,
        difficulty: 1,
        hashrate: 100,
        height: 1,
        type: 'auxiliary',
      }]},
      null,
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        solo: true,
        type: 'auxiliary',
      }]},
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        solo: false,
        type: 'auxiliary',
      }]},
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    statistics.handleStatistics('auxiliary', () => done());
  });

  test('Test statistics submission handling [4]', (done) => {
    const lookups = [
      null,
      null,
      { rows: [{ count: 1 }] },
      { rows: [{ count: 1 }] },
      { rows: [{ count: 2 }] },
      { rows: [
        { miner: 'miner1', current_work: 100 },
        { miner: 'miner2', current_work: 10 },
        { miner: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [
        { worker: 'miner1', current_work: 100 },
        { worker: 'miner2', current_work: 10 },
        { worker: 'miner3', current_work: 140 }]},
      { rows: [{ current_work: 100 }] },
      { rows: [{
        timestamp: 1,
        blocks: 1,
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        invalid: 0,
        miners: 1,
        stale: 0,
        type: 'auxiliary',
        valid: 100,
        work: 100,
        workers: 1,
      }]},
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        type: 'auxiliary',
      }]},
      { rows: [{
        timestamp: 1,
        difficulty: 1,
        hashrate: 100,
        height: 1,
        type: 'auxiliary',
      }]},
      null,
      null,
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        solo: true,
        type: 'auxiliary',
      }]},
      { rows: [{
        timestamp: 1,
        miner: 'miner1',
        worker: 'worker1',
        efficiency: 100,
        effort: 100,
        hashrate: 100,
        solo: false,
        type: 'auxiliary',
      }]},
      null];
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    statistics.handleStatistics('auxiliary', () => done());
  });

  test('Test statistics submission handling [5]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const template = { algorithms: { sha256d: { multiplier: 1 }}};
    const statistics = new Statistics(logger, client, configCopy, configMainCopy, template);
    statistics.handleStatistics('unknown', () => done());
  });
});
