const Logger = require('../main/logger');
/* eslint-disable-next-line no-unused-vars */
const colors = require('colors');
const configMain = require('../../configs/main.js');

const logSystem = 'Test';
const logComponent = 'Test';

////////////////////////////////////////////////////////////////////////////////

describe('Test logger functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of logger', () => {
    const logger = new Logger(configMainCopy);
    expect(typeof logger).toBe('object');
    expect(typeof logger.logText).toBe('function');
    expect(logger.logLevel).toBe(2);
  });

  test('Test logger events [1]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const logger = new Logger(configMainCopy);
    logger.log(logSystem, logComponent, ['Example Text']);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test logger events [2]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const logger = new Logger(configMainCopy);
    logger.warning(logSystem, logComponent, ['Example Text']);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test logger events [3]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const logger = new Logger(configMainCopy);
    logger.error(logSystem, logComponent, ['Example Text']);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test logger events [4]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const logger = new Logger(configMainCopy);
    logger.special(logSystem, logComponent, ['Example Text']);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test logger events [5]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    configMainCopy.logger.logColors = false;
    const logger = new Logger(configMainCopy);
    logger.log(logSystem, logComponent, ['Example Text']);
    expect(consoleSpy).toHaveBeenCalled();
    console.log.mockClear();
  });

  test('Test logger events [6]', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    configMainCopy.logger.logLevel = 'error';
    const logger = new Logger(configMainCopy);
    logger.log(logSystem, logComponent, ['Example Text']);
    expect(consoleSpy).not.toHaveBeenCalled();
    console.log.mockClear();
  });
});
