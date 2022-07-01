const Builder = require('../main/builder');
const Logger = require('../main/logger');
const configMain = require('../../configs/main.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test builder functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of builder', () => {
    const builder = new Builder(logger, configMainCopy);
    expect(typeof builder.configMain).toBe('object');
    expect(typeof builder.createPoolWorkers).toBe('function');
    expect(typeof builder.setupPoolWorkers).toBe('function');
  });
});
