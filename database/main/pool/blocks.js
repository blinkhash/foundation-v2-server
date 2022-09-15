const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolBlocks = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectPoolBlocksMiner = function(pool, miner, type) {
    return `
      SELECT * FROM "${ pool }".pool_blocks
      WHERE miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Rows Using Worker
  this.selectPoolBlocksWorker = function(pool, worker, type) {
    return `
      SELECT * FROM "${ pool }".pool_blocks
      WHERE worker = '${ worker }' AND type = '${ type }';`;
  };

  // Select Rows Using Category
  this.selectPoolBlocksCategory = function(pool, category, type) {
    return `
      SELECT * FROM "${ pool }".pool_blocks
      WHERE category = '${ category }' AND type = '${ type }';`;
  };

  // Select Rows Using Identifier
  this.selectPoolBlocksIdentifier = function(pool, identifier, type) {
    return `
      SELECT * FROM "${ pool }".pool_blocks
      WHERE identifier = '${ identifier }' AND type = '${ type }';`;
  };

  // Select Rows Using Miner
  this.selectPoolBlocksType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".pool_blocks
      WHERE type = '${ type }';`;
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
