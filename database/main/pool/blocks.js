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

  // Select Rows Using Identifier
  this.selectPoolBlocksIdentifier = function(pool, identifier, type) {
    return `
      SELECT * FROM "${ pool }".pool_blocks
      WHERE identifier = '${ identifier } AND type = '${ type }';`;
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
        ${ block.difficulty },
        '${ block.hash }',
        ${ block.height },
        '${ block.identifier }',
        ${ block.luck },
        ${ block.orphan },
        ${ block.reward },
        '${ block.round }',
        ${ block.solo },
        '${ block.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Hashrate Data
  this.insertPoolBlocksCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_blocks (
        timestamp, miner, worker,
        difficulty, hash, height,
        identifier, luck, orphan,
        reward, round, solo, type)
      VALUES ${ _this.buildPoolBlocksCurrent(updates) }
      ON CONFLICT ON CONSTRAINT pool_blocks_unique
      DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        miner = EXCLUDED.miner,
        worker = EXCLUDED.worker,
        difficulty = EXCLUDED.difficulty,
        hash = EXCLUDED.hash,
        height = EXCLUDED.height,
        identifier = EXCLUDED.identifier,
        luck = EXCLUDED.luck,
        orphan = EXCLUDED.orphan,
        reward = EXCLUDED.reward,
        round = EXCLUDED.round,
        solo = EXCLUDED.solo,
        type = EXCLUDED.type;`;
  };
};

module.exports = PoolBlocks;
