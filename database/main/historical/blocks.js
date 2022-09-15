const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const HistoricalBlocks = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectHistoricalBlocksMiner = function(pool, miner, type) {
    return `
      SELECT * FROM "${ pool }".historical_blocks
      WHERE miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Rows Using Worker
  this.selectHistoricalBlocksWorker = function(pool, worker, type) {
    return `
      SELECT * FROM "${ pool }".historical_blocks
      WHERE worker = '${ worker }' AND type = '${ type }';`;
  };

  // Select Rows Using Category
  this.selectHistoricalBlocksCategory = function(pool, category, type) {
    return `
      SELECT * FROM "${ pool }".historical_blocks
      WHERE category = '${ category }' AND type = '${ type }';`;
  };

  // Select Rows Using Identifier
  this.selectHistoricalBlocksIdentifier = function(pool, identifier, type) {
    return `
      SELECT * FROM "${ pool }".historical_blocks
      WHERE identifier = '${ identifier }' AND type = '${ type }';`;
  };

  // Select Rows Using Miner
  this.selectHistoricalBlocksType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".historical_blocks
      WHERE type = '${ type }';`;
  };

  // Build Blocks Values String
  this.buildHistoricalBlocksCurrent = function(updates) {
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
  this.insertHistoricalBlocksCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".historical_blocks (
        timestamp, miner, worker,
        category, confirmations,
        difficulty, hash, height,
        identifier, luck, reward,
        round, solo, transaction,
        type)
      VALUES ${ _this.buildHistoricalBlocksCurrent(updates) }
      ON CONFLICT DO NOTHING;`;
  };
};

module.exports = HistoricalBlocks;
