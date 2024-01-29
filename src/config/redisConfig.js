// redisConfig.js

const redis = require('redis');

// Function to create a Redis client
function createRedisClient() {
    // Configuration for local and production environments
    let redisConfig = {
        url: 'redis://localhost:6379', // Default configuration for local development
    };

    // Override for production using environment variables
    if (process.env.NODE_ENV === 'production') {
        redisConfig = {
            url: process.env.REDIS_URL, // Production Redis URL
            password: process.env.REDIS_PASSWORD, // Production Redis password
            socket: {
                tls: true, // Use TLS connection in production if required
                rejectUnauthorized: false // This depends on your Redis provider's TLS configuration
            }
        };
    }

    // Create and configure the Redis client
    const client = redis.createClient(redisConfig);

    client.on('error', (err) => console.error('Redis Client Error', err));

    // Connect to Redis
    client.connect().catch(console.error);

    return client;
}

// Export the Redis client
module.exports = createRedisClient();
