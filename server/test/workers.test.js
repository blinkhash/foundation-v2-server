const Logger = require('../main/logger');
const Workers = require('../main/workers');
const config = require('../../configs/pools/example');
const configMain = require('../../configs/main.js');

config.primary.address = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
config.primary.recipients[0].address = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
config.primary.daemons = [{
  'host': '127.0.0.1',
  'port': '8332',
  'username': 'foundation',
  'password': 'foundation'
}];

process.env.configs = JSON.stringify({ 'Pool-Bitcoin': config });
process.env.configMain = JSON.stringify(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test workers functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of workers', () => {
    const logger = new Logger(configMainCopy);
    const workers = new Workers(logger);
    expect(typeof workers.configMain).toBe('object');
    expect(typeof workers.handlePromises).toBe('function');
    expect(typeof workers.setupWorkers).toBe('function');
  });
});
