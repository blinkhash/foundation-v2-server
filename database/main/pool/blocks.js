const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolBlocks = function (logger, configMain) {

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

  // Insert Rows Using Hashrate Data
  this.insertPoolBlocksCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_blocks (
        timestamp, miner, worker,
        difficulty, hash, height,
        identifier, luck, orphan,
        reward, round, solo, type)
      VALUES (
        ${ updates.timestamp },
        '${ updates.miner }',
        '${ updates.worker }',
        ${ updates.difficulty },
        '${ updates.hash }',
        ${ updates.height },
        '${ updates.identifier }',
        ${ updates.luck },
        ${ updates.orphan },
        ${ updates.reward },
        '${ updates.round }',
        ${ updates.solo },
        '${ updates.type }')
      ON CONFLICT ON CONSTRAINT pool_blocks_unique
      DO UPDATE SET
        timestamp = ${ updates.timestamp },
        miner = '${ updates.miner }',
        worker = '${ updates.worker }',
        difficulty = ${ updates.difficulty },
        hash = '${ updates.hash }',
        height = ${ updates.height },
        identifier = '${ updates.identifier }',
        luck = ${ updates.luck },
        orphan = ${ updates.orphan },
        reward = ${ updates.reward },
        round = '${ updates.round }',
        solo = ${ updates.solo },
        type = '${ updates.type }';`;
  };
};

module.exports = PoolBlocks;
