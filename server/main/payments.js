const Text = require('../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Payments Function
const Payments = function (logger, client, config, configMain) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.config = config;
  this.configMain = configMain;
  this.pool = config.name;
  this.text = Text[configMain.language];

  // Database Variables
  this.executor = _this.client.commands.executor;
  this.current = _this.client.commands.current;
  this.historical = _this.client.commands.historical;

  // Combine Balances and Payments
  this.handleCurrentCombined = function(balances, payments) {

    // Iterate Through Payments
    const combined = Object.assign(balances, {});
    Object.keys(payments).forEach((address) => {
      if (address in combined) combined[address] += payments[address].generate;
      else combined[address] = payments[address].generate;
    });

    // Return Combined Payments
    return combined;
  };

  // Handle Miners Updates
  this.handleCurrentMiners = function(amounts, balances, blockType) {

    // Iterate Through Amounts
    const combined = {};
    Object.keys(amounts).forEach((address) => {
      combined[address] = { balance: 0, paid: amounts[address] };
    });

    // Iterate Through Balances
    Object.keys(balances).forEach((address) => {
      if (address in combined) combined[address].balance += balances[address];
      else combined[address] = { balance: balances[address], paid: 0 };
    });

    // Return Miners Updates
    return Object.keys(combined).map((miner) => {
      return {
        timestamp: Date.now(),
        miner: miner,
        balance: combined[miner].balance,
        paid: combined[miner].paid,
        type: blockType,
      };
    });
  };

  // Handle Historical Blocks Updates
  this.handleHistoricalBlocks = function(blocks) {

    // Return Blocks Updates
    return blocks.map((block) => {
      return {
        timestamp: Date.now(),
        submitted: block.submitted,
        miner: block.miner,
        worker: block.worker,
        category: block.category,
        confirmations: block.confirmations,
        difficulty: block.difficulty,
        hash: block.hash,
        height: block.height,
        identifier: block.identifier,
        luck: block.luck,
        reward: block.reward,
        round: block.round,
        solo: block.solo,
        transaction: block.transaction,
        type: block.type,
      };
    });
  };

  // Handle Historical Payments Updates
  this.handleHistoricalPayments = function(amounts, record, blockType) {

    // Return Payments Updates
    return Object.keys(amounts).map((miner) => {
      return {
        timestamp: Date.now(),
        miner: miner,
        amount: amounts[miner],
        transaction: record,
        type: blockType,
      };
    });
  };

  // Handle Historical Rounds Updates
  this.handleHistoricalRounds = function(rounds) {

    // Flatten Nested Round Array
    const combined = {};
    if (rounds.length >= 1) {
      rounds = rounds.reduce((a, b) => a.concat(b));
    }

    // Collect All Round Data
    rounds.forEach((round) => {
      const identifier = `${ round.worker }_${ round.solo }_${ round.round }_${ round.type }`;
      if (identifier in combined) {
        const current = combined[identifier];
        current.invalid += round.invalid || 0;
        current.stale += round.stale || 0;
        current.times += round.times || 0;
        current.valid += round.valid || 0;
        current.work += round.work || 0;
      } else combined[identifier] = round;
    });

    // Return Round Updates
    return Object.keys(combined).map((identifier) => {
      const current = combined[identifier];
      return {
        timestamp: Date.now(),
        miner: current.miner,
        worker: current.worker,
        identifier: current.identifier,
        invalid: current.invalid,
        round: current.round,
        solo: current.solo,
        stale: current.stale,
        times: current.times,
        type: current.type,
        valid: current.valid,
        work: current.work,
      };
    });
  };

  // Handle Historical Transactions Updates
  this.handleHistoricalTransactions = function(amounts, record, blockType) {

    // Calculate Total Amount
    let total = 0;
    Object.keys(amounts).forEach((address) => {
      total += amounts[address];
    });

    // Return Transactions Updates
    return {
      timestamp: Date.now(),
      amount: total,
      transaction: record,
      type: blockType,
    };
  };

  // Handle Round Failure Updates
  this.handleFailures = function(blocks, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Remove Finished Payments from Table
    const paymentsDelete = blocks.map((block) => `'${ block.round }'`);
    transaction.push(_this.current.payments.deleteCurrentPaymentsMain(
      _this.pool, paymentsDelete));

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Round Reset Updates
  this.handleReset = function(blockType, callback) {

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.miners.insertCurrentMinersReset(_this.pool, blockType),
      'COMMIT;'];

    // Insert Work into Database
    _this.executor(transaction, () => callback());
  };

  // Handle Round Success Updates
  this.handleUpdates = function(blocks, rounds, amounts, balances, record, blockType, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Handle Generate Block Delete Updates
    const generateBlocksDelete = blocks.map((block) => `'${ block.round }'`);
    if (generateBlocksDelete.length >= 1) {
      transaction.push(_this.current.blocks.deleteCurrentBlocksMain(
        _this.pool, generateBlocksDelete));
    }

    // Handle Miners Updates
    const minersUpdates = _this.handleCurrentMiners(amounts, balances, blockType);
    if (minersUpdates.length >= 1) {
      transaction.push(_this.current.miners.insertCurrentMinersPayments(
        _this.pool, minersUpdates));
    }

    // Handle Generate Round Delete Updates
    const generateRoundsDelete = blocks.map((block) => `'${ block.round }'`);
    if (generateRoundsDelete.length >= 1) {
      transaction.push(_this.current.rounds.deleteCurrentRoundsMain(
        _this.pool, generateRoundsDelete));
    }

    // Handle Historical Generate Block Updates
    const generateBlocksUpdates = _this.handleHistoricalBlocks(blocks);
    if (generateBlocksUpdates.length >= 1) {
      transaction.push(_this.historical.blocks.insertHistoricalBlocksMain(
        _this.pool, generateBlocksUpdates));
    }

    // Handle Historical Payments Updates
    const paymentsUpdates = _this.handleHistoricalPayments(amounts, record, blockType);
    if (paymentsUpdates.length >= 1) {
      transaction.push(_this.historical.payments.insertHistoricalPaymentsMain(
        _this.pool, paymentsUpdates));
    }

    // Handle Historical Generate Round Updates
    const generateRoundsUpdates = _this.handleHistoricalRounds(rounds);
    if (generateRoundsUpdates.length >= 1) {
      transaction.push(_this.historical.rounds.insertHistoricalRoundsMain(
        _this.pool, generateRoundsUpdates));
    }

    // Handle Historical Transactions Updates
    const transactionsUpdates = _this.handleHistoricalTransactions(amounts, record, blockType);
    if (record !== null) {
      transaction.push(_this.historical.transactions.insertHistoricalTransactionsMain(
        _this.pool, [transactionsUpdates]));
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Primary Updates
  this.handlePrimary = function(blocks, balances, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Add Round Lookups to Transaction
    blocks.forEach((block) => {
      const parameters = { solo: block.solo, round: block.round, type: 'primary' };
      transaction.push(_this.current.rounds.selectCurrentRoundsMain(
        _this.pool, parameters));
    });

    // Determine Workers for Rounds
    transaction.push('COMMIT;');
    _this.executor(transaction, (results) => {
      const rounds = results.slice(1, -1).map((round) => round.rows);

      // Collect Round/Worker Data and Amounts
      _this.stratum.stratum.handlePrimaryRounds(blocks, (error, updates) => {
        if (error) _this.handleFailures(blocks, () => callback(error));
        else _this.stratum.stratum.handlePrimaryWorkers(blocks, rounds, (results) => {
          const payments = _this.handleCurrentCombined(balances, results);

          // Validate and Send Out Primary Payments
          _this.stratum.stratum.handlePrimaryBalances(payments, (error) => {
            if (error) _this.handleFailures(updates, () => callback(error));
            else _this.stratum.stratum.handlePrimaryPayments(payments, (error, amounts, balances, transaction) => {
              if (error) _this.handleFailures(updates, () => callback(error));
              else _this.handleUpdates(updates, rounds, amounts, balances, transaction, 'primary', () => callback(null));
            });
          });
        });
      });
    });
  };

  // Handle Auxiliary Updates
  this.handleAuxiliary = function(blocks, balances, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Add Round Lookups to Transaction
    blocks.forEach((block) => {
      const parameters = { solo: block.solo, round: block.round, type: 'auxiliary' };
      transaction.push(_this.current.rounds.selectCurrentRoundsMain(
        _this.pool, parameters));
    });

    // Determine Workers for Rounds
    transaction.push('COMMIT;');
    _this.executor(transaction, (results) => {
      const rounds = results.slice(1, -1).map((round) => round.rows);

      // Collect Round/Worker Data and Amounts
      _this.stratum.stratum.handleAuxiliaryRounds(blocks, (error, updates) => {
        if (error) _this.handleFailures(updates, () => callback(error));
        else _this.stratum.stratum.handleAuxiliaryWorkers(blocks, rounds, (results) => {
          const payments = _this.handleCurrentCombined(balances, results);

          // Validate and Send Out Auxiliary Payments
          _this.stratum.stratum.handleAuxiliaryBalances(payments, (error) => {
            if (error) _this.handleFailures(updates, () => callback(error));
            else _this.stratum.stratum.handleAuxiliaryPayments(payments, (error, amounts, balances, transaction) => {
              if (error) _this.handleFailures(updates, () => callback(error));
              else _this.handleUpdates(updates, rounds, amounts, balances, transaction, 'auxiliary', () => callback(null));
            });
          });
        });
      });
    });
  };

  // Handle Payment Updates
  this.handleRounds = function(lookups, blockType, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Build Checks for Each Block
    const checks = [];
    if (lookups[1].rows[0]) {
      lookups[1].rows.forEach((block) => {
        checks.push({ timestamp: Date.now(), round: block.round, type: blockType });
      });
    }

    // Build Existing Miner Balances
    const balances = {};
    if (lookups[2].rows[0]) {
      lookups[2].rows.forEach((miner) => {
        if (miner.miner in balances) balances[miner.miner] += miner.balance;
        else balances[miner.miner] = miner.balance;
      });
    }

    // Add Checks to Payments Table
    if (checks.length >= 1) {
      transaction.push(_this.current.payments.insertCurrentPaymentsMain(_this.pool, checks));
    }

    // Establish Separate Behavior
    transaction.push('COMMIT;');
    switch (blockType) {

    // Primary Behavior
    case 'primary':
      _this.executor(transaction, (results) => {
        results = results[1].rows.map((block) => block.round);
        const blocks = lookups[1].rows.filter((block) => results.includes((block || {}).round));

        // Blocks Exist to Send Payments
        if (blocks.length >= 1) {
          _this.handlePrimary(blocks, balances, (error) => {
            const updates = [(error) ?
              _this.text.databaseCommandsText2(JSON.stringify(error)) :
              _this.text.databaseUpdatesText4(blockType, blocks.length)];
            _this.logger.debug('Payments', _this.config.name, updates);
            callback();
          });

        // No Blocks Exist to Send Payments
        } else {
          _this.handleReset(blockType, () => {
            const updates = [_this.text.databaseUpdatesText5(blockType)];
            _this.logger.debug('Payments', _this.config.name, updates);
            callback();
          });
        }
      });
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.executor(transaction, (results) => {
        results = results[1].rows.map((block) => block.round);
        const blocks = lookups[1].rows.filter((block) => results.includes((block || {}).round));

        // Blocks Exist to Send Payments
        if (blocks.length >= 1) {
          _this.handleAuxiliary(blocks, balances, (error) => {
            const updates = [(error) ?
              _this.text.databaseCommandsText2(JSON.stringify(error)) :
              _this.text.databaseUpdatesText4(blockType, blocks.length)];
            _this.logger.debug('Payments', _this.config.name, updates);
            callback();
          });

        // No Blocks Exist to Send Payments
        } else {
          _this.handleReset(blockType, () => {
            const updates = [_this.text.databaseUpdatesText5(blockType)];
            _this.logger.debug('Payments', _this.config.name, updates);
            callback();
          });
        }
      });
      break;

    // Default Behavior
    default:
      callback();
      break;
    }
  };

  // Handle Payments Updates
  this.handlePayments = function(blockType, callback) {

    // Handle Initial Logging
    const starting = [_this.text.databaseStartingText3(blockType)];
    _this.logger.debug('Payments', _this.config.name, starting);

    // Calculate Checks Features
    const roundsWindow = Date.now() - _this.config.settings.window.rounds;

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.blocks.selectCurrentBlocksMain(_this.pool, { category: 'generate', type: blockType }),
      _this.current.miners.selectCurrentMinersMain(_this.pool, { balance: 'gt0', type: blockType }),
      _this.current.rounds.deleteCurrentRoundsInactive(_this.pool, roundsWindow),
      'COMMIT;'];

    // Establish Separate Behavior
    _this.executor(transaction, (lookups) => {
      _this.handleRounds(lookups, blockType, callback);
    });
  };

  // Start Payments Interval Management
  /* istanbul ignore next */
  this.handleInterval = function() {
    const minInterval = _this.config.settings.interval.payments * 0.75;
    const maxInterval = _this.config.settings.interval.payments * 1.25;
    const random = Math.floor(Math.random() * (maxInterval - minInterval) + minInterval);
    setTimeout(() => {
      _this.handleInterval();
      if (_this.config.primary.payments.enabled) _this.handlePayments('primary', () => {});
      if (_this.config.auxiliary && _this.config.auxiliary.enabled && _this.config.auxiliary.payments.enabled) {
        _this.handlePayments('auxiliary', () => {});
      }
    }, random);
  };

  // Start Payments Capabilities
  /* istanbul ignore next */
  this.setupPayments = function(stratum, callback) {
    _this.stratum = stratum;
    _this.handleInterval();
    callback();
  };
};

module.exports = Payments;
