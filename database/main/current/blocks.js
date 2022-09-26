const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const CurrentBlocks = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Handle Current Parameters
  this.numbers = ['timestamp', 'confirmations', 'difficulty', 'height', 'luck', 'reward'];
  this.strings = ['miner', 'worker', 'category', 'hash', 'identifier', 'round', 'transaction', 'type'];
  this.parameters = ['timestamp', 'miner', 'worker', 'category', 'confirmations', 'difficulty',
    'hash', 'height', 'identifier', 'luck', 'reward', 'round', 'solo', 'transaction', 'type'];

  // Handle String Parameters
  this.handleStrings = function(parameters, parameter) {
    return ` = '${ parameters[parameter] }'`;
  };

  // Handle Numerical Parameters
  this.handleNumbers = function(parameters, parameter) {
    const query = parameters[parameter];
    if (query.slice(0, 2) === 'lt') return ` < ${ query.replace('lt', '') }`;
    if (query.slice(0, 2) === 'le') return ` <= ${ query.replace('le', '') }`;
    if (query.slice(0, 2) === 'gt') return ` > ${ query.replace('gt', '') }`;
    if (query.slice(0, 2) === 'ge') return ` >= ${ query.replace('ge', '') }`;
    if (query.slice(0, 2) === 'ne') return ` != ${ query.replace('ne', '') }`;
    else return ` = ${ query }`;
  };

  // Handle Query Parameters
  /* istanbul ignore next */
  this.handleQueries = function(parameters, parameter) {
    if (_this.numbers.includes(parameter)) return _this.handleNumbers(parameters, parameter);
    if (_this.strings.includes(parameter)) return _this.handleStrings(parameters, parameter);
    else return ` = ${ parameters[parameter] }`;
  };

  // Handle Special Parameters
  this.handleSpecial = function(parameters, output) {
    if (parameters.order || parameters.direction) {
      output += ` ORDER BY ${ parameters.order || 'id' }`;
      output += ` ${ parameters.direction === 'ascending' ? 'ASC' : 'DESC' }`;
    }
    if (parameters.limit) output += ` LIMIT ${ parameters.limit }`;
    if (parameters.offset) output += ` OFFSET ${ parameters.offset }`;
    return output;
  };

  // Select Current Blocks Using Parameters
  this.selectCurrentBlocksMain = function(pool, parameters) {
    let output = `SELECT * FROM "${ pool }".current_blocks`;
    const filtered = Object.keys(parameters).filter((key) => _this.parameters.includes(key));
    filtered.forEach((parameter, idx) => {
      if (idx === 0) output += ' WHERE ';
      else output += ' AND ';
      output += `${ parameter }`;
      output += _this.handleQueries(parameters, parameter);
    });
    output = _this.handleSpecial(parameters, output);
    return output + ';';
  };

  // Build Blocks Values String
  this.buildCurrentBlocksMain = function(updates) {
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
  this.insertCurrentBlocksMain = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".current_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES ${ _this.buildCurrentBlocksMain(updates) }
      ON CONFLICT ON CONSTRAINT current_blocks_unique
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
  this.deleteCurrentBlocksMain = function(pool, rounds) {
    return `
      DELETE FROM "${ pool }".current_blocks
      WHERE round IN (${ rounds.join(', ') });`;
  };
};

module.exports = CurrentBlocks;
