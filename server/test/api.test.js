const Api = require('../main/api');
const Commands = require('../../database/main/commands');
const Logger = require('../main/logger');
const config = require('../../configs/pools/example.js');
const configMain = require('../../configs/main.js');
const events = require('events');

////////////////////////////////////////////////////////////////////////////////

function mockClient(configMain, result) {
  const client = new events.EventEmitter();
  client.commands = new Commands(null, null, configMain);
  client.commands.executor = (commands, callback) => callback(result);
  return client;
}

function mockRequest(pool, category, endpoint, queries) {
  return {
    params: { pool: pool, category: category, endpoint: endpoint },
    query: queries,
  };
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

describe('Test API functionality', () => {

  let configCopy, configMainCopy, configs;
  beforeEach(() => {
    configCopy = JSON.parse(JSON.stringify(config));
    configMainCopy = JSON.parse(JSON.stringify(configMain));
    configs = { Pool1: configCopy };
  });

  test('Test initialization of API', () => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    expect(typeof api.buildResponse).toBe('function');
    expect(typeof api.handleApiV2).toBe('function');
  });

  test('Test API response handling', (done) => {
    const response = mockResponse();
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    response.on('end', (payload) => {
      const processed = JSON.parse(payload);
      expect(processed.statusCode).toBe(200);
      expect(processed.body).toBe('This is an example request');
      done();
    });
    api.buildResponse(200, 'This is an example request', response);
  });

  test('Test API request handling [1]', (done) => {
    const request = mockRequest('Pool1', 'current', 'blocks', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [2]', (done) => {
    const request = mockRequest('Pool1', 'current', 'hashrate', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [3]', (done) => {
    const request = mockRequest('Pool1', 'current', 'metadata', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [4]', (done) => {
    const request = mockRequest('Pool1', 'current', 'miners', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [5]', (done) => {
    const request = mockRequest('Pool1', 'current', 'network', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [6]', (done) => {
    const request = mockRequest('Pool1', 'current', 'payments', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [7]', (done) => {
    const request = mockRequest('Pool1', 'current', 'ports', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    const expected = { ports: configs['Pool1'].ports };
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual(expected);
      done();
    });
  });

  test('Test API request handling [8]', (done) => {
    const request = mockRequest('Pool1', 'current', 'rounds', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [9]', (done) => {
    const request = mockRequest('Pool1', 'current', 'transactions', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [10]', (done) => {
    const request = mockRequest('Pool1', 'current', 'workers', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [11]', (done) => {
    const request = mockRequest('Pool1', 'historical', 'blocks', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [12]', (done) => {
    const request = mockRequest('Pool1', 'historical', 'metadata', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [13]', (done) => {
    const request = mockRequest('Pool1', 'historical', 'miners', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [14]', (done) => {
    const request = mockRequest('Pool1', 'historical', 'network', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [15]', (done) => {
    const request = mockRequest('Pool1', 'historical', 'payments', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [16]', (done) => {
    const request = mockRequest('Pool1', 'historical', 'rounds', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [17]', (done) => {
    const request = mockRequest('Pool1', 'historical', 'transactions', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [18]', (done) => {
    const request = mockRequest('Pool1', 'historical', 'workers', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [19]', (done) => {
    const request = mockRequest('Pool1', '', '', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual([]);
      done();
    });
  });

  test('Test API request handling [20]', (done) => {
    const request = mockRequest('pools', '', '', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    const expected = ['Pool1'];
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(200);
      expect(message).toStrictEqual(expected);
      done();
    });
  });

  test('Test API request handling [21]', (done) => {
    const request = mockRequest('Pool1', 'bad', 'bad', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    const expected = 'The requested method is not currently supported. Verify your input and try again';
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(405);
      expect(message).toStrictEqual(expected);
      done();
    });
  });

  test('Test API request handling [22]', (done) => {
    const request = mockRequest('bad', '', '', {});
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    const expected = 'The requested pool was not found. Verify your input and try again';
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(404);
      expect(message).toStrictEqual(expected);
      done();
    });
  });

  test('Test API request handling [23]', (done) => {
    const request = { params: {}, queries: {} };
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    const expected = 'The requested pool was not found. Verify your input and try again';
    api.handleApiV2(request, (code, message) => {
      expect(code).toBe(404);
      expect(message).toStrictEqual(expected);
      done();
    });
  });

  test('Test API request handling [24]', (done) => {
    const client = mockClient(configMainCopy, { rows: [] });
    const logger = new Logger(configMainCopy);
    const api = new Api(logger, client, configs, configMainCopy);
    const expected = 'The requested pool was not found. Verify your input and try again';
    api.handleApiV2({}, (code, message) => {
      expect(code).toBe(404);
      expect(message).toStrictEqual(expected);
      done();
    });
  });
});
