const LocalShares = require('../../../main/worker/local/shares');
const Logger = require('../../../../server/main/logger');
const configMain = require('../../../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test database shares functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of shares commands', () => {
    const shares = new LocalShares(logger, configMainCopy);
    expect(typeof shares.configMain).toBe('object');
    expect(typeof shares.selectLocalSharesMain).toBe('function');
    expect(typeof shares.insertLocalSharesMain).toBe('function');
  });

  test('Test query handling [1]', () => {
    const shares = new LocalShares(logger, configMainCopy);
    expect(shares.handleStrings({ test: 'test' }, 'test')).toBe(' = \'test\'');
    expect(shares.handleStrings({ miner: 'miner1' }, 'miner')).toBe(' = \'miner1\'');
  });

  test('Test query handling [2]', () => {
    const shares = new LocalShares(logger, configMainCopy);
    expect(shares.handleNumbers({ test: '100' }, 'test')).toBe(' = 100');
    expect(shares.handleNumbers({ timestamp: 'lt100' }, 'timestamp')).toBe(' < 100');
    expect(shares.handleNumbers({ timestamp: 'le100' }, 'timestamp')).toBe(' <= 100');
    expect(shares.handleNumbers({ timestamp: 'gt100' }, 'timestamp')).toBe(' > 100');
    expect(shares.handleNumbers({ timestamp: 'ge100' }, 'timestamp')).toBe(' >= 100');
    expect(shares.handleNumbers({ timestamp: 'ne100' }, 'timestamp')).toBe(' != 100');
  });

  test('Test query handling [3]', () => {
    const shares = new LocalShares(logger, configMainCopy);
    expect(shares.handleSpecial({ limit: '100' }, '')).toBe(' LIMIT 100');
    expect(shares.handleSpecial({ offset: '1' }, '')).toBe(' OFFSET 1');
    expect(shares.handleSpecial({ order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC');
    expect(shares.handleSpecial({ direction: 'ascending' }, '')).toBe(' ORDER BY id ASC');
    expect(shares.handleSpecial({ limit: '100', offset: '1' }, '')).toBe(' LIMIT 100 OFFSET 1');
    expect(shares.handleSpecial({ limit: '100', offset: '1', order: 'parameter' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
    expect(shares.handleSpecial({ limit: '100', offset: '1', order: 'parameter', direction: 'descending' }, '')).toBe(' ORDER BY parameter DESC LIMIT 100 OFFSET 1');
  });

  test('Test shares command handling [1]', () => {
    const shares = new LocalShares(logger, configMainCopy);
    const parameters = { type: 'primary' };
    const response = shares.selectLocalSharesMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".local_shares WHERE type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test shares command handling [2]', () => {
    const shares = new LocalShares(logger, configMainCopy);
    const parameters = { uuid: 'uuid1', type: 'primary' };
    const response = shares.selectLocalSharesMain('Pool-Main', parameters);
    const expected = 'SELECT * FROM "Pool-Main".local_shares WHERE uuid = \'uuid1\' AND type = \'primary\';';
    expect(response).toBe(expected);
  });

  test('Test shares command handling [3]', () => {
    const shares = new LocalShares(logger, configMainCopy);
    const updates = {
      error: 'error1',
      uuid: 'uuid',
      timestamp: 1,
      submitted: 1,
      ip: '1.1.1.1',
      port: 1000,
      addrprimary: 'primary',
      addrauxiliary: 'auxiliary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      blockvalid: true,
      blocktype: 'primary',
      clientdiff: 1,
      hash: 'hash1',
      height: 1,
      identifier: 'master',
      reward: 1000,
      sharediff: 1,
      sharevalid: true,
      transaction: 'transaction1',
    };
    const response = shares.insertLocalSharesMain('Pool-Main', [updates]);
    const expected = `
      INSERT INTO "Pool-Main".local_shares (
        error, uuid, timestamp,
        submitted, ip, port, addrprimary,
        addrauxiliary, blockdiffprimary,
        blockdiffauxiliary, blockvalid,
        blocktype, clientdiff, hash, height,
        identifier, reward, sharediff,
        sharevalid, transaction)
      VALUES (
        'error1',
        'uuid',
        1,
        1,
        '1.1.1.1',
        '1000',
        'primary',
        'auxiliary',
        1,
        1,
        true,
        'primary',
        1,
        'hash1',
        1,
        'master',
        1000,
        1,
        true,
        'transaction1')
      ON CONFLICT ON CONSTRAINT local_shares_unique
      DO NOTHING;`;
    expect(response).toBe(expected);
  });

  test('Test shares command handling [4]', () => {
    const shares = new LocalShares(logger, configMainCopy);
    const updates = {
      error: 'error1',
      uuid: 'uuid',
      timestamp: 1,
      submitted: 1,
      ip: '1.1.1.1',
      port: 1000,
      addrprimary: 'primary',
      addrauxiliary: 'auxiliary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      blockvalid: true,
      blocktype: 'primary',
      clientdiff: 1,
      hash: 'hash1',
      height: 1,
      identifier: 'master',
      reward: 1000,
      sharediff: 1,
      sharevalid: true,
      transaction: 'transaction1',
    };
    const response = shares.insertLocalSharesMain('Pool-Main', [updates, updates]);
    const expected = `
      INSERT INTO "Pool-Main".local_shares (
        error, uuid, timestamp,
        submitted, ip, port, addrprimary,
        addrauxiliary, blockdiffprimary,
        blockdiffauxiliary, blockvalid,
        blocktype, clientdiff, hash, height,
        identifier, reward, sharediff,
        sharevalid, transaction)
      VALUES (
        'error1',
        'uuid',
        1,
        1,
        '1.1.1.1',
        '1000',
        'primary',
        'auxiliary',
        1,
        1,
        true,
        'primary',
        1,
        'hash1',
        1,
        'master',
        1000,
        1,
        true,
        'transaction1'), (
        'error1',
        'uuid',
        1,
        1,
        '1.1.1.1',
        '1000',
        'primary',
        'auxiliary',
        1,
        1,
        true,
        'primary',
        1,
        'hash1',
        1,
        'master',
        1000,
        1,
        true,
        'transaction1')
      ON CONFLICT ON CONSTRAINT local_shares_unique
      DO NOTHING;`;
    expect(response).toBe(expected);
  });

  test('Test shares command handling [5]', () => {
    const shares = new LocalShares(logger, configMainCopy);
    const response = shares.deleteLocalSharesMain('Pool-Main', ['round1']);
    const expected = `
      DELETE FROM "Pool-Main".local_shares
      WHERE uuid IN (round1);`;
    expect(response).toBe(expected);
  });
});
