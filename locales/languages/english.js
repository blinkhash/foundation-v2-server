// Builder Text
exports.builderThreadsText1 = (forkId) => `Fork ${ forkId } died, starting replacement worker ...`;
exports.builderThreadsText2 = () => 'No valid pool configs exist or are enabled. Check your configuration files';
exports.builderThreadsText3 = (numConfigs, numForks) => `Started ${ numConfigs } pool(s) on ${ numForks } thread(s)`;

// Database Text
exports.databaseCommandsText1 = (query, error) => `An error was thrown when trying to execute a query (${ query }): ${ error }`;
exports.databaseCommandsText2 = (error) => `An error was thrown when trying to handle checks and validations: ${ error }`;
exports.databaseCommandsText3 = (retries) => `An error was thrown by the database, waiting before attempting (#${ retries + 1}) to reconnect ...`;
exports.databaseCommandsText4 = () => 'Successfully reconnected to the master database, continuing execution ...';
exports.databaseCommandsText5 = () => 'Successfully reconnected to the worker database, continuing execution ...';
exports.databaseCommandsText6 = () => 'Unable to reconnect to master database, exceeded retry limits ...';
exports.databaseCommandsText7 = () => 'Unable to reconnect to worker database, exceeded retry limits ...';
exports.databaseSchemaText1 = (pool) => `Validated the ${ pool } master schema, initializing stratum ...`;
exports.databaseSchemaText2 = (pool) => `Validated the ${ pool } worker schema, initializing stratum ...`;
exports.databaseStartingText1 = (type) => `Started updating statistics and data for ${ type } rounds`;
exports.databaseStartingText2 = (type) => `Started handling checks and validation for ${ type } rounds`;
exports.databaseStartingText3 = (type) => `Started handling balances and payments for ${ type } rounds`;
exports.databaseStartingText4 = (type) => `Started updating metadata and rounds with submitted shares`;
exports.databaseUpdatesText1 = (type) => `Finished updating statistics and data for ${ type } rounds`;
exports.databaseUpdatesText2 = (type, rounds) => `Finished handling checks and validation for ${ type } rounds: (${ rounds })`;
exports.databaseUpdatesText3 = (type) => `Finished handling checks and validation for ${ type } rounds: (0)`;
exports.databaseUpdatesText4 = (type, rounds) => `Finished handling balances and payments for ${ type } rounds: (${ rounds })`;
exports.databaseUpdatesText5 = (type) => `Finished handling balances and payments for ${ type } rounds: (0)`;
exports.databaseUpdatesText6 = (shares) => `Finished updating metadata and rounds with submitted shares: (${ shares })`;
exports.databaseUpdatesText7 = (type) => `Finished updating metadata and rounds with submitted shares: (0)`;

// Shares Text
exports.sharesSubmissionsText1 = (difficulty, actual, address, ip) => `A share was accepted at difficulty ${ difficulty }/${ actual || 0 } by ${ address } [${ ip }]`;
exports.sharesSubmissionsText2 = (error, address, ip) => `A share was rejected (${ error }) from ${ address } [${ ip }]`;

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
exports.loaderCertificateText1 = () => 'There is an invalid key, certificate, or authority file specified for TLS. Check your configuration files';
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

// Website Text
exports.websiteErrorText1 = (error) => `The API call threw an unknown error: (${ error })`;
exports.websiteErrorText2 = () => 'The server was unable to handle your request. Verify your input or try again later';
exports.websiteErrorText3 = () => 'The requested pool was not found. Verify your input and try again';
exports.websiteErrorText4 = () => 'The requested method is not currently supported. Verify your input and try again';
exports.websiteStartingText1 = () => 'Enabling TLS/SSL encryption on API endpoints';
exports.websiteStartingText2 = (host, port) => `Validated the API configuration, initializing server on ${ host }:${ port } ...`;
exports.websiteValidationText1 = (parameter, accepted) => `Invalid query parameter specified (${ parameter }: ${ accepted }). Verify your input and try again`;
