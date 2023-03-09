const CommandsMaster = require('../../database/main/master/commands');
const CommandsWorker = require('../../database/main/worker/commands');
const Logger = require('../main/logger');
const MockDate = require('mockdate');
const Rounds = require('../main/rounds');
const config = require('../../configs/pools/example.js');
const configMain = require('../../configs/main/example.js');
const events = require('events');

// Mock UUID Events
jest.mock('uuid', () => ({ v4: () => '123456789' }));

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

describe('Test rounds functionality', () => {

  let configCopy, configMainCopy;
  beforeEach(() => {
    configCopy = JSON.parse(JSON.stringify(config));
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of rounds', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    expect(typeof rounds.handleEfficiency).toBe('function');
    expect(typeof rounds.handleEffort).toBe('function');
  });

  test('Test rounds database updates [1]', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    expect(rounds.handleEfficiency({ valid: 1, invalid: 0, stale: 0 }, 'valid')).toBe(100);
    expect(rounds.handleEfficiency({ valid: 0, invalid: 1, stale: 0 }, 'valid')).toBe(50);
    expect(rounds.handleEfficiency({ valid: 1, invalid: 1, stale: 0 }, 'valid')).toBe(66.67);
    expect(rounds.handleEfficiency({ valid: 1, invalid: 0, stale: 1 }, 'valid')).toBe(66.67);
    expect(rounds.handleEfficiency({}, 'valid')).toBe(100);
    expect(rounds.handleEfficiency({}, 'invalid')).toBe(0);
  });

  test('Test rounds database updates [2]', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    expect(rounds.handleEffort({ clientdiff: 10 }, 100, 100, 'valid')).toBe(110);
    expect(rounds.handleEffort({ clientdiff: 10 }, 100, 100, 'invalid')).toBe(100);
    expect(rounds.handleEffort({}, 100, 100, 'valid')).toBe(100);
    expect(rounds.handleEffort({}, 100, 0, 'invalid')).toBe(0);
  });

  test('Test rounds database updates [3]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    expect(rounds.handleTimes({ submitted: '1634742080841', times: 0 }, 1634742290841)).toBe(210);
    expect(rounds.handleTimes({ submitted: '1634742080841', times: 145 }, 1634743180841)).toBe(145);
    expect(rounds.handleTimes({ submitted: '1634742080841', times: 145 }, 1634742830841)).toBe(895);
    expect(rounds.handleTimes({ submitted: '1634742080841', times: 145 }, 1634742370841)).toBe(435);
    expect(rounds.handleTimes({ times: 145 }, 1634742530841)).toBe(595);
  });

  test('Test rounds database updates [4]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const shares = [{ blocktype: 'share' }, { blocktype: 'share' }, { blocktype: 'share' }];
    const expected = [[{ blocktype: 'share' }, { blocktype: 'share' }, { blocktype: 'share' }]];
    expect(rounds.processSegments(shares)).toStrictEqual(expected);
  });

  test('Test rounds database updates [5]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const shares = [{ blocktype: 'primary' }, { blocktype: 'share' }, { blocktype: 'share' }];
    const expected = [[{ blocktype: 'primary' }], [{ blocktype: 'share' }, { blocktype: 'share' }]];
    expect(rounds.processSegments(shares)).toStrictEqual(expected);
  });

  test('Test rounds database updates [6]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const shares = [{ blocktype: 'share' }, { blocktype: 'primary' }, { blocktype: 'share' }];
    const expected = [[{ blocktype: 'share' }], [{ blocktype: 'primary' }], [{ blocktype: 'share' }]];
    expect(rounds.processSegments(shares)).toStrictEqual(expected);
  });

  test('Test rounds database updates [7]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const shares = [{ blocktype: 'share' }, { blocktype: 'share' }, { blocktype: 'primary' }];
    const expected = [[{ blocktype: 'share' }, { blocktype: 'share' }], [{ blocktype: 'primary' }]];
    expect(rounds.processSegments(shares)).toStrictEqual(expected);
  });

  test('Test rounds database updates [8]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const round = [{ miner: 'address1' }, { miner: 'address2' }];
    const expected = { 'address1': { miner: 'address1' }, 'address2': { miner: 'address2' }};
    expect(rounds.handleMinersLookups(round)).toStrictEqual(expected);
  });

  test('Test rounds database updates [9]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const round = [{ worker: 'address1' }, { worker: 'address2' }];
    const expected = { 'address1': { worker: 'address1' }, 'address2': { worker: 'address2' }};
    expect(rounds.handleWorkersLookups(round)).toStrictEqual(expected);
  });

  test('Test rounds database updates [10]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const metadata = { work: 0 };
    const round = { work: 0 };
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
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
    const expected = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      category: 'pending',
      confirmations: -1,
      difficulty: 1,
      hash: 'hash1',
      height: 1,
      identifier: 'master',
      luck: 100,
      reward: 0,
      round: '123456789',
      solo: false,
      transaction: 'transaction1',
      type: 'primary',
    };
    expect(rounds.handleCurrentBlocks(metadata, round, share, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [11]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const metadata = { work: 0 };
    const round = { work: 0 };
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: null,
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
    const expected = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      miner: '',
      worker: null,
      category: 'pending',
      confirmations: -1,
      difficulty: 1,
      hash: 'hash1',
      height: 1,
      identifier: 'master',
      luck: 100,
      reward: 0,
      round: '123456789',
      solo: true,
      transaction: 'transaction1',
      type: 'auxiliary',
    };
    expect(rounds.handleCurrentBlocks(metadata, round, share, 'valid', true, 'auxiliary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [12]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = { clientdiff: 1, addrprimary: 'primary', addrauxiliary: 'primary', identifier: '' };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      share: 'valid',
      solo: false,
      type: 'primary',
      work: 1,
    };
    expect(rounds.handleCurrentHashrate(share, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [13]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = { clientdiff: 1, addrprimary: 'primary', addrauxiliary: null, identifier: '' };
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      worker: null,
      identifier: 'master',
      share: 'invalid',
      solo: false,
      type: 'auxiliary',
      work: 0,
    };
    expect(rounds.handleCurrentHashrate(share, 'invalid', false, 'auxiliary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [14]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const initial = { work: 1 };
    const updates = { work: 1 };
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1 };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 100,
      effort: 300,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 2,
    };
    expect(rounds.handleCurrentMetadata(initial, updates, share, 'valid', 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [15]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const initial = { work: 1 };
    const updates = { work: 1 };
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1 };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 0,
      effort: 200,
      invalid: 1,
      stale: 0,
      type: 'primary',
      valid: 0,
      work: 1,
    };
    expect(rounds.handleCurrentMetadata(initial, updates, share, 'invalid', 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [16]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const initial = { work: 1 };
    const updates = { work: 1 };
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1 };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 0,
      effort: 200,
      invalid: 0,
      stale: 1,
      type: 'primary',
      valid: 0,
      work: 1,
    };
    expect(rounds.handleCurrentMetadata(initial, updates, share, 'stale', 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [17]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1 };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 100,
      effort: 100,
      invalid: 0,
      stale: 0,
      type: 'auxiliary',
      valid: 1,
      work: 1,
    };
    expect(rounds.handleCurrentMetadata({}, {}, share, 'valid', 'auxiliary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [18]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1, addrprimary: 'primary', addrauxiliary: 'primary' };
    const initial = { work: 1 };
    const updates = { work: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      efficiency: 100,
      effort: 300,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 2,
    };
    expect(rounds.handleCurrentMiners(initial, updates, share, 'valid', 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [19]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1, addrprimary: 'primary', addrauxiliary: 'primary' };
    const initial = { work: 1 };
    const updates = { work: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      efficiency: 0,
      effort: 200,
      invalid: 1,
      stale: 0,
      type: 'primary',
      valid: 0,
      work: 1,
    };
    expect(rounds.handleCurrentMiners(initial, updates, share, 'invalid', 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [20]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1, addrprimary: 'primary', addrauxiliary: 'primary' };
    const initial = { work: 1 };
    const updates = { work: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      efficiency: 0,
      effort: 200,
      invalid: 0,
      stale: 1,
      type: 'primary',
      valid: 0,
      work: 1,
    };
    expect(rounds.handleCurrentMiners(initial, updates, share, 'stale', 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [21]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1, addrprimary: '', addrauxiliary: null };
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      efficiency: 100,
      effort: 100,
      invalid: 0,
      stale: 0,
      type: 'auxiliary',
      valid: 1,
      work: 1,
    };
    expect(rounds.handleCurrentMiners({}, {}, share, 'valid', 'auxiliary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [22]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const initial = { work: 1 };
    const updates = { work: 1 };
    const share = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
    };
    const expected = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      recent: 1634742000000,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      invalid: 0,
      round: 'current',
      solo: false,
      stale: 0,
      times: 0,
      type: 'primary',
      valid: 1,
      work: 2,
    };
    expect(rounds.handleCurrentRounds(initial, updates, share, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [23]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const initial = { work: 1 };
    const updates = { work: 1 };
    const share = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
    };
    const expected = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      recent: 1634742000000,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      invalid: 1,
      round: 'current',
      solo: false,
      stale: 0,
      times: 0,
      type: 'primary',
      valid: 0,
      work: 1,
    };
    expect(rounds.handleCurrentRounds(initial, updates, share, 'invalid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [24]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const initial = { work: 1 };
    const updates = { work: 1 };
    const share = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
    };
    const expected = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      recent: 1634742000000,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      invalid: 0,
      round: 'current',
      solo: false,
      stale: 1,
      times: 0,
      type: 'primary',
      valid: 0,
      work: 1,
    };
    expect(rounds.handleCurrentRounds(initial, updates, share, 'stale', false, 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [25]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      timestamp: 1634742080841,
      addrprimary: '',
      addrauxiliary: null,
      clientdiff: 1,
      identifier: '',
    };
    const expected = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      recent: 0,
      miner: '',
      worker: null,
      identifier: 'master',
      invalid: 0,
      round: 'current',
      solo: true,
      stale: 0,
      times: 0,
      type: 'auxiliary',
      valid: 1,
      work: 1,
    };
    expect(rounds.handleCurrentRounds({}, {}, share, 'valid', true, 'auxiliary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [26]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1, addrprimary: 'primary', addrauxiliary: 'primary' };
    const initial = { work: 1 };
    const updates = { work: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      efficiency: 100,
      effort: 300,
      invalid: 0,
      solo: false,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 2,
    };
    expect(rounds.handleCurrentWorkers(initial, updates, share, 'valid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [27]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1, addrprimary: 'primary', addrauxiliary: 'primary' };
    const initial = { work: 1 };
    const updates = { work: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      efficiency: 0,
      effort: 200,
      invalid: 1,
      solo: false,
      stale: 0,
      type: 'primary',
      valid: 0,
      work: 1,
    };
    expect(rounds.handleCurrentWorkers(initial, updates, share, 'invalid', false, 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [28]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1, addrprimary: 'primary', addrauxiliary: 'primary' };
    const initial = { work: 1 };
    const updates = { work: 1 };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      efficiency: 0,
      effort: 200,
      invalid: 0,
      solo: false,
      stale: 1,
      type: 'primary',
      valid: 0,
      work: 1,
    };
    expect(rounds.handleCurrentWorkers(initial, updates, share, 'stale', false, 'primary')).toStrictEqual(expected);
  });

  test('Test rounds database updates [29]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = { clientdiff: 1, blockdiffprimary: 1, blockdiffauxiliary: 1, addrprimary: '', addrauxiliary: null };
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      worker: null,
      efficiency: 100,
      effort: 100,
      invalid: 0,
      solo: true,
      stale: 0,
      type: 'auxiliary',
      valid: 1,
      work: 1,
    };
    expect(rounds.handleCurrentWorkers({}, {}, share, 'valid', true, 'auxiliary')).toStrictEqual(expected);
  });

  test('Test rounds hashrate updates [1]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      timestamp: 1634742080841,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      share: 'valid',
      solo: false,
      type: 'primary',
      work: 1,
    };
    expect(rounds.handleHashrate([share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds hashrate updates [2]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      timestamp: 1634742080841,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
      sharevalid: false,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      share: 'invalid',
      solo: false,
      type: 'primary',
      work: 0,
    };
    expect(rounds.handleHashrate([share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds hashrate updates [3]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      error: 'error1',
      timestamp: 1634742080841,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      share: 'invalid',
      solo: false,
      type: 'primary',
      work: 0,
    };
    expect(rounds.handleHashrate([share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds hashrate updates [4]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      error: 'job not found',
      timestamp: 1634742080841,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      share: 'stale',
      solo: false,
      type: 'primary',
      work: 0,
    };
    expect(rounds.handleHashrate([share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds hashrate updates [5]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      timestamp: 0,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
      sharevalid: true,
    };
    expect(rounds.handleHashrate([share], 'primary')).toStrictEqual([]);
  });

  test('Test rounds metadata updates [1]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const metadata = { work: 1 };
    const share = {
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 100,
      effort: 200,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 1,
    };
    expect(rounds.handleMetadata(metadata, [share], 'primary')).toStrictEqual(expected);
  });

  test('Test rounds metadata updates [2]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const metadata = { work: 1 };
    const share = {
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: false,
    };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 0,
      effort: 100,
      invalid: 1,
      stale: 0,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleMetadata(metadata, [share], 'primary')).toStrictEqual(expected);
  });

  test('Test rounds metadata updates [3]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const metadata = { work: 1 };
    const share = {
      error: 'error1',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 0,
      effort: 100,
      invalid: 1,
      stale: 0,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleMetadata(metadata, [share], 'primary')).toStrictEqual(expected);
  });

  test('Test rounds metadata updates [4]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const metadata = { work: 1 };
    const share = {
      error: 'job not found',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      efficiency: 0,
      effort: 100,
      invalid: 0,
      stale: 1,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleMetadata(metadata, [share], 'primary')).toStrictEqual(expected);
  });

  test('Test rounds metadata updates [5]', () => {
    MockDate.set(1634742080841);
    configCopy.ports[0].type = 'solo';
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const metadata = { work: 1 };
    const share = {
      port: 3002,
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    expect(rounds.handleMetadata(metadata, [share], 'primary')).toStrictEqual({});
  });

  test('Test rounds miners updates [1]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const miners = { 'primary': { work: 1 }};
    const share = {
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      efficiency: 100,
      effort: 200,
      invalid: 0,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 1,
    };
    expect(rounds.handleMiners(miners, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds miners updates [2]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const miners = { 'primary': { work: 1 }};
    const share = {
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: false,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      efficiency: 0,
      effort: 100,
      invalid: 1,
      stale: 0,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleMiners(miners, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds miners updates [3]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const miners = { 'primary': { work: 1 }};
    const share = {
      error: 'error1',
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      efficiency: 0,
      effort: 100,
      invalid: 1,
      stale: 0,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleMiners(miners, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds miners updates [4]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const miners = { 'primary': { work: 1 }};
    const share = {
      error: 'job not found',
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      efficiency: 0,
      effort: 100,
      invalid: 0,
      stale: 1,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleMiners(miners, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds miners updates [5]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      error: 'job not found',
      addrprimary: '',
      addrauxiliary: null,
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      efficiency: 0,
      effort: 0,
      invalid: 0,
      stale: 1,
      type: 'auxiliary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleMiners({}, [share], 'auxiliary')).toStrictEqual([expected]);
  });

  test('Test rounds shares updates [1]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const round = { 'primary': { work: 1 }};
    const share = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      recent: 1634742000000,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      invalid: 0,
      round: 'current',
      solo: false,
      stale: 0,
      times: 0,
      type: 'primary',
      valid: 1,
      work: 1,
    };
    expect(rounds.handleShares(round, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds shares updates [2]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const round = { 'primary': { work: 1 }};
    const share = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
      sharevalid: false,
    };
    const expected = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      recent: 1634742000000,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      invalid: 1,
      round: 'current',
      solo: false,
      stale: 0,
      times: 0,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleShares(round, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds shares updates [3]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const round = { 'primary': { work: 1 }};
    const share = {
      error: 'error1',
      timestamp: 1634742080841,
      submitted: 1634742080841,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      recent: 1634742000000,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      invalid: 1,
      round: 'current',
      solo: false,
      stale: 0,
      times: 0,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleShares(round, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds shares updates [4]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const round = { 'primary': { work: 1 }};
    const share = {
      error: 'job not found',
      timestamp: 1634742080841,
      submitted: 1634742080841,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      clientdiff: 1,
      identifier: '',
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      recent: 1634742000000,
      miner: 'primary',
      worker: 'primary',
      identifier: 'master',
      invalid: 0,
      round: 'current',
      solo: false,
      stale: 1,
      times: 0,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleShares(round, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds shares updates [5]', () => {
    MockDate.set(1634742080841);
    configCopy.ports[0].type = 'solo';
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const round = { 'primary': { work: 1 }};
    const share = {
      port: 3002,
      timestamp: 1634742080841,
      submitted: 1634742080841,
      addrprimary: '',
      addrauxiliary: null,
      clientdiff: 1,
      identifier: '',
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      submitted: 1634742080841,
      recent: 0,
      miner: '',
      worker: null,
      identifier: 'master',
      invalid: 0,
      round: 'current',
      solo: true,
      stale: 0,
      times: 0,
      type: 'auxiliary',
      valid: 1,
      work: 1,
    };
    expect(rounds.handleShares(round, [share], 'auxiliary')).toStrictEqual([expected]);
  });

  test('Test rounds workers updates [1]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const workers = { 'primary': { work: 1 }};
    const share = {
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      efficiency: 100,
      effort: 200,
      invalid: 0,
      solo: false,
      stale: 0,
      type: 'primary',
      valid: 1,
      work: 1,
    };
    expect(rounds.handleWorkers(workers, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds workers updates [2]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const workers = { 'primary': { work: 1 }};
    const share = {
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: false,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      efficiency: 0,
      effort: 100,
      invalid: 1,
      solo: false,
      stale: 0,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleWorkers(workers, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds workers updates [3]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const workers = { 'primary': { work: 1 }};
    const share = {
      error: 'error1',
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      efficiency: 0,
      effort: 100,
      invalid: 1,
      solo: false,
      stale: 0,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleWorkers(workers, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds workers updates [4]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const workers = { 'primary': { work: 1 }};
    const share = {
      error: 'job not found',
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: 'primary',
      worker: 'primary',
      efficiency: 0,
      effort: 100,
      invalid: 0,
      solo: false,
      stale: 1,
      type: 'primary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleWorkers(workers, [share], 'primary')).toStrictEqual([expected]);
  });

  test('Test rounds workers updates [5]', () => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      error: 'job not found',
      addrprimary: '',
      addrauxiliary: null,
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      clientdiff: 1,
      sharevalid: true,
    };
    const expected = {
      timestamp: 1634742080841,
      miner: '',
      worker: null,
      efficiency: 0,
      effort: 0,
      invalid: 0,
      solo: false,
      stale: 1,
      type: 'auxiliary',
      valid: 0,
      work: 0,
    };
    expect(rounds.handleWorkers({}, [share], 'auxiliary')).toStrictEqual([expected]);
  });

  test('Test rounds cleanup updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const segment = [{ uuid: 'uuid1' }, { uuid: 'uuid2' }, { uuid: 'uuid3' }];
    const expectedShares = `
      DELETE FROM "Pool-Bitcoin".local_shares
      WHERE uuid IN ('uuid1', 'uuid2', 'uuid3');`;
    const expectedTransactions = `
      DELETE FROM "Pool-Bitcoin".local_transactions
      WHERE uuid IN ('uuid1', 'uuid2', 'uuid3');`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(4);
      expect(transaction[1]).toBe(expectedShares);
      expect(transaction[2]).toBe(expectedTransactions);
      done();
    });
    rounds.handleCleanup(segment, () => {});
  });

  test('Test rounds main updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const lookups = [
      null,
      { rows: [{ work: 1 }]},
      { rows: [{ work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      null,
    ];
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: null,
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
    const expectedHashrate = `
      INSERT INTO "Pool-Bitcoin".current_hashrate (
        timestamp, miner, worker,
        identifier, share, solo,
        type, work)
      VALUES (
        1634742080841,
        'primary',
        'primary',
        'master',
        'valid',
        false,
        'primary',
        1);`;
    const expectedMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        100,
        200,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_metadata.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_metadata.work + EXCLUDED.work;`;
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, efficiency,
        effort, invalid, stale, type,
        valid, work)
      VALUES (
        1634742080841,
        'primary',
        100,
        200,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_miners.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_miners.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_miners.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_miners.work + EXCLUDED.work;`;
    const expectedRounds = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, submitted, recent,
        miner, worker, identifier, invalid,
        round, solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        1,
        1634742000000,
        'primary',
        'primary',
        'master',
        0,
        'current',
        false,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        efficiency, effort, invalid,
        solo, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        'primary',
        'primary',
        100,
        200,
        0,
        false,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_workers.invalid + EXCLUDED.invalid,
        solo = EXCLUDED.solo,
        stale = "Pool-Bitcoin".current_workers.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_workers.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_workers.work + EXCLUDED.work;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(7);
      expect(transaction[1]).toBe(expectedHashrate);
      expect(transaction[2]).toBe(expectedMetadata);
      expect(transaction[3]).toBe(expectedMiners);
      expect(transaction[4]).toBe(expectedRounds);
      expect(transaction[5]).toBe(expectedWorkers);
      done();
    });
    rounds.handleUpdates(lookups, [share], () => {});
  });

  test('Test rounds main updates [2]', (done) => {
    MockDate.set(1634742080841);
    configCopy.ports[0].type = 'solo';
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const lookups = [
      null,
      { rows: [{ work: 1 }]},
      { rows: [{ work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      null,
    ];
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 0,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: null,
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
    const expectedMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, efficiency,
        effort, invalid, stale, type,
        valid, work)
      VALUES (
        1634742080841,
        'primary',
        100,
        200,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_miners.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_miners.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_miners.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_miners.work + EXCLUDED.work;`;
    const expectedRounds = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, submitted, recent,
        miner, worker, identifier, invalid,
        round, solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        1,
        0,
        'primary',
        'primary',
        'master',
        0,
        'current',
        true,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        efficiency, effort, invalid,
        solo, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        'primary',
        'primary',
        100,
        200,
        0,
        true,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_workers.invalid + EXCLUDED.invalid,
        solo = EXCLUDED.solo,
        stale = "Pool-Bitcoin".current_workers.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_workers.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_workers.work + EXCLUDED.work;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(5);
      expect(transaction[1]).toBe(expectedMiners);
      expect(transaction[2]).toBe(expectedRounds);
      expect(transaction[3]).toBe(expectedWorkers);
      done();
    });
    rounds.handleUpdates(lookups, [share], () => {});
  });

  test('Test rounds main updates [3]', (done) => {
    MockDate.set(1634742080841);
    configCopy.auxiliary = { enabled: true };
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const lookups = [
      null,
      { rows: [{ work: 1 }]},
      { rows: [{ work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      null,
    ];
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
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
    const expectedPrimaryHashrate = `
      INSERT INTO "Pool-Bitcoin".current_hashrate (
        timestamp, miner, worker,
        identifier, share, solo,
        type, work)
      VALUES (
        1634742080841,
        'primary',
        'primary',
        'master',
        'valid',
        false,
        'primary',
        1);`;
    const expectedAuxiliaryHashrate = `
      INSERT INTO "Pool-Bitcoin".current_hashrate (
        timestamp, miner, worker,
        identifier, share, solo,
        type, work)
      VALUES (
        1634742080841,
        'primary',
        'primary',
        'master',
        'valid',
        false,
        'auxiliary',
        1);`;
    const expectedPrimaryMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        100,
        200,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_metadata.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_metadata.work + EXCLUDED.work;`;
    const expectedAuxiliaryMetadata = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        100,
        200,
        0,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_metadata.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_metadata.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_metadata.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_metadata.work + EXCLUDED.work;`;
    const expectedPrimaryMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, efficiency,
        effort, invalid, stale, type,
        valid, work)
      VALUES (
        1634742080841,
        'primary',
        100,
        200,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_miners.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_miners.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_miners.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_miners.work + EXCLUDED.work;`;
    const expectedAuxiliaryMiners = `
      INSERT INTO "Pool-Bitcoin".current_miners (
        timestamp, miner, efficiency,
        effort, invalid, stale, type,
        valid, work)
      VALUES (
        1634742080841,
        'primary',
        100,
        200,
        0,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_miners_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_miners.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_miners.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_miners.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_miners.work + EXCLUDED.work;`;
    const expectedPrimaryRounds = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, submitted, recent,
        miner, worker, identifier, invalid,
        round, solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        1,
        1634742000000,
        'primary',
        'primary',
        'master',
        0,
        'current',
        false,
        0,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedAuxiliaryRounds = `
      INSERT INTO "Pool-Bitcoin".current_rounds (
        timestamp, submitted, recent,
        miner, worker, identifier, invalid,
        round, solo, stale, times, type,
        valid, work)
      VALUES (
        1634742080841,
        1,
        1634742000000,
        'primary',
        'primary',
        'master',
        0,
        'current',
        false,
        0,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_rounds_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        invalid = "Pool-Bitcoin".current_rounds.invalid + EXCLUDED.invalid,
        stale = "Pool-Bitcoin".current_rounds.stale + EXCLUDED.stale,
        times = GREATEST("Pool-Bitcoin".current_rounds.times, EXCLUDED.times),
        valid = "Pool-Bitcoin".current_rounds.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_rounds.work + EXCLUDED.work;`;
    const expectedPrimaryWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        efficiency, effort, invalid,
        solo, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        'primary',
        'primary',
        100,
        200,
        0,
        false,
        0,
        'primary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_workers.invalid + EXCLUDED.invalid,
        solo = EXCLUDED.solo,
        stale = "Pool-Bitcoin".current_workers.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_workers.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_workers.work + EXCLUDED.work;`;
    const expectedAuxiliaryWorkers = `
      INSERT INTO "Pool-Bitcoin".current_workers (
        timestamp, miner, worker,
        efficiency, effort, invalid,
        solo, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        'primary',
        'primary',
        100,
        200,
        0,
        false,
        0,
        'auxiliary',
        1,
        1)
      ON CONFLICT ON CONSTRAINT current_workers_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = EXCLUDED.efficiency,
        effort = EXCLUDED.effort,
        invalid = "Pool-Bitcoin".current_workers.invalid + EXCLUDED.invalid,
        solo = EXCLUDED.solo,
        stale = "Pool-Bitcoin".current_workers.stale + EXCLUDED.stale,
        valid = "Pool-Bitcoin".current_workers.valid + EXCLUDED.valid,
        work = "Pool-Bitcoin".current_workers.work + EXCLUDED.work;`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(12);
      expect(transaction[1]).toBe(expectedPrimaryHashrate);
      expect(transaction[2]).toBe(expectedAuxiliaryHashrate);
      expect(transaction[3]).toBe(expectedPrimaryMetadata);
      expect(transaction[4]).toBe(expectedAuxiliaryMetadata);
      expect(transaction[5]).toBe(expectedPrimaryMiners);
      expect(transaction[6]).toBe(expectedAuxiliaryMiners);
      expect(transaction[7]).toBe(expectedPrimaryRounds);
      expect(transaction[8]).toBe(expectedAuxiliaryRounds);
      expect(transaction[9]).toBe(expectedPrimaryWorkers);
      expect(transaction[10]).toBe(expectedAuxiliaryWorkers);
      done();
    });
    rounds.handleUpdates(lookups, [share], () => {});
  });

  test('Test rounds main updates [4]', (done) => {
    MockDate.set(1634742080841);
    configCopy.ports[0].type = 'solo';
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const lookups = [
      null,
      { rows: []},
      { rows: []},
      { rows: []},
      { rows: []},
      { rows: []},
      { rows: []},
      { rows: []},
      { rows: []},
      null,
    ];
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(2);
      done();
    });
    rounds.handleUpdates(lookups, [], () => {});
  });

  test('Test rounds primary updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const workers = { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]};
    const lookups = [null, { rows: [{ work: 1 }]}, null, null, null, workers, null, null, null, null];
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
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
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1634742080841,
        'primary',
        'primary',
        'pending',
        -1,
        1,
        'hash1',
        1,
        'master',
        200,
        0,
        '123456789',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedMetadataBlocks = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedMetadataReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'primary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedRounds = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND solo = false
      AND type = 'primary';`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(6);
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadataBlocks);
      expect(transaction[3]).toBe(expectedMetadataReset);
      expect(transaction[4]).toBe(expectedRounds);
      done();
    });
    rounds.handlePrimary(lookups, [share], () => {});
  });

  test('Test rounds primary updates [2]', (done) => {
    MockDate.set(1634742080841);
    configCopy.ports[0].type = 'solo';
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const workers = { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]};
    const lookups = [null, { rows: [{ work: 1 }]}, null, null, null, workers, null, null, null, null];
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
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
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1634742080841,
        'primary',
        'primary',
        'pending',
        -1,
        1,
        'hash1',
        1,
        'master',
        200,
        0,
        '123456789',
        true,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedMetadataBlocks = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedMetadataReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'primary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedRounds = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND miner = 'primary'
      AND solo = true AND type = 'primary';`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(6);
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadataBlocks);
      expect(transaction[3]).toBe(expectedMetadataReset);
      expect(transaction[4]).toBe(expectedRounds);
      done();
    });
    rounds.handlePrimary(lookups, [share], () => {});
  });

  test('Test rounds primary updates [3]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const lookups = [null, { rows: []}, null, null, null, { rows: []}, null, null, null, null];
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: null,
      addrauxiliary: null,
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
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1634742080841,
        '',
        'null',
        'pending',
        -1,
        1,
        'hash1',
        1,
        'master',
        100,
        0,
        '123456789',
        false,
        'transaction1',
        'primary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedMetadataBlocks = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'primary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedMetadataReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'primary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedRounds = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND solo = false
      AND type = 'primary';`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(6);
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadataBlocks);
      expect(transaction[3]).toBe(expectedMetadataReset);
      expect(transaction[4]).toBe(expectedRounds);
      done();
    });
    rounds.handlePrimary(lookups, [share], () => {});
  });

  test('Test rounds auxiliary updates [1]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const workers = { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]};
    const lookups = [null, null, { rows: [{ work: 1 }]}, null, null, null, workers, null, null, null];
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
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
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1634742080841,
        'primary',
        'primary',
        'pending',
        -1,
        1,
        'hash1',
        1,
        'master',
        200,
        0,
        '123456789',
        false,
        'transaction1',
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedMetadataBlocks = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedMetadataReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'auxiliary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedRounds = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND solo = false
      AND type = 'auxiliary';`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(6);
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadataBlocks);
      expect(transaction[3]).toBe(expectedMetadataReset);
      expect(transaction[4]).toBe(expectedRounds);
      done();
    });
    rounds.handleAuxiliary(lookups, [share], () => {});
  });

  test('Test rounds auxiliary updates [2]', (done) => {
    MockDate.set(1634742080841);
    configCopy.ports[0].type = 'solo';
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const workers = { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]};
    const lookups = [null, null, { rows: [{ work: 1 }]}, null, null, null, workers, null, null, null];
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
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
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1634742080841,
        'primary',
        'primary',
        'pending',
        -1,
        1,
        'hash1',
        1,
        'master',
        200,
        0,
        '123456789',
        true,
        'transaction1',
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedMetadataBlocks = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedMetadataReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'auxiliary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedRounds = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND miner = 'primary'
      AND solo = true AND type = 'auxiliary';`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(6);
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadataBlocks);
      expect(transaction[3]).toBe(expectedMetadataReset);
      expect(transaction[4]).toBe(expectedRounds);
      done();
    });
    rounds.handleAuxiliary(lookups, [share], () => {});
  });

  test('Test rounds auxiliary updates [3]', (done) => {
    MockDate.set(1634742080841);
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const lookups = [null, null, { rows: []}, null, null, null, { rows: []}, null, null, null];
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: null,
      addrauxiliary: null,
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
    const expectedBlocks = `
      INSERT INTO "Pool-Bitcoin".current_blocks (
        timestamp, submitted, miner,
        worker, category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES (
        1634742080841,
        1634742080841,
        '',
        'null',
        'pending',
        -1,
        1,
        'hash1',
        1,
        'master',
        100,
        0,
        '123456789',
        false,
        'transaction1',
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        submitted = EXCLUDED.submitted,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
    const expectedMetadataBlocks = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, blocks, type)
      VALUES (
        1634742080841,
        1,
        'auxiliary')
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        blocks = "Pool-Bitcoin".current_metadata.blocks + EXCLUDED.blocks;`;
    const expectedMetadataReset = `
      INSERT INTO "Pool-Bitcoin".current_metadata (
        timestamp, efficiency, effort,
        invalid, stale, type, valid,
        work)
      VALUES (
        1634742080841,
        0, 0, 0, 0, 'auxiliary', 0, 0)
      ON CONFLICT ON CONSTRAINT current_metadata_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        efficiency = 0, effort = 0, invalid = 0,
        stale = 0, valid = 0, work = 0;`;
    const expectedRounds = `
      UPDATE "Pool-Bitcoin".current_rounds
      SET round = '123456789'
      WHERE round = 'current' AND solo = false
      AND type = 'auxiliary';`;
    client.on('transaction', (transaction) => {
      expect(transaction.length).toBe(6);
      expect(transaction[1]).toBe(expectedBlocks);
      expect(transaction[2]).toBe(expectedMetadataBlocks);
      expect(transaction[3]).toBe(expectedMetadataReset);
      expect(transaction[4]).toBe(expectedRounds);
      done();
    });
    rounds.handleAuxiliary(lookups, [share], () => {});
  });

  test('Test rounds segment handling [1]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [
      null,
      { rows: [{ work: 1 }]},
      { rows: [{ work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      null,
    ];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      blockvalid: false,
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
    rounds.handleSegments([share, share, share], () => done());
  });

  test('Test rounds segment handling [2]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [
      null,
      { rows: [{ work: 1 }]},
      { rows: [{ work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      null,
    ];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      blockvalid: true,
      blocktype: 'primary',
      clientdiff: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      sharediff: 1,
      sharevalid: true,
      transaction: 'transaction1'
    };
    rounds.handleSegments([share], () => done());
  });

  test('Test rounds segment handling [3]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [
      null,
      { rows: [{ work: 1 }]},
      { rows: [{ work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      null,
    ];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      blockvalid: false,
      blocktype: 'primary',
      clientdiff: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      sharediff: 1,
      sharevalid: true,
      transaction: 'transaction1'
    };
    rounds.handleSegments([share], () => done());
  });

  test('Test rounds segment handling [4]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [
      null,
      { rows: [{ work: 1 }]},
      { rows: [{ work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      null,
    ];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      blockvalid: true,
      blocktype: 'auxiliary',
      clientdiff: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      sharediff: 1,
      sharevalid: true,
      transaction: 'transaction1'
    };
    rounds.handleSegments([share], () => done());
  });

  test('Test rounds segment handling [5]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [
      null,
      { rows: [{ work: 1 }]},
      { rows: [{ work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      null,
    ];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: 'primary',
      addrauxiliary: 'primary',
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      blockvalid: false,
      blocktype: 'auxiliary',
      clientdiff: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      sharediff: 1,
      sharevalid: true,
      transaction: 'transaction1'
    };
    rounds.handleSegments([share], () => done());
  });

  test('Test rounds segment handling [6]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [
      null,
      { rows: [{ work: 1 }]},
      { rows: [{ work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      null,
    ];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    const share = {
      error: '',
      uuid: '123456789',
      timestamp: 1634742080841,
      submitted: 1,
      ip: '0.0.0.0',
      port: 3002,
      addrprimary: null,
      addrauxiliary: null,
      blockdiffprimary: 1,
      blockdiffauxiliary: 1,
      blockvalid: false,
      blocktype: 'unknown',
      clientdiff: 1,
      hash: 'hash1',
      height: 1,
      identifier: '',
      reward: 1,
      sharediff: 1,
      sharevalid: true,
      transaction: 'transaction1'
    };
    rounds.handleSegments([share], () => done());
  });

  test('Test rounds segment handling [7]', (done) => {
    MockDate.set(1634742080841);
    const lookups = [
      null,
      { rows: [{ work: 1 }]},
      { rows: [{ work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      { rows: [{ miner: 'primary', worker: 'primary', work: 1 }]},
      null,
    ];
    const client = mockClient(configMainCopy, lookups);
    const logger = new Logger(configMainCopy);
    const rounds = new Rounds(logger, client, configCopy, configMainCopy);
    rounds.handleSegments([], () => done());
  });
});
