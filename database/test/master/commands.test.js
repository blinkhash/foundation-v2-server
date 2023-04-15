const Commands = require('../../main/master/commands');
const Logger = require('../../../server/main/logger');
const configMain = require('../../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

function mockClient(error, results) {
  let requests = 0;
  return { query: (commands, callback) => {
    if (requests >= 1) callback(false, results);
    else {
      requests += 1;
      callback(error, results);
    }
  }};
}

////////////////////////////////////////////////////////////////////////////////

describe('Test command functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of commands', () => {
    const client = mockClient();
    const commands = new Commands(logger, client, configMainCopy);
    expect(typeof commands.configMain).toBe('object');
    expect(typeof commands.executor).toBe('function');
  });

  test('Test executor functionality [1]', () => {
    const client = mockClient(null, ['test']);
    const commands = new Commands(logger, client, configMainCopy);
    commands.executor(['test'], (results) => {
      expect(results[0]).toBe('test');
    });
  });

  test('Test executor functionality [2]', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const client = mockClient(true, null);
    const commands = new Commands(logger, client, configMainCopy);
    commands.executor(['test'], () => {
      expect(consoleSpy).toHaveBeenCalled();
      console.log.mockClear();
      done();
    });
  });

  test('Test executor functionality [3]', () => {
    const client = mockClient(true, null);
    const commands = new Commands(logger, client, configMainCopy);
    commands.retries = 3;
    expect(() => commands.executor(['test'], () => {})).toThrow(Error);
  });
});
