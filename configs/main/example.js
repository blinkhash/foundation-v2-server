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
config.client.host = '127.0.0.1';
config.client.port = 5432;
config.client.username = 'user1';
config.client.password = 'pass1';
config.client.database = 'db1';
config.client.tls = false;

// Zoneware Database Configuration (SQL)
config.zoneware = {};
config.zoneware.host = '127.0.0.1';
config.zoneware.port = 5432;
config.zoneware.username = 'user2';
config.zoneware.password = 'pass2';
config.zoneware.database = 'db2';
config.zoneware.tls = false;

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
config.server.host = '127.0.0.1';
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
