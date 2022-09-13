const Text = require('../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Rounds Function
const Rounds = function (logger, client, config, configMain) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.config = config;
  this.configMain = configMain;
  this.pool = config.name;
  this.text = Text[configMain.language];

  // Database Variables
  this.executor = _this.client.commands.executor;
  this.current = _this.client.commands.pool;
  this.historical = _this.client.commands.historical;

  // Handle Historical Rounds Updates
  this.handleHistoricalRounds = function(workers) {

    // Flatten Nested Worker Array
    if (workers.length >= 1) {
      workers = workers.reduce((a, b) => a.concat(b));
    }

    // Return Rounds Updates
    return workers.map((worker) => {
      return {
        timestamp: Date.now(),
        miner: worker.miner,
        worker: worker.worker,
        identifier: worker.identifier,
        invalid: worker.invalid,
        round: worker.round,
        solo: worker.solo,
        stale: worker.stale,
        times: worker.times,
        type: worker.type,
        valid: worker.valid,
        work: worker.work,
      };
    });
  };

  // Handle Blocks Updates
  this.handleBlocks = function(blocks) {

    // Return Blocks Updates
    return blocks.map((block) => {
      return {
        timestamp: Date.now(),
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
  this.handleMiners = function(miners) {

    // Return Miners Updates
    return Object.keys(miners).map((identifier) => {
      const details = identifier.split('_');
      return {
        timestamp: Date.now(),
        miner: details[0],
        generate: miners[identifier].generate,
        immature: miners[identifier].immature,
        solo: details[1],
        type: details[2],
      };
    });
  };

  // Handle Round Updates
  this.handleOrphans = function(workers) {

    // Flatten Nested Worker Array
    const combined = {};
    if (workers.length >= 1) {
      workers = workers.reduce((a, b) => a.concat(b));
    }

    // Collect All Worker Data
    workers.forEach((worker) => {
      const identifier = `${ worker.miner }_${ worker.solo }_${ worker.type }`;
      if (identifier in combined) {
        const current = combined[identifier];
        current.invalid += worker.invalid;
        current.stale += worker.stale;
        current.times = Math.max(current.times, worker.times);
        current.valid += worker.valid;
        current.work += worker.work;
      } else combined[identifier] = worker;
    });

    // Return Round Updates
    return Object.keys(combined).map((identifier) => {
      const current = combined[identifier];
      return {
        timestamp: Date.now(),
        miner: current.miner,
        worker: current.worker,
        round: current.round,
        identifier: current.identifier,
        invalid: current.invalid,
        solo: current.solo,
        stale: current.stale,
        times: current.times,
        type: current.type,
        valid: current.valid,
        work: current.work,
      };
    });
  };

  // Handle Round Success Updates
  this.handleUpdates = function(blocks, workers, payments, blockType, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Handle Block Categories Individually
    const rounds = blocks.flatMap((block) => block.round);
    const orphanBlocks = blocks.filter((block) => block.category === 'orphan');
    const orphanWorkers = orphanBlocks.map((orphan) => workers[rounds.indexOf(orphan.round)]);
    const immatureBlocks = blocks.filter((block) => block.category === 'immature');
    const generateBlocks = blocks.filter((block) => block.category === 'generate');

    // Handle Orphan Block Delete Updates
    const orphanBlocksDelete = orphanBlocks.map((block) => `'${ block.round }'`);
    if (orphanBlocksDelete.length >= 1) {
      transaction.push(_this.current.blocks.deletePoolBlocksCurrent(
        _this.pool, orphanBlocksDelete));
    }

    // Handle Immature Block Updates
    const immatureBlocksUpdates = _this.handleBlocks(immatureBlocks);
    if (immatureBlocksUpdates.length >= 1) {
      transaction.push(_this.current.blocks.insertPoolBlocksCurrent(
        _this.pool, immatureBlocksUpdates));
    }

    // Handle Generate Block Updates
    const generateBlocksUpdates = _this.handleBlocks(generateBlocks);
    if (generateBlocksUpdates.length >= 1) {
      transaction.push(_this.current.blocks.insertPoolBlocksCurrent(
        _this.pool, generateBlocksUpdates));
    }

    // Handle Miner Payment Updates
    const minersUpdates = _this.handleMiners(payments, blockType);
    if (minersUpdates.length >= 1) {
      transaction.push(_this.current.miners.insertPoolMinersUpdates(
        _this.pool, minersUpdates));
    }

    // Handle Orphan Round Delete Updates
    const orphanRoundsDelete = orphanBlocks.map((block) => `'${ block.round }'`);
    if (orphanRoundsDelete.length >= 1) {
      transaction.push(_this.current.rounds.deletePoolRoundsCurrent(
        _this.pool, orphanRoundsDelete));
    }

    // Handle Orphan Round Updates
    const orphanRoundsUpdates = _this.handleOrphans(orphanWorkers);
    if (orphanRoundsUpdates.length >= 1) {
      transaction.push(_this.current.rounds.insertPoolRoundsCurrent(
        _this.pool, orphanRoundsUpdates));
    }

    // Handle Historical Orphan Block Updates
    const orphanBlocksUpdates = _this.handleBlocks(orphanBlocks);
    if (orphanBlocksUpdates.length >= 1) {
      transaction.push(_this.historical.blocks.insertHistoricalBlocksCurrent(
        _this.pool, orphanBlocksUpdates));
    }

    // Remove Finished Transactions from Table
    const transactionsDelete = blocks.map((block) => `'${ block.round }'`);
    transaction.push(_this.current.transactions.deletePoolTransactionsCurrent(
      _this.pool, transactionsDelete));

    // Insert Work into Database
    transaction.push('COMMIT;');
    _this.executor(transaction, () => callback());
  };

  // Handle Primary Updates
  this.handlePrimary = function(blocks, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Add Worker Lookups to Transaction
    blocks.forEach((block) => {
      transaction.push(_this.current.rounds.selectPoolRoundsSpecific(
        _this.pool, block.solo, block.round, 'primary'));
    });

    // Determine Workers for Rounds
    transaction.push('COMMIT;');
    _this.executor(transaction, (results) => {
      const workers = results.slice(1, -1).map((round) => round.rows);
      _this.stratum.stratum.handlePrimaryRounds(blocks, (error, updates) => {
        if (error) callback(error);
        else _this.stratum.stratum.handlePrimaryWorkers(blocks, workers, (results) => {
          _this.handleUpdates(updates, workers, results, 'primary', () => callback(null));
        });
      });
    });
  };

  // Handle Auxiliary Updates
  this.handleAuxiliary = function(blocks, callback) {

    // Build Combined Transaction
    const transaction = ['BEGIN;'];

    // Add Worker Lookups to Transaction
    blocks.forEach((block) => {
      transaction.push(_this.current.rounds.selectPoolRoundsSpecific(
        _this.pool, block.solo, block.round, 'auxiliary'));
    });

    // Determine Workers for Rounds
    transaction.push('COMMIT;');
    _this.executor(transaction, (results) => {
      const workers = results.slice(1, -1).map((round) => round.rows);
      _this.stratum.stratum.handleAuxiliaryRounds(blocks, (error, updates) => {
        if (error) callback(error);
        else _this.stratum.stratum.handleAuxiliaryWorkers(blocks, workers, (results) => {
          _this.handleUpdates(updates, workers, results, 'auxiliary', () => callback(null));
        });
      });
    });
  };

  // Handle Payment Updates
  this.handleChecks = function(lookups, blockType) {

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
      transaction.push(_this.current.transactions.insertPoolTransactionsCurrent(_this.pool, checks));
    }

    // Establish Separate Behavior
    transaction.push('COMMIT;');
    switch (blockType) {

    // Primary Behavior
    case 'primary':
      _this.executor(transaction, (results) => {
        results = results[1].rows.map((block) => block.round);
        const blocks = lookups[1].rows.filter((block) => results.includes((block || {}).round));
        if (blocks.length >= 1) {
          _this.handlePrimary(blocks, (error) => {
            const rounds = blocks.map((block) => block.round);
            const updates = [(error) ?
              _this.text.databaseCommandsText2(JSON.stringify(error)) :
              _this.text.databaseUpdatesText2(blockType, rounds.join(', '))];
            _this.logger.log('Rounds', _this.config.name, updates);
          });

        // No Blocks Exist to Validate
        } else {
          const updates = [_this.text.databaseUpdatesText3(blockType)];
          _this.logger.log('Rounds', _this.config.name, updates);
        }
      });
      break;

    // Auxiliary Behavior
    case 'auxiliary':
      _this.executor(transaction, (results) => {
        results = results[1].rows.map((block) => block.round);
        const blocks = lookups[1].rows.filter((block) => results.includes((block || {}).round));

        // Block Exist to Validate
        if (blocks.length >= 1) {
          _this.handleAuxiliary(blocks, (error) => {
            const rounds = blocks.map((block) => block.round);
            const updates = [(error) ?
              _this.text.databaseCommandsText2(JSON.stringify(error)) :
              _this.text.databaseUpdatesText2(blockType, rounds.join(', '))];
            _this.logger.log('Rounds', _this.config.name, updates);
          });

        // No Blocks Exist to Validate
        } else {
          const updates = [_this.text.databaseUpdatesText3(blockType)];
          _this.logger.log('Rounds', _this.config.name, updates);
        }
      });
      break;

    // Default Behavior
    default:
      break;
    }
  };

  // Handle Rounds Updates
  this.handleRounds = function(blockType) {

    // Handle Initial Logging
    const starting = [_this.text.databaseStartingText2(blockType)];
    _this.logger.log('Rounds', _this.config.name, starting);

    // Build Combined Transaction
    const transaction = [
      'BEGIN;',
      _this.current.blocks.selectPoolBlocksType(_this.pool, blockType),
      'COMMIT;'];

    // Establish Separate Behavior
    _this.executor(transaction, (lookups) => {
      _this.handleChecks(lookups, blockType);
    });
  };

  // Start Rounds Interval Management
  /* istanbul ignore next */
  this.handleInterval = function() {
    const random = Math.floor(Math.random() * (180 - 60) + 60);
    setTimeout(() => {
      _this.handleInterval();
      _this.handleRounds('primary');
      if (_this.config.auxiliary && _this.config.auxiliary.enabled) {
        _this.handleRounds('auxiliary');
      }
    }, random * 1000);
  };

  // Start Rounds Capabilities
  /* istanbul ignore next */
  this.setupRounds = function(stratum, callback) {
    _this.stratum = stratum;
    _this.handleInterval();
    callback();
  };
};

module.exports = Rounds;
