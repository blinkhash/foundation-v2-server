const Commands = require('../../database/main/worker/commands');
const Logger = require('../main/logger');
const MockDate = require('mockdate');
const Shares = require('../main/shares');
const config = require('../../configs/pools/example.js');
const configMain = require('../../configs/main/example.js');
const events = require('events');

// Mock UUID Events
jest.mock('uuid', () => ({ v4: () => '123456789' }));

////////////////////////////////////////////////////////////////////////////////

function mockClient(configMain, result) {
  const client = new events.EventEmitter();
  client.worker = { commands: new Commands(null, null, configMain) };
  client.worker.commands.executor = (commands, callback) => {
    client.emit('transaction', commands);
    callback(result);
  };
  return client;
}

////////////////////////////////////////////////////////////////////////////////

describe('Test shares functionality', () => {

  let configCopy, configMainCopy;
  beforeEach(() => {
    configCopy = JSON.parse(JSON.stringify(config));
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of shares', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    expect(typeof shares.handleLocalShares).toBe('function');
    expect(typeof shares.handleShares).toBe('function');
  });

  test('Test shares database updates [1]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      ip: '0.0.0.0',
      port: '3001',
      addrPrimary: 'primary',
      addrAuxiliary: 'auxiliary',
      blockDiffPrimary: 1,
      blockDiffAuxiliary: 1,
      blockType: 'share',
      difficulty: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      shareDiff: 1,
      submitTime: 1,
      transaction: 'transaction1'
    };
    const expected = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3001,
      addrprimary: 'primary',
      addrauxiliary: 'auxiliary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      blockvalid: true,
      blocktype: 'share',
      clientdiff: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      sharediff: 1,
      sharevalid: true,
      transaction: 'transaction1'
    };
    expect(shares.handleLocalShares(shareData, true, true)).toStrictEqual(expected);
  });

  test('Test shares database updates [2]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      error: 'error1',
      ip: '0.0.0.0',
      port: '3001',
      addrPrimary: 'primary',
      blockDiffPrimary: 1,
      blockType: 'share',
      difficulty: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      shareDiff: 1,
    };
    const expected = {
      error: 'error1',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1634742080841,
      ip: '0.0.0.0',
      port: 3001,
      addrprimary: 'primary',
      addrauxiliary: '',
      blockdiffprimary: 1,
      blockdiffauxiliary: -1,
      blockvalid: true,
      blocktype: 'share',
      clientdiff: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      sharediff: 1,
      sharevalid: true,
      transaction: ''
    };
    expect(shares.handleLocalShares(shareData, true, true)).toStrictEqual(expected);
  });

  test('Test shares main updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      ip: '0.0.0.0',
      port: '3001',
      addrPrimary: 'primary',
      addrAuxiliary: 'auxiliary',
      blockDiffPrimary: 1,
      blockDiffAuxiliary: 1,
      blockType: 'share',
      difficulty: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      shareDiff: 1,
      submitTime: 1,
      transaction: 'transaction1'
    };
    const expectedShares = `
      INSERT INTO "Pool-Bitcoin".local_shares (
        error, uuid, timestamp,
        submitted, ip, port, addrprimary,
        addrauxiliary, blockdiffprimary,
        blockdiffauxiliary, blockvalid,
        blocktype, clientdiff, hash, height,
        identifier, reward, sharediff,
        sharevalid, transaction)
      VALUES (
        '',
        '123456789',
        1634742080841,
        1,
        '0.0.0.0',
        '3001',
        'primary',
        'auxiliary',
        1,
        1,
        true,
        'share',
        1,
        'hash1',
        1,
        '',
        1,
        1,
        true,
        'transaction1')
      ON CONFLICT ON CONSTRAINT local_shares_unique
      DO NOTHING;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(3);
      expect(transaction[1]).toBe(expectedShares);
      done();
    });
    shares.handleShares(shareData, true, true, () => {});
  });

  test('Test shares submission handling [1]', (done) => {
    MockDate.set(1634742080841);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const client = mockClient(configMainCopy);
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      ip: '0.0.0.0',
      port: '3001',
      addrPrimary: 'primary',
      addrAuxiliary: 'auxiliary',
      blockDiffPrimary: 1,
      blockDiffAuxiliary: 1,
      blockType: 'share',
      difficulty: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      shareDiff: 1,
      submitTime: 1,
      transaction: 'transaction1'
    };
    shares.handleSubmissions(shareData, true, true, () => {
      expect(consoleSpy).toHaveBeenCalled();
      done();
    });
  });

  test('Test shares submission handling [2]', (done) => {
    MockDate.set(1634742080841);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const client = mockClient(configMainCopy);
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      error: 'job not found',
      ip: '0.0.0.0',
      port: '3001',
      addrPrimary: 'primary',
      addrAuxiliary: 'auxiliary',
      blockDiffPrimary: 1,
      blockDiffAuxiliary: 1,
      blockType: 'share',
      difficulty: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      shareDiff: 1,
      submitTime: 1,
      transaction: 'transaction1'
    };
    shares.handleSubmissions(shareData, false, true, () => {
      expect(consoleSpy).toHaveBeenCalled();
      done();
    });
  });

  test('Test shares submission handling [3]', (done) => {
    MockDate.set(1634742080841);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const client = mockClient(configMainCopy);
    const logger = new Logger(configMainCopy);
    const shares = new Shares(logger, client, configCopy, configMainCopy);
    const shareData = {
      error: 'error1',
      ip: '0.0.0.0',
      port: '3001',
      addrPrimary: 'primary',
      addrAuxiliary: 'auxiliary',
      blockDiffPrimary: 1,
      blockDiffAuxiliary: 1,
      blockType: 'share',
      difficulty: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      shareDiff: 1,
      submitTime: 1,
      transaction: 'transaction1'
    };
    shares.handleSubmissions(shareData, true, true, () => {
      expect(consoleSpy).toHaveBeenCalled();
      done();
    });
  });
});
