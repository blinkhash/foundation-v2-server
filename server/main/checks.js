const Text = require('../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Checks Function
const Checks = function (logger, client, config, configMain) {

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

  // Handle Blocks Updates
  this.handleCurrentBlocks = function(blocks) {

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

  // Handle Miners Updates
  this.handleCurrentMiners = function(miners, blockType) {

    // Return Miners Updates
    return Object.keys(miners).map((address) => {
      return {
        timestamp: Date.now(),
        miner: address,
        generate: miners[address].generate,
        immature: miners[address].immature,
        type: blockType,
      };
    });
  };

  // Handle Round Updates
  this.handleCurrentOrphans = function(rounds) {

    // Calculate Features of Rounds
    const timestamp = Date.now();
    const interval = _this.config.settings.interval.rounds;
    const recent = Math.round(timestamp / interval) * interval;

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
        current.times = Math.max(current.times, round.times);
        current.valid += round.valid || 0;
        current.work += round.work || 0;
      } else combined[identifier] = round;
    });

    // Return Round Updates
    return Object.keys(combined).map((identifier) => {
      const current = combined[identifier];
      return {
        timestamp: timestamp,
        recent: recent,
        miner: current.miner,
        worker: current.worker,
        identifier: current.identifier,
        invalid: current.invalid,
        round: 'current',
        solo: current.solo,
        stale: current.stale,
        times: current.times,
        type: current.type,
        valid: current.valid,
        work: current.work,
      };
    });
  };

  // Handle Round Failure Updates
  this.handleFailures = function(blocks, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Remove Finished Transactions from Table
    const transactionsDelete = blocks.map((block) => `'${ block.round }'`);
    transaction.push(_this.current.transactions.deleteCurrentTransactionsMain(
      _this.pool, transactionsDelete));

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Round Success Updates
  this.handleUpdates = function(blocks, rounds, payments, blockType, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Handle Block Categories Individually
    const flattened = blocks.flatMap((block) => block.round);
    const orphanBlocks = blocks.filter((block) => block.category === 'orphan');
    const orphanRounds = orphanBlocks.map((orphan) => rounds[flattened.indexOf(orphan.round)] || []);
    const immatureBlocks = blocks.filter((block) => block.category === 'immature');
    const generateBlocks = blocks.filter((block) => block.category === 'generate');

    // Handle Orphan Block Delete Updates
    const orphanBlocksDelete = orphanBlocks.map((block) => `'${ block.round }'`);
    if (orphanBlocksDelete.length >= 1) {
      transaction.push(_this.current.blocks.deleteCurrentBlocksMain(
        _this.pool, orphanBlocksDelete));
    }

    // Handle Immature Block Updates
    const immatureBlocksUpdates = _this.handleCurrentBlocks(immatureBlocks);
    if (immatureBlocksUpdates.length >= 1) {
      transaction.push(_this.current.blocks.insertCurrentBlocksMain(
        _this.pool, immatureBlocksUpdates));
    }

    // Handle Generate Block Updates
    const generateBlocksUpdates = _this.handleCurrentBlocks(generateBlocks);
    if (generateBlocksUpdates.length >= 1) {
      transaction.push(_this.current.blocks.insertCurrentBlocksMain(
        _this.pool, generateBlocksUpdates));
    }

    // Handle Miner Payment Updates
    const minersUpdates = _this.handleCurrentMiners(payments, blockType);
    if (minersUpdates.length >= 1) {
      transaction.push(_this.current.miners.insertCurrentMinersUpdates(
        _this.pool, minersUpdates));
    }

    // Handle Orphan Round Delete Updates
    const orphanRoundsDelete = orphanBlocks.map((block) => `'${ block.round }'`);
    if (orphanRoundsDelete.length >= 1) {
      transaction.push(_this.current.rounds.deleteCurrentRoundsMain(
        _this.pool, orphanRoundsDelete));
    }

    // Handle Orphan Round Updates
    const orphanRoundsUpdates = _this.handleCurrentOrphans(orphanRounds);
    if (orphanRoundsUpdates.length >= 1) {
      transaction.push(_this.current.rounds.insertCurrentRoundsMain(
        _this.pool, orphanRoundsUpdates));
    }

    // Handle Historical Orphan Block Updates
    const orphanBlocksUpdates = _this.handleCurrentBlocks(orphanBlocks);
    if (orphanBlocksUpdates.length >= 1) {
      transaction.push(_this.historical.blocks.insertHistoricalBlocksMain(
        _this.pool, orphanBlocksUpdates));
    }

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Primary Updates
  this.handlePrimary = function(blocks, callback) {

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
      const sending = false;
      _this.stratum.stratum.handlePrimaryRounds(blocks, (error, updates) => {
        if (error) _this.handleFailures(blocks, () => callback(error));
        else _this.stratum.stratum.handlePrimaryWorkers(blocks, rounds, sending, (results) => {
          _this.handleUpdates(updates, rounds, results, 'primary', () => callback(null));
        });
      });
    });
  };

  // Handle Auxiliary Updates
  this.handleAuxiliary = function(blocks, callback) {

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
      const sending = false;
      _this.stratum.stratum.handleAuxiliaryRounds(blocks, (error, updates) => {
        if (error) _this.handleFailures(blocks, () => callback(error));
        else _this.stratum.stratum.handleAuxiliaryWorkers(blocks, rounds, sending, (results) => {
          _this.handleUpdates(updates, rounds, results, 'auxiliary', () => callback(null));
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

    // Add Checks to Transactions Table
    if (checks.length >= 1) {
      transaction.push(_this.current.transactions.insertCurrentTransactionsMain(_this.pool, checks));
    }

    // Establish Separate Behavior
    transaction.push('COMMIT;');
    switch (blockType) {

    // Primary Behavior
    case 'primary':
      _this.executor(transaction, (results) => {
        results = results[1].rows.map((block) => block.round);
        const blocks = lookups[1].rows.filter((block) => results.includes((block || {}).round));

        // Blocks Exist to Validate
        if (blocks.length >= 1) {
          _this.handlePrimary(blocks, (error) => {
            const updates = [(error) ?
              _this.text.databaseCommandsText2(JSON.stringify(error)) :
              _this.text.databaseUpdatesText2(blockType, blocks.length)];
            _this.logger.debug('Checks', _this.config.name, updates);
            callback();
          });

        // No Blocks Exist to Validate
        } else {
          const updates = [_this.text.databaseUpdatesText3(blockType)];
          _this.logger.debug('Checks', _this.config.name, updates);
          callback();
        }
      });
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.executor(transaction, (results) => {
        results = results[1].rows.map((block) => block.round);
        const blocks = lookups[1].rows.filter((block) => results.includes((block || {}).round));

        // Blocks Exist to Validate
        if (blocks.length >= 1) {
          _this.handleAuxiliary(blocks, (error) => {
            const updates = [(error) ?
              _this.text.databaseCommandsText2(JSON.stringify(error)) :
              _this.text.databaseUpdatesText2(blockType, blocks.length)];
            _this.logger.debug('Checks', _this.config.name, updates);
            callback();
          });

        // No Blocks Exist to Validate
        } else {
          const updates = [_this.text.databaseUpdatesText3(blockType)];
          _this.logger.debug('Checks', _this.config.name, updates);
          callback();
        }
      });
      break;

    // Default Behavior
    default:
      callback();
      break;
    }
  };

  // Handle Checks Updates
  this.handleChecks = function(blockType, callback) {

    // Handle Initial Logging
    const starting = [_this.text.databaseStartingText2(blockType)];
    _this.logger.debug('Checks', _this.config.name, starting);

    // Calculate Checks Features
    const roundsWindow = Date.now() - _this.config.settings.window.rounds;

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.blocks.selectCurrentBlocksMain(_this.pool, { type: blockType }),
      _this.current.rounds.deleteCurrentRoundsInactive(_this.pool, roundsWindow),
      'COMMIT;'];

    // Establish Separate Behavior
    _this.executor(transaction, (lookups) => {
      _this.handleRounds(lookups, blockType, callback);
    });
  };

  // Start Checks Interval Management
  /* istanbul ignore next */
  this.handleInterval = function() {
    const minInterval = _this.config.settings.interval.checks * 0.75;
    const maxInterval = _this.config.settings.interval.checks * 1.25;
    const random = Math.floor(Math.random() * (maxInterval - minInterval) + minInterval);
    setTimeout(() => {
      _this.handleInterval();
      if (_this.config.primary.checks.enabled) _this.handleChecks('primary', () => {});
      if (_this.config.auxiliary && _this.config.auxiliary.enabled && _this.config.auxiliary.checks.enabled) {
        _this.handleChecks('auxiliary', () => {});
      }
    }, random);
  };

  // Start Checks Capabilities
  /* istanbul ignore next */
  this.setupChecks = function(stratum, callback) {
    _this.stratum = stratum;
    _this.handleInterval();
    callback();
  };
};

module.exports = Checks;
