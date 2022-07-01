// Builder Text
exports.builderWorkersText1 = (forkId) => `Fork ${ forkId } died, starting replacement worker ...`;
exports.builderWorkersText2 = () => 'No valid pool configs exist or are enabled. Check your configuration files';
exports.builderWorkersText3 = (numConfigs, numForks) => `Started ${ numConfigs } pool(s) on ${ numForks } thread(s)`;

// Starting Text
exports.startingMessageText1 = (pool) => `Initializing server (${ pool }) ...`;
exports.startingMessageText2 = (coins) => `Connected coins: ${ coins }`;
exports.startingMessageText3 = (network) => `Active network: ${ network }`;
exports.startingMessageText4 = (ports) => `Active stratum ports: ${ ports }`;
exports.startingMessageText5 = (fee) => `Active recipient fee: ${ fee }%`;
exports.startingMessageText6 = (height) => `Current block height: ${ height }`;
exports.startingMessageText7 = (difficulty) => `Current network difficulty: ${ difficulty }`;
exports.startingMessageText8 = (peers) => `Current peer count: ${ peers }`;
exports.startingMessageText9 = () => 'Server initialized successfully ...';

// Loader Text
exports.loaderCertificateText1 = () => 'There is an invalid key, certificate, or authority file specified for TLS. Check your configuration files.';
exports.loaderDaemonsText1 = () => 'There are no primary daemons configured, so the pool cannot be started. Check your configuration files';
exports.loaderDaemonsText2 = () => 'There are no auxiliary daemons configured, so the pool cannot be started. Check your configuration files';
exports.loaderNamesText1 = () => 'Pool names are only allowed to be a single word. Check your configuration files';
exports.loaderNamesText2 = () => 'Two or more pool names are overlapping. Check your configuration files';
exports.loaderPortsText1 = (currentPort) => `Two or more ports are overlapping on ${ currentPort }. Check your configuration files`;
exports.loaderRecipientsText1 = () => 'The recipient percentage is greater than 100%. Check your configuration files';
exports.loaderRecipientsText2 = () => 'The recipient percentage is greater than 40%. Are you sure that you configured it properly?';
exports.loaderTemplateText1 = () => 'The pool template is not installed or does not exist. Check your configuration files';

// Stratum Text
exports.stratumRecipientsText1 = () => 'No recipients have been added, which means that no fees will be taken';
exports.stratumSharesText1 = (difficulty, actual, address, ip) => `A share was accepted at difficulty ${ difficulty }/${ actual || 0 } by ${ address } [${ ip }]`;
exports.stratumSharesText2 = (error, address, ip) => `A share was rejected (${ error }) from ${ address } [${ ip }]`;
