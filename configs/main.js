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
config.logger.logLevel = 'log';

// Database Configuration (SQL)
config.client = {};
config.client.host = '';
config.client.port = 5432;
config.client.username = '';
config.client.password = '';
config.client.database = '';
config.client.tls = true;

// Clustering Configuration
config.clustering = {};
config.clustering.enabled = true;
config.clustering.forks = 'auto';

// TLS Configuration
config.tls = {};
config.tls.ca = '';
config.tls.key = '';
config.tls.cert = '';

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
