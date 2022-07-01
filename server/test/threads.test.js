const Logger = require('../main/logger');
const Threads = require('../main/threads');
const configMain = require('../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test threads functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of threads', () => {
    const threads = new Threads(logger, configMainCopy);
    expect(typeof threads.configMain).toBe('object');
    expect(typeof threads.setupThreads).toBe('function');
  });
});
