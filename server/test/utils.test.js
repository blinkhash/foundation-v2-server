const utils = require('../main/utils');

////////////////////////////////////////////////////////////////////////////////

describe('Test utility functionality', () => {

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
});
