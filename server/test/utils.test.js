const utils = require('../main/utils');

////////////////////////////////////////////////////////////////////////////////

describe('Test utility functionality', () => {

  test('Test implemented checkSoloMining [1]', () => {
    const data = { 'port': '3001' };
    const config = { 'ports': [{ 'port': '3001', 'type': 'solo' }]};
    expect(utils.checkSoloMining(config, data)).toBe(true);
  });

  test('Test implemented checkSoloMining [2]', () => {
    const data = { 'ports': { '3001': '' }};
    const config = { 'ports': [{ 'port': '3001', 'type': 'shared' }]};
    expect(utils.checkSoloMining(config, data)).toBe(false);
  });

  test('Test implemented checkSoloMining [3]', () => {
    const data = { 'port': '3001' };
    const config = { 'ports': [{ 'port': '3001' }]};
    expect(utils.checkSoloMining(config, data)).toBe(false);
  });

  test('Test implemented checkSoloMining [4]', () => {
    const data = { 'port': '3002' };
    const config = { 'ports': [{ 'port': '3001', 'type': 'solo' }]};
    expect(utils.checkSoloMining(config, data)).toBe(false);
  });

  test('Test implemented countProcessForks [1]', () => {
    const config = { 'clustering': { 'enabled': false, 'forks': 'auto' }};
    expect(utils.countProcessForks(config)).toBe(1);
  });

  test('Test implemented countProcessForks [2]', () => {
    const config = { 'clustering': { 'enabled': true, 'forks': 2 }};
    expect(utils.countProcessForks(config)).toBe(2);
  });

  test('Test implemented countProcessForks [4]', () => {
    const config = { 'clustering': { 'enabled': true }};
    expect(utils.countProcessForks(config)).toBe(1);
  });

  test('Test implemented handleValidation', () => {
    expect(utils.handleValidation('test', 'boolean')).toBe(false);
    expect(utils.handleValidation('test', 'number')).toBe(false);
    expect(utils.handleValidation('test', 'string')).toBe(true);
    expect(utils.handleValidation('test', 'special')).toBe(true);
    expect(utils.handleValidation('test', 'other')).toBe(false);
  });

  test('Test implemented loggerSeverity', () => {
    expect(utils.loggerSeverity.debug).toBe(1);
    expect(utils.loggerSeverity.log).toBe(2);
    expect(utils.loggerSeverity.warning).toBe(3);
    expect(utils.loggerSeverity.special).toBe(4);
    expect(utils.loggerSeverity.error).toBe(5);
  });

  test('Test implemented loggerColors', () => {
    expect(utils.loggerColors('debug', `${'test'}`)).toBe('test'.blue);
    expect(utils.loggerColors('log', `${'test'}`)).toBe('test'.green);
    expect(utils.loggerColors('warning', `${'test'}`)).toBe('test'.yellow);
    expect(utils.loggerColors('special', `${'test'}`)).toBe('test'.cyan);
    expect(utils.loggerColors('error', `${'test'}`)).toBe('test'.red);
    expect(utils.loggerColors('other', `${'test'}`)).toBe('test'.italic);
  });

  test('Test implemented roundTo', () => {
    expect(utils.roundTo(10.31831)).toBe(10);
    expect(utils.roundTo(10.9318)).toBe(11);
    expect(utils.roundTo(10.31831, 1)).toBe(10.3);
    expect(utils.roundTo(10.9318, 1)).toBe(10.9);
  });

  test('Test implemented validateBooleans', () => {
    expect(utils.validateBooleans('test')).toBe(false);
    expect(utils.validateBooleans('true')).toBe(true);
    expect(utils.validateBooleans('false')).toBe(true);
  });

  test('Test implemented validateNumbers', () => {
    expect(utils.validateNumbers('test100')).toBe(false);
    expect(utils.validateNumbers('lt100')).toBe(true);
    expect(utils.validateNumbers('lt0')).toBe(true);
    expect(utils.validateNumbers('100')).toBe(true);
    expect(utils.validateNumbers('100.00')).toBe(true);
  });

  test('Test implemented validateParameters', () => {
    expect(utils.validateParameters('test')).toBe('test');
    expect(utils.validateParameters('test test')).toBe('testtest');
    expect(utils.validateParameters('; DROP TABLE test')).toBe('DROPTABLEtest');
    expect(utils.validateParameters(';DROPTABLEtest')).toBe('DROPTABLEtest');
    expect(utils.validateParameters('parameter')).toBe('parameter');
    expect(utils.validateParameters('parameter!')).toBe('parameter');
    expect(utils.validateParameters('')).toBe('');
  });

  test('Test implemented validateStrings', () => {
    expect(utils.validateStrings('test')).toBe(true);
    expect(utils.validateStrings('test test')).toBe(false);
    expect(utils.validateStrings('; DROP TABLE test')).toBe(false);
    expect(utils.validateStrings(';DROPTABLEtest')).toBe(false);
    expect(utils.validateStrings('parameter')).toBe(true);
    expect(utils.validateStrings('parameter!')).toBe(false);
  });
});
