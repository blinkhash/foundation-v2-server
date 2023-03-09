const Client = require('../main/client');
const Logger = require('../../server/main/logger');
const configMain = require('../../configs/main/example.js');
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test client functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of client', () => {
    const client = new Client(logger, configMainCopy);
    expect(typeof client.configMain).toBe('object');
    expect(typeof client.handleClientMaster).toBe('function');
    expect(typeof client.handleClientWorker).toBe('function');
  });
});
