const Api = require('../main/api');
const Server = require('../main/server');
const Logger = require('../main/logger');
const config = require('../../configs/pools/example');
const configMain = require('../../configs/main.js');
const events = require('events');

const configs = { 'Pool-Bitcoin': config };
process.env.configs = JSON.stringify(configs);
process.env.configMain = JSON.stringify(configMain);

////////////////////////////////////////////////////////////////////////////////

function mockClient() {
  const client = new events.EventEmitter();
  client.commands = { executor: () => {}, current: {}, historical: {}};
  return client;
}

function mockResponse() {
  const response = new events.EventEmitter();
  response.writeHead = (code, headers) => {
    response.emit('header', [code, headers]);
  };
  response.end = (payload) => response.emit('end', payload);
  return response;
}

////////////////////////////////////////////////////////////////////////////////

describe('Test server functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of server', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const client = mockClient();
    const logger = new Logger(configMainCopy);
    const server = new Server(logger, client);
    server.setupServer(() => {
      expect(typeof server).toBe('object');
      expect(typeof server.server).toBe('object');
      expect(server.server._connections).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();
      console.log.mockClear();
      server.server.close(() => done());
    });
  });

  test('Test error handling functionality', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const client = mockClient();
    const response = mockResponse();
    const logger = new Logger(configMainCopy);
    const server = new Server(logger, client);
    const api = new Api(logger, client, configs, configMainCopy);
    const expected = '{"version":"0.0.1","statusCode":500,"headers":{"Access-Control-Allow-Headers":"Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Allow-Methods","Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET","Content-Type":"application/json"},"body":"The server was unable to handle your request. Verify your input or try again later"}';
    response.on('end', (payload) => {
      expect(payload).toBe(expected);
      expect(consoleSpy).toHaveBeenCalled();
      console.log.mockClear();
      server.server.close(() => done());
    });
    server.setupServer(() => {
      server.handleErrors(api, 'test', response);
    });
  });
});
