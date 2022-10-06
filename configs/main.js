/*
 *
 * Example (Main)
 *
 */

// Main Configuration
////////////////////////////////////////////////////////////////////////////////

// Miscellaneous Configuration
const config = {};
config.identifier = '';
config.language = 'english';

// Logger Configuration
config.logger = {};
config.logger.logColors = true;
config.logger.logLevel = 'debug';

// Database Configuration (SQL)
config.client = {};
config.client.host = '38.242.139.65';
config.client.port = 5432;
config.client.username = 'postgres';
config.client.password = '62mChkvZ3Jqq8C__rZbaFPM';
config.client.database = 'foundation3';
config.client.tls = true;

// Clustering Configuration
config.clustering = {};
config.clustering.enabled = true;
config.clustering.forks = 'auto';

// TLS Configuration
config.tls = {};
config.tls.ca = 'rootCA.crt';
config.tls.key = 'server.key';
config.tls.cert = 'server.crt';

// Server Configuration
config.server = {};
config.server.host = '0.0.0.0';
config.server.port = 3001;
config.server.tls = false;

// Cache Configuration
config.server.cache = {};
config.server.cache.enabled = true;
config.server.cache.timing = '1 minute';

// Limiter Configuration
config.server.limiter = {};
config.server.limiter.enabled = true;
config.server.limiter.window = 900000; // ms
config.server.limiter.maximum = 100;

// Export Configuration
module.exports = config;
