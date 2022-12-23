const Commands = require('../../database/main/commands');
const Logger = require('../main/logger');
const MockDate = require('mockdate');
const Payments = require('../main/payments');
const config = require('../../configs/pools/example.js');
const configMain = require('../../configs/main/example.js');
const events = require('events');

////////////////////////////////////////////////////////////////////////////////

function mockClient(configMain, result) {
  const client = new events.EventEmitter();
  client.commands = new Commands(null, null, configMain);
  client.commands.executor = (commands, callback) => {
    client.emit('transaction', commands);
    callback(result);
  };
  return client;
}

////////////////////////////////////////////////////////////////////////////////

describe('Test payments functionality', () => {

  let configCopy, configMainCopy;
  beforeEach(() => {
    configCopy = JSON.parse(JSON.stringify(config));
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of payments', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    expect(typeof payments.handleCurrentCombined).toBe('function');
    expect(typeof payments.handleCurrentMiners).toBe('function');
  });

  test('Test payments database updates [1]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const balances = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const current = {
      'miner1': { immature: 10, generate: 100 },
      'miner2': { immature: 105, generate: 50 },
      'miner3': { immature: 20, generate: 100 }};
    const expected = { 'miner1': 200, 'miner2': 60, 'miner3': 250 };
    expect(payments.handleCurrentCombined(balances, current)).toStrictEqual(expected);
  });

  test('Test payments database updates [2]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const balances = { 'miner2': 10, 'miner3': 150 };
    const current = {
      'miner1': { immature: 10, generate: 100 },
      'miner2': { immature: 105, generate: 50 },
      'miner3': { immature: 20, generate: 100 }};
    const expected = { 'miner1': 100, 'miner2': 60, 'miner3': 250 };
    expect(payments.handleCurrentCombined(balances, current)).toStrictEqual(expected);
  });

  test('Test payments database updates [3]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const balances = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const amounts = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const expected = [
      { timestamp: 1634742080841, miner: 'miner1', balance: 100, paid: 100, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner2', balance: 10, paid: 10, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner3', balance: 150, paid: 150, type: 'primary' }];
    expect(payments.handleCurrentMiners(amounts, balances, 'primary')).toStrictEqual(expected);
  });

  test('Test payments database updates [4]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const balances = { 'miner2': 10, 'miner3': 150 };
    const amounts = { 'miner1': 100, 'miner2': 10, };
    const expected = [
      { timestamp: 1634742080841, miner: 'miner1', balance: 0, paid: 100, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner2', balance: 10, paid: 10, type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner3', balance: 150, paid: 0, type: 'primary' }];
    expect(payments.handleCurrentMiners(amounts, balances, 'primary')).toStrictEqual(expected);
  });

  test('Test payments database updates [5]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const blocks = [{
      timestamp: 1,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    }];
    const expected = [{
      timestamp: 1634742080841,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    }];
    expect(payments.handleHistoricalBlocks(blocks)).toStrictEqual(expected);
  });

  test('Test payments database updates [6]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const amounts = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const expected = [
      { timestamp: 1634742080841, miner: 'miner1', amount: 100, transaction: 'transaction1', type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner2', amount: 10, transaction: 'transaction1', type: 'primary' },
      { timestamp: 1634742080841, miner: 'miner3', amount: 150, transaction: 'transaction1', type: 'primary' }];
    expect(payments.handleHistoricalPayments(amounts, 'transaction1', 'primary')).toStrictEqual(expected);
  });

  test('Test payments database updates [7]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const miner1 = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const miner2 = { ...miner1, miner: 'miner2', worker: 'miner2' };
    const miner3 = { ...miner1, miner: 'miner3', worker: 'miner3' };
    const rounds = [[miner1, miner2, miner3], [miner1, miner2, miner3]];
    const expected = [
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner1', 'round': 'round1', 'solo': false, 'stale': 0, 'times': 200, 'timestamp': 1634742080841, 'type': 'primary', 'valid': 200, 'work': 200, 'worker': 'miner1'},
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner2', 'round': 'round1', 'solo': false, 'stale': 0, 'times': 200, 'timestamp': 1634742080841, 'type': 'primary', 'valid': 200, 'work': 200, 'worker': 'miner2'},
      {'identifier': 'master', 'invalid': 0, 'miner': 'miner3', 'round': 'round1', 'solo': false, 'stale': 0, 'times': 200, 'timestamp': 1634742080841, 'type': 'primary', 'valid': 200, 'work': 200, 'worker': 'miner3'}];
    expect(payments.handleHistoricalRounds(rounds)).toStrictEqual(expected);
  });

  test('Test payments database updates [8]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    expect(payments.handleHistoricalRounds([])).toStrictEqual([]);
  });

  test('Test payments database updates [9]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const amounts = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const expected = { timestamp: 1634742080841, amount: 260, transaction: 'transaction1', type: 'primary' };
    expect(payments.handleHistoricalTransactions(amounts, 'transaction1', 'primary')).toStrictEqual(expected);
  });

  test('Test payments miscellaneous updates', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const blocks = [
      { round: 'round1' }, { round: 'round2' }, { round: 'round3' },
      { round: 'round4' }, { round: 'round5' }, { round: 'round6' }];
    const expected = `
      DELETE FROM "Pool-Bitcoin".current_payments
      WHERE round IN ('round1', 'round2', 'round3', 'round4', 'round5', 'round6');`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(3);
      expect(transaction[1]).toBe(expected);
      done();
    });
    payments.handleFailures(blocks, () => {});
  });

  test('Test payments main updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    };
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const blocks = [
      { ...initialBlock, category: 'generate', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' },
      { ...initialBlock, category: 'generate', round: 'round3' },
      { ...initialBlock, category: 'generate', round: 'round4' },
      { ...initialBlock, category: 'generate', round: 'round5' },
      { ...initialBlock, category: 'generate', round: 'round6' }];
    const rounds = [
      [{ ...initialMiner, miner: 'miner1', worker: 'miner1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2' }],
      [{ ...initialMiner, miner: 'miner1', worker: 'miner1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2' }]];
    const balances = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const amounts = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const expectedGenerateBlocksDeletes = `
      DELETE FROM "Pool-Bitcoin".current_blocks
      WHERE round IN ('round1', 'round2', 'round3', 'round4', 'round5', 'round6');`;
    const expectedResetMiners = `
      UPDATE "Pool-Bitcoin".current_miners
      SET generate = 0 WHERE type = 'primary';`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, balance,
        paid, type)
      VALUES (
        1634742080841,
        'miner1',
        100,
        100,
        'primary'), (
        1634742080841,
        'miner2',
        10,
        10,
        'primary'), (
        1634742080841,
        'miner3',
        150,
        150,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        paid = "Pool-Bitcoin".current_miners.paid + EXCLUDED.paid;`;
    const expectedGenerateRoundsDeletes = `
      DELETE FROM "Pool-Bitcoin".current_rounds
      WHERE round IN ('round1', 'round2', 'round3', 'round4', 'round5', 'round6');`;
    const expectedGenerateBlocksUpdates = `
      INSERT INTO "Pool-Bitcoin".historical_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round1',
        false,
        'transaction1',
        'primary'), (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round2',
        false,
        'transaction1',
        'primary'), (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round3',
        false,
        'transaction1',
        'primary'), (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round4',
        false,
        'transaction1',
        'primary'), (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round5',
        false,
        'transaction1',
        'primary'), (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round6',
        false,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    const expectedPayments = `
      INSERT INTO "Pool-Bitcoin".historical_payments (
        timestamp, miner, amount,
        transaction, type)
      VALUES (
        1634742080841,
        'miner1',
        100,
        'transaction1',
        'primary'), (
        1634742080841,
        'miner2',
        10,
        'transaction1',
        'primary'), (
        1634742080841,
        'miner3',
        150,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    const expectedGenerateRoundsUpdates = `
      INSERT INTO "Pool-Bitcoin".historical_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        'miner1',
        'miner1',
        'master',
        0,
        'round1',
        false,
        0,
        200,
        'primary',
        200,
        200), (
        1634742080841,
        'miner2',
        'miner2',
        'master',
        0,
        'round1',
        false,
        0,
        400,
        'primary',
        400,
        400)
      ON CONFLICT DO NOTHING;`;
    const expectedTransactions = `
      INSERT INTO "Pool-Bitcoin".historical_transactions (
        timestamp, amount,
        transaction, type)
      VALUES (
        1634742080841,
        260,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(10);
      expect(transaction[1]).toBe(expectedGenerateBlocksDeletes);
      expect(transaction[2]).toBe(expectedResetMiners);
      expect(transaction[3]).toBe(expectedMiners);
      expect(transaction[4]).toBe(expectedGenerateRoundsDeletes);
      expect(transaction[5]).toBe(expectedGenerateBlocksUpdates);
      expect(transaction[6]).toBe(expectedPayments);
      expect(transaction[7]).toBe(expectedGenerateRoundsUpdates);
      expect(transaction[8]).toBe(expectedTransactions);
      done();
    });
    payments.handleUpdates(blocks, rounds, amounts, balances, 'transaction1', 'primary', () => {});
  });

  test('Test payments main updates [2]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const expectedResetMiners = `
      UPDATE "Pool-Bitcoin".current_miners
      SET generate = 0 WHERE type = 'primary';`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(3);
      expect(transaction[1]).toBe(expectedResetMiners);
      done();
    });
    payments.handleUpdates([], [], {}, {}, null, 'primary', () => {});
  });

  test('Test payments primary updates [1]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    const amounts = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const current = {
      'miner1': { miner: 'miner1', generate: 10, immature: 10 },
      'miner2': { miner: 'miner2', generate: 40, immature: 1000 },
      'miner3': { miner: 'miner3', generate: 100, immature: 100 }};
    payments.stratum = { stratum: {
      handlePrimaryRounds: (blocks, callback) => callback(null, blocks),
      handlePrimaryWorkers: (blocks, rounds, sending, callback) => callback(current),
      handlePrimaryBalances: (current, callback) => callback(null),
      handlePrimaryPayments: (current, callback) => callback(null, amounts, {}, 'transaction1'),
    }};
    let currentIdx = 0;
    const expectedGenerateBlocksDeletes = `
      DELETE FROM "Pool-Bitcoin".current_blocks
      WHERE round IN ('round1', 'round2');`;
    const expectedResetMiners = `
      UPDATE "Pool-Bitcoin".current_miners
      SET generate = 0 WHERE type = 'primary';`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, balance,
        paid, type)
      VALUES (
        1634742080841,
        'miner1',
        0,
        100,
        'primary'), (
        1634742080841,
        'miner2',
        0,
        10,
        'primary'), (
        1634742080841,
        'miner3',
        0,
        150,
        'primary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        paid = "Pool-Bitcoin".current_miners.paid + EXCLUDED.paid;`;
    const expectedGenerateRoundsDeletes = `
      DELETE FROM "Pool-Bitcoin".current_rounds
      WHERE round IN ('round1', 'round2');`;
    const expectedGenerateBlocksUpdates = `
      INSERT INTO "Pool-Bitcoin".historical_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'immature',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round1',
        false,
        'transaction1',
        'primary'), (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round2',
        false,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    const expectedPayments = `
      INSERT INTO "Pool-Bitcoin".historical_payments (
        timestamp, miner, amount,
        transaction, type)
      VALUES (
        1634742080841,
        'miner1',
        100,
        'transaction1',
        'primary'), (
        1634742080841,
        'miner2',
        10,
        'transaction1',
        'primary'), (
        1634742080841,
        'miner3',
        150,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    const expectedGenerateRoundsUpdates = `
      INSERT INTO "Pool-Bitcoin".historical_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        'miner1',
        'miner1',
        'master',
        0,
        'round1',
        false,
        0,
        100,
        'primary',
        100,
        100), (
        1634742080841,
        'miner2',
        'miner2',
        'master',
        0,
        'round1',
        false,
        0,
        200,
        'primary',
        200,
        200), (
        1634742080841,
        'miner1',
        'miner1',
        'master',
        0,
        'round2',
        false,
        0,
        100,
        'primary',
        100,
        100), (
        1634742080841,
        'miner2',
        'miner2',
        'master',
        0,
        'round2',
        false,
        0,
        200,
        'primary',
        200,
        200)
      ON CONFLICT DO NOTHING;`;
    const expectedTransactions = `
      INSERT INTO "Pool-Bitcoin".historical_transactions (
        timestamp, amount,
        transaction, type)
      VALUES (
        1634742080841,
        260,
        'transaction1',
        'primary')
      ON CONFLICT DO NOTHING;`;
    client.on('transaction', (transaction) => {
      if (currentIdx === 1) {
        expect(transaction.length).toBe(10);
        expect(transaction[1]).toBe(expectedGenerateBlocksDeletes);
        expect(transaction[2]).toBe(expectedResetMiners);
        expect(transaction[3]).toBe(expectedMiners);
        expect(transaction[4]).toBe(expectedGenerateRoundsDeletes);
        expect(transaction[5]).toBe(expectedGenerateBlocksUpdates);
        expect(transaction[6]).toBe(expectedPayments);
        expect(transaction[7]).toBe(expectedGenerateRoundsUpdates);
        expect(transaction[8]).toBe(expectedTransactions);
      } else currentIdx += 1;
    });
    payments.handlePrimary(blocks, {}, () => done());
  });

  test('Test payments primary updates [2]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    const amounts = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const current = {
      'miner1': { miner: 'miner1', generate: 10, immature: 10 },
      'miner2': { miner: 'miner2', generate: 40, immature: 1000 },
      'miner3': { miner: 'miner3', generate: 100, immature: 100 }};
    payments.stratum = { stratum: {
      handlePrimaryRounds: (blocks, callback) => callback(true, blocks),
      handlePrimaryWorkers: (blocks, rounds, sending, callback) => callback(current),
      handlePrimaryBalances: (current, callback) => callback(null),
      handlePrimaryPayments: (current, callback) => callback(null, amounts, {}, 'transaction1'),
    }};
    let currentIdx = 0;
    const expected = `
      DELETE FROM "Pool-Bitcoin".current_payments
      WHERE round IN ('round1', 'round2');`;
    client.on('transaction', (transaction) => {
      if (currentIdx === 1) {
        expect(transaction.length).toBe(3);
        expect(transaction[1]).toBe(expected);
      } else currentIdx += 1;
    });
    payments.handlePrimary(blocks, {}, () => done());
  });

  test('Test payments primary updates [3]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    const amounts = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const current = {
      'miner1': { miner: 'miner1', generate: 10, immature: 10 },
      'miner2': { miner: 'miner2', generate: 40, immature: 1000 },
      'miner3': { miner: 'miner3', generate: 100, immature: 100 }};
    payments.stratum = { stratum: {
      handlePrimaryRounds: (blocks, callback) => callback(null, blocks),
      handlePrimaryWorkers: (blocks, rounds, sending, callback) => callback(current),
      handlePrimaryBalances: (current, callback) => callback(true),
      handlePrimaryPayments: (current, callback) => callback(null, amounts, {}, 'transaction1'),
    }};
    let currentIdx = 0;
    const expected = `
      DELETE FROM "Pool-Bitcoin".current_payments
      WHERE round IN ('round1', 'round2');`;
    client.on('transaction', (transaction) => {
      if (currentIdx === 1) {
        expect(transaction.length).toBe(3);
        expect(transaction[1]).toBe(expected);
      } else currentIdx += 1;
    });
    payments.handlePrimary(blocks, {}, () => done());
  });

  test('Test payments primary updates [4]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'primary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    const current = {
      'miner1': { miner: 'miner1', generate: 10, immature: 10 },
      'miner2': { miner: 'miner2', generate: 40, immature: 1000 },
      'miner3': { miner: 'miner3', generate: 100, immature: 100 }};
    payments.stratum = { stratum: {
      handlePrimaryRounds: (blocks, callback) => callback(null, blocks),
      handlePrimaryWorkers: (blocks, rounds, sending, callback) => callback(current),
      handlePrimaryBalances: (current, callback) => callback(null),
      handlePrimaryPayments: (current, callback) => callback(true, {}, {}, null),
    }};
    let currentIdx = 0;
    const expected = `
      DELETE FROM "Pool-Bitcoin".current_payments
      WHERE round IN ('round1', 'round2');`;
    client.on('transaction', (transaction) => {
      if (currentIdx === 1) {
        expect(transaction.length).toBe(3);
        expect(transaction[1]).toBe(expected);
      } else currentIdx += 1;
    });
    payments.handlePrimary(blocks, {}, () => done());
  });

  test('Test payments auxiliary updates [1]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'auxiliary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      submitted: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'auxiliary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    const amounts = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const current = {
      'miner1': { miner: 'miner1', generate: 10, immature: 10 },
      'miner2': { miner: 'miner2', generate: 40, immature: 1000 },
      'miner3': { miner: 'miner3', generate: 100, immature: 100 }};
    payments.stratum = { stratum: {
      handleAuxiliaryRounds: (blocks, callback) => callback(null, blocks),
      handleAuxiliaryWorkers: (blocks, rounds, sending, callback) => callback(current),
      handleAuxiliaryBalances: (current, callback) => callback(null),
      handleAuxiliaryPayments: (current, callback) => callback(null, amounts, {}, 'transaction1'),
    }};
    let currentIdx = 0;
    const expectedGenerateBlocksDeletes = `
      DELETE FROM "Pool-Bitcoin".current_blocks
      WHERE round IN ('round1', 'round2');`;
    const expectedResetMiners = `
      UPDATE "Pool-Bitcoin".current_miners
      SET generate = 0 WHERE type = 'auxiliary';`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, balance,
        paid, type)
      VALUES (
        1634742080841,
        'miner1',
        0,
        100,
        'auxiliary'), (
        1634742080841,
        'miner2',
        0,
        10,
        'auxiliary'), (
        1634742080841,
        'miner3',
        0,
        150,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        balance = EXCLUDED.balance,
        paid = "Pool-Bitcoin".current_miners.paid + EXCLUDED.paid;`;
    const expectedGenerateRoundsDeletes = `
      DELETE FROM "Pool-Bitcoin".current_rounds
      WHERE round IN ('round1', 'round2');`;
    const expectedGenerateBlocksUpdates = `
      INSERT INTO "Pool-Bitcoin".historical_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'immature',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round1',
        false,
        'transaction1',
        'auxiliary'), (
        1634742080841,
        1,
        'miner1',
        'miner1',
        'generate',
        -1,
        150,
        'hash',
        1,
        'master',
        66.67,
        0,
        'round2',
        false,
        'transaction1',
        'auxiliary')
      ON CONFLICT DO NOTHING;`;
    const expectedPayments = `
      INSERT INTO "Pool-Bitcoin".historical_payments (
        timestamp, miner, amount,
        transaction, type)
      VALUES (
        1634742080841,
        'miner1',
        100,
        'transaction1',
        'auxiliary'), (
        1634742080841,
        'miner2',
        10,
        'transaction1',
        'auxiliary'), (
        1634742080841,
        'miner3',
        150,
        'transaction1',
        'auxiliary')
      ON CONFLICT DO NOTHING;`;
    const expectedGenerateRoundsUpdates = `
      INSERT INTO "Pool-Bitcoin".historical_rounds (
        timestamp, miner, worker,
        identifier, invalid, round,
        solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        'miner1',
        'miner1',
        'master',
        0,
        'round1',
        false,
        0,
        100,
        'auxiliary',
        100,
        100), (
        1634742080841,
        'miner2',
        'miner2',
        'master',
        0,
        'round1',
        false,
        0,
        200,
        'auxiliary',
        200,
        200), (
        1634742080841,
        'miner1',
        'miner1',
        'master',
        0,
        'round2',
        false,
        0,
        100,
        'auxiliary',
        100,
        100), (
        1634742080841,
        'miner2',
        'miner2',
        'master',
        0,
        'round2',
        false,
        0,
        200,
        'auxiliary',
        200,
        200)
      ON CONFLICT DO NOTHING;`;
    const expectedTransactions = `
      INSERT INTO "Pool-Bitcoin".historical_transactions (
        timestamp, amount,
        transaction, type)
      VALUES (
        1634742080841,
        260,
        'transaction1',
        'auxiliary')
      ON CONFLICT DO NOTHING;`;
    client.on('transaction', (transaction) => {
      if (currentIdx === 1) {
        expect(transaction.length).toBe(10);
        expect(transaction[1]).toBe(expectedGenerateBlocksDeletes);
        expect(transaction[2]).toBe(expectedResetMiners);
        expect(transaction[3]).toBe(expectedMiners);
        expect(transaction[4]).toBe(expectedGenerateRoundsDeletes);
        expect(transaction[5]).toBe(expectedGenerateBlocksUpdates);
        expect(transaction[6]).toBe(expectedPayments);
        expect(transaction[7]).toBe(expectedGenerateRoundsUpdates);
        expect(transaction[8]).toBe(expectedTransactions);
      } else currentIdx += 1;
    });
    payments.handleAuxiliary(blocks, {}, () => done());
  });

  test('Test payments auxiliary updates [2]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'auxiliary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'auxiliary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    const amounts = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const current = {
      'miner1': { miner: 'miner1', generate: 10, immature: 10 },
      'miner2': { miner: 'miner2', generate: 40, immature: 1000 },
      'miner3': { miner: 'miner3', generate: 100, immature: 100 }};
    payments.stratum = { stratum: {
      handleAuxiliaryRounds: (blocks, callback) => callback(true, blocks),
      handleAuxiliaryWorkers: (blocks, rounds, sending, callback) => callback(current),
      handleAuxiliaryBalances: (current, callback) => callback(null),
      handleAuxiliaryPayments: (current, callback) => callback(null, amounts, {}, 'transaction1'),
    }};
    let currentIdx = 0;
    const expected = `
      DELETE FROM "Pool-Bitcoin".current_payments
      WHERE round IN ('round1', 'round2');`;
    client.on('transaction', (transaction) => {
      if (currentIdx === 1) {
        expect(transaction.length).toBe(3);
        expect(transaction[1]).toBe(expected);
      } else currentIdx += 1;
    });
    payments.handleAuxiliary(blocks, {}, () => done());
  });

  test('Test payments auxiliary updates [3]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'auxiliary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'auxiliary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    const amounts = { 'miner1': 100, 'miner2': 10, 'miner3': 150 };
    const current = {
      'miner1': { miner: 'miner1', generate: 10, immature: 10 },
      'miner2': { miner: 'miner2', generate: 40, immature: 1000 },
      'miner3': { miner: 'miner3', generate: 100, immature: 100 }};
    payments.stratum = { stratum: {
      handleAuxiliaryRounds: (blocks, callback) => callback(null, blocks),
      handleAuxiliaryWorkers: (blocks, rounds, sending, callback) => callback(current),
      handleAuxiliaryBalances: (current, callback) => callback(true),
      handleAuxiliaryPayments: (current, callback) => callback(null, amounts, {}, 'transaction1'),
    }};
    let currentIdx = 0;
    const expected = `
      DELETE FROM "Pool-Bitcoin".current_payments
      WHERE round IN ('round1', 'round2');`;
    client.on('transaction', (transaction) => {
      if (currentIdx === 1) {
        expect(transaction.length).toBe(3);
        expect(transaction[1]).toBe(expected);
      } else currentIdx += 1;
    });
    payments.handleAuxiliary(blocks, {}, () => done());
  });

  test('Test payments auxiliary updates [4]', (done) => {
    const initialMiner = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      identifier: 'master',
      invalid: 0,
      round: 'round1',
      solo: false,
      stale: 0,
      times: 100,
      type: 'auxiliary',
      valid: 100,
      work: 100,
    };
    const lookups = [
      null,
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round1' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round1' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round1' }]},
      { rows: [{ ...initialMiner, miner: 'miner1', worker: 'miner1', round: 'round2' },
        { ...initialMiner, miner: 'miner2', worker: 'miner2', round: 'round2' },
        { ...initialMiner, miner: 'miner3', worker: 'miner2', round: 'round2' }]},
      null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'auxiliary',
    };
    const blocks = [
      { ...initialBlock, category: 'immature', round: 'round1' },
      { ...initialBlock, category: 'generate', round: 'round2' }];
    const current = {
      'miner1': { miner: 'miner1', generate: 10, immature: 10 },
      'miner2': { miner: 'miner2', generate: 40, immature: 1000 },
      'miner3': { miner: 'miner3', generate: 100, immature: 100 }};
    payments.stratum = { stratum: {
      handleAuxiliaryRounds: (blocks, callback) => callback(null, blocks),
      handleAuxiliaryWorkers: (blocks, rounds, sending, callback) => callback(current),
      handleAuxiliaryBalances: (current, callback) => callback(null),
      handleAuxiliaryPayments: (current, callback) => callback(true, {}, {}, null),
    }};
    let currentIdx = 0;
    const expected = `
      DELETE FROM "Pool-Bitcoin".current_payments
      WHERE round IN ('round1', 'round2');`;
    client.on('transaction', (transaction) => {
      if (currentIdx === 1) {
        expect(transaction.length).toBe(3);
        expect(transaction[1]).toBe(expected);
      } else currentIdx += 1;
    });
    payments.handleAuxiliary(blocks, {}, () => done());
  });

  test('Test payments rounds updates [1]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'auxiliary',
    };
    const initial = [
      null,
      { rows: [
        { ...initialBlock, category: 'immature', round: 'round1' },
        { ...initialBlock, category: 'generate', round: 'round2' }]},
      { rows: [] },
      null];
    payments.handleRounds(initial, 'primary', () => done());
  });

  test('Test payments rounds updates [2]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initial = [null, { rows: [] }, { rows: [] }, null];
    payments.handleRounds(initial, 'primary', () => done());
  });

  test('Test payments rounds updates [3]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initialBlock = {
      timestamp: 1,
      miner: 'miner1',
      worker: 'miner1',
      category: 'pending',
      confirmations: -1,
      difficulty: 150,
      hash: 'hash',
      height: 1,
      identifier: 'master',
      luck: 66.67,
      reward: 0,
      round: 'round',
      solo: false,
      transaction: 'transaction1',
      type: 'auxiliary',
    };
    const initial = [
      null,
      { rows: [
        { ...initialBlock, category: 'immature', round: 'round1' },
        { ...initialBlock, category: 'generate', round: 'round2' }]},
      { rows: [] },
      null];
    payments.handleRounds(initial, 'auxiliary', () => done());
  });

  test('Test payments rounds updates [4]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initial = [null, { rows: [] }, { rows: [] }, null];
    payments.handleRounds(initial, 'auxiliary', () => done());
  });

  test('Test payments rounds updates [5]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    const initial = [null, { rows: [] }, { rows: [] }, null];
    payments.handleRounds(initial, 'unknown', () => done());
  });

  test('Test payments submission handling', (done) => {
    MockDate.set(1634742080841);
    const lookups = [null, { rows: [] }, { rows: [] }, null];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const payments = new Payments(logger, client, configCopy, configMainCopy);
    payments.handlePayments('primary', () => done());
  });
});
