const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const HistoricalTransactions = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Transaction
  this.selectHistoricalTransactionsTransaction = function(pool, transaction, type) {
    return `
      SELECT * FROM "${ pool }".historical_transactions
      WHERE transaction = '${ transaction }' AND type = '${ type }';`;
  };

  // Select Rows Using Type
  this.selectHistoricalTransactionsType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".historical_transactions
      WHERE type = '${ type }';`;
  };

  // Build Transactions Values String
  this.buildHistoricalTransactionsCurrent = function(updates) {
    let values = '';
    updates.forEach((transaction, idx) => {
      values += `(
        ${ transaction.timestamp },
        ${ transaction.amount },
        '${ transaction.transaction }',
        '${ transaction.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Transactions Data
  this.insertHistoricalTransactionsCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".historical_transactions (
        timestamp, amount,
        transaction, type)
      VALUES ${ _this.buildHistoricalTransactionsCurrent(updates) }
      ON CONFLICT DO NOTHING;`;
  };
};

module.exports = HistoricalTransactions;
