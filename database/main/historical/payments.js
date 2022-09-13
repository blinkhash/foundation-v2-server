const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const HistoricalPayments = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Miner
  this.selectHistoricalPaymentsMiner = function(pool, miner, type) {
    return `
      SELECT * FROM "${ pool }".historical_payments
      WHERE miner = '${ miner }' AND type = '${ type }';`;
  };

  // Select Rows Using Worker
  this.selectHistoricalPaymentsWorker = function(pool, worker, type) {
    return `
      SELECT * FROM "${ pool }".historical_payments
      WHERE worker = '${ worker }' AND type = '${ type }';`;
  };

  // Select Rows Using Round
  this.selectHistoricalPaymentsRound = function(pool, round, type) {
    return `
      SELECT * FROM "${ pool }".historical_payments
      WHERE round = '${ round }' AND type = '${ type }';`;
  };

  // Select Rows Using Transaction
  this.selectHistoricalPaymentsTransaction = function(pool, transaction, type) {
    return `
      SELECT * FROM "${ pool }".historical_payments
      WHERE transaction = '${ transaction }' AND type = '${ type }';`;
  };

  // Select Rows Using Type
  this.selectHistoricalPaymentsType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".historical_payments
      WHERE type = '${ type }';`;
  };

  // Build Payments Values String
  this.buildHistoricalPaymentsCurrent = function(updates) {
    let values = '';
    updates.forEach((payment, idx) => {
      values += `(
        ${ payment.timestamp },
        '${ payment.miner }',
        '${ payment.worker }',
        ${ payment.amount },
        '${ payment.round }',
        '${ payment.transaction }',
        '${ payment.type }')`;
      if (idx < updates.length - 1) values += ', ';
    });
    return values;
  };

  // Insert Rows Using Payments Data
  this.insertHistoricalPaymentsCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".historical_payments (
        timestamp, miner, worker,
        amount, round, transaction,
        type)
      VALUES ${ _this.buildHistoricalPaymentsCurrent(updates) }
      ON CONFLICT DO NOTHING;`;
  };
};

module.exports = HistoricalPayments;
