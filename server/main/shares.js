const Text = require('../../locales/index');

////////////////////////////////////////////////////////////////////////////////

// Main Shares Function
const Shares = function (logger, client, config, configMain) {

  const _this = this;
  this.logger = logger;
  this.client = client;
  this.config = config;
  this.configMain = configMain;
  this.pool = config.name;
  this.text = Text[configMain.language];

  // Stratum Variables
  process.setMaxListeners(0);
  this.forkId = process.env.forkId;

  // Handle Share Submissions
  this.handleShares = function(shareData, shareValid, blockValid, callback) {

    // Calculate Types of Submitted Share
    let shareType = 'valid';
    const minerType = utils.checkSoloMining(_this.config, shareData);
    const blockType = ['share', 'primary'].includes(blockType) ? 'primary' : 'auxiliary';
    if (shareData.error && shareData.error === 'job not found') shareType = 'stale';
    else if (shareData.error) shareType = 'invalid';

    // Calculate Features of Submitted Share
    const worker = blockType === 'primary' ? shareData.addrPrimary : shareData.addrAuxiliary;
    const blockDifficulty = blockType === 'primary' ? shareData.blockDiffPrimary : shareData.blockDiffAuxiliary;
    const shareDifficulty = shareType === 'valid' ? shareData.difficulty : -shareData.difficulty;

    // Build Output Share Representation
    const outputShare = {
      timestamp: Date.now(),
      miner: worker.split('.')[0],
      worker: worker,
      identifier: shareData.identifier || '',
      solo: minerType,
      work: shareDifficulty,
    }
  }
};

module.exports = Shares;
