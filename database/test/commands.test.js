const Commands = require('../main/commands');
const Logger = require('../../server/main/logger');
const configMain = require('../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

function mockClient(error, results) {
  return { query: (commands, callback) => callback(error, results) };
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

  test('Test executor functionality [2]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const client = mockClient(true, null);
    const commands = new Commands(logger, client, configMainCopy);
    expect(() => commands.executor(['test'], () => {})).toThrow(Error);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });
});
