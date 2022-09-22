const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolBlocks = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Pool Parameters
  _this.numbers = ['timestamp', 'confirmations', 'difficulty', 'height', 'luck', 'reward'];
  _this.strings = ['miner', 'worker', 'category', 'hash', 'identifier', 'round', 'transaction', 'type'];
  _this.parameters = ['timestamp', 'miner', 'worker', 'category', 'confirmations', 'difficulty',
    'hash', 'height', 'identifier', 'luck', 'reward', 'round', 'solo', 'transaction', 'type'];

  // Handle String Parameters
  this.handleStrings = function(parameters, parameter) {
    return ` = '${ parameters[parameter] }'`;
  };

  // Handle Numerical Parameters
  this.handleNumbers = function(parameters, parameter) {
    const query = parameters[parameter];
    if (query.includes('lt')) return ` < ${ query.replace('lt', '') }`;
    if (query.includes('le')) return ` <= ${ query.replace('le', '') }`;
    if (query.includes('gt')) return ` > ${ query.replace('gt', '') }`;
    if (query.includes('ge')) return ` >= ${ query.replace('ge', '') }`;
    if (query.includes('ne')) return ` != ${ query.replace('ne', '') }`;
    else return ` = ${ query }`;
  };

  // Handle Query Parameters
  /* istanbul ignore next */
  this.handleQueries = function(parameters, parameter) {
    if (_this.numbers.includes(parameter)) return _this.handleNumbers(parameters, parameter);
    if (_this.strings.includes(parameter)) return _this.handleStrings(parameters, parameter);
    else return ` = ${ parameters[parameter] }`;
  };

  // Select Pool Blocks Using Parameters
  this.selectPoolBlocksCurrent = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".pool_blocks`;
    const filtered = Object.keys(parameters).filter((key) => _this.parameters.includes(key));
    filtered.forEach((parameter, idx) => {
      if (idx === 0) output += ' WHERE ';
      else output += ' AND ';
      output += `${ parameter }`;
      output += _this.handleQueries(parameters, parameter);
    });
    return output + ';';
  };

  // Build Blocks Values String
  this.buildPoolBlocksCurrent = function(updates) {
    let values = '';
    updates.forEach((block, idx) => {
      values += `(
        ${ block.timestamp },
        '${ block.miner }',
        '${ block.worker }',
        '${ block.category }',
        ${ block.confirmations },
        ${ block.difficulty },
        '${ block.hash }',
        ${ block.height },
        '${ block.identifier }',
        ${ block.luck },
        ${ block.reward },
        '${ block.round }',
        ${ block.solo },
        '${ block.transaction }',
        '${ block.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Blocks Data
  this.insertPoolBlocksCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES ${ _this.buildPoolBlocksCurrent(updates) }
      ON CONFLICT ON CONSTRAINT pool_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        category = EXCLUDED.category,
        confirmations = EXCLUDED.confirmations,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        reward = EXCLUDED.reward,
        solo = EXCLUDED.solo,
        transaction = EXCLUDED.transaction,
        type = EXCLUDED.type;`;
  };

  // Delete Rows From Current Round
  this.deletePoolBlocksCurrent = function(pool, rounds) {
    return `
      DELETE FROM "${ pool }".pool_blocks
      WHERE round IN (${ rounds.join(', ') });`;
  };
};

module.exports = PoolBlocks;
