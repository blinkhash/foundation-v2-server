const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolTransactions = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Current Round
  this.selectPoolTransactionsType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".pool_transactions
      WHERE type = '${ type }';`;
  };

  // Build Transactions Values String
  this.buildPoolTransactionsCurrent = function(updates) {
    let values = '';
    updates.forEach((transaction, idx) => {
      values += `(
        ${ transaction.timestamp },
        '${ transaction.round }',
        '${ transaction.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Transactions Data
  this.insertPoolTransactionsCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_transactions (
        timestamp, round, type)
      VALUES ${ _this.buildPoolTransactionsCurrent(updates) }
      ON CONFLICT ON CONSTRAINT pool_transactions_unique
      DO NOTHING RETURNING round;`;
  };

  // Delete Rows From Current Rounds
  this.deletePoolTransactionsCurrent = function(pool, rounds) {
    return `
      DELETE FROM "${ pool }".pool_transactions
      WHERE round IN (${ rounds.join(', ') });`;
  };

  // Delete Rows From Current Round
  this.deletePoolTransactionsInactive = function(pool, timestamp) {
    return `
      DELETE FROM "${ pool }".pool_transactions
      WHERE timestamp < ${ timestamp };`;
  };
};

module.exports = PoolTransactions;
