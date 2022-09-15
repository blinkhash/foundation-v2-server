const Text = require('../../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
const PoolPayments = function (logger, configMain) {

  const _this = this;
  this.logger = logger;
  this.configMain = configMain;
  this.text = Text[configMain.language];

  // Select Rows Using Current Round
  this.selectPoolPaymentsType = function(pool, type) {
    return `
      SELECT * FROM "${ pool }".pool_payments
      WHERE type = '${ type }';`;
  };

  // Build Payments Values String
  this.buildPoolPaymentsCurrent = function(updates) {
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

  // Insert Rows Using Payments Data
  this.insertPoolPaymentsCurrent = function(pool, updates) {
    return `
      INSERT INTO "${ pool }".pool_payments (
        timestamp, round, type)
      VALUES ${ _this.buildPoolPaymentsCurrent(updates) }
      ON CONFLICT ON CONSTRAINT pool_payments_unique
      DO NOTHING RETURNING round;`;
  };

  // Delete Rows From Current Rounds
  this.deletePoolPaymentsCurrent = function(pool, rounds) {
    return `
      DELETE FROM "${ pool }".pool_payments
      WHERE round IN (${ rounds.join(', ') });`;
  };
};

module.exports = PoolPayments;
