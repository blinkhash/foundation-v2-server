const Loader = require('../main/loader');
const Logger = require('../main/logger');
const configMain = require('../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test loader functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of loader', () => {
    const loader = new Loader(logger, configMainCopy);
    expect(typeof loader.configMain).toBe('object');
    expect(typeof loader.handleConfigs).toBe('function');
  });

  test('Test loader daemon validation [1]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { primary: { daemons: [] }};
    const response = loader.checkPoolDaemons(config);
    expect(response).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader daemon validation [2]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { primary: { daemons: ['test'] }, auxiliary: { enabled: true, daemons: [] }};
    const response = loader.checkPoolDaemons(config);
    expect(response).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader daemon validation [3]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { primary: { daemons: ['test'] }, auxiliary: { enabled: true, daemons: ['test'] }};
    const response = loader.checkPoolDaemons(config);
    expect(response).toBe(true);
    expect(consoleSpy).not.toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader daemon validation [4]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { primary: { daemons: ['test'] }};
    const response = loader.checkPoolDaemons(config);
    expect(response).toBe(true);
    expect(consoleSpy).not.toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader names validation [1]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { name: 'Pool-Test' };
    const response = loader.checkPoolNames({}, config);
    expect(response).toBe(true);
    expect(consoleSpy).not.toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader names validation [2]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { name: 'Pool Test' };
    const response = loader.checkPoolNames({}, config);
    expect(response).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader names validation [3]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { name: 'Pool-Test' };
    const response = loader.checkPoolNames({ 'Pool-Test': { name: 'Pool-Test' }}, config);
    expect(response).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader port validation [1]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { ports: [{ port: 3001 }, { port: 3001 }]};
    const response = loader.checkPoolPorts({}, config);
    expect(response).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader port validation [2]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { ports: [{ port: 3001 }]};
    const response = loader.checkPoolPorts({}, config);
    expect(response).toBe(true);
    expect(consoleSpy).not.toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader port validation [3]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { ports: [{ port: 3001 }]};
    const response = loader.checkPoolPorts({ 'Pool-Test': config }, config);
    expect(response).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader recipient validation [1]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { primary: { recipients: [{ percentage: 1.01 }]}};
    const response = loader.checkPoolRecipients(config);
    expect(response).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader recipient validation [2]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { primary: { recipients: [{ percentage: 0.45 }]}};
    const response = loader.checkPoolRecipients(config);
    expect(response).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader recipient validation [3]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { primary: { recipients: [{ percentage: 0.05 }]}};
    const response = loader.checkPoolRecipients(config);
    expect(response).toBe(true);
    expect(consoleSpy).not.toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test loader recipient validation [4]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const loader = new Loader(logger, configMainCopy);
    const config = { primary: { recipients: []}};
    const response = loader.checkPoolRecipients(config);
    expect(response).toBe(true);
    expect(consoleSpy).not.toHaveBeenCalled();
    console.log.mockClear();
  });
});
