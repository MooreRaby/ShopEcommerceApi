'use strict';

const mongoose = require('mongoose');
const { db: { host, name, port } } = require('../configs/config.mongodb');
const connectString = `mongodb://${host}:${port}/${name}`;

const { countConnect } = require('../helpers/check.connect'); // Assuming this function exists

// Improve logging with detailed error messages and connection state
const logConnection = (message, err = null) => {
    console.log(`${message}: ${connectString}`);
    if (err) {
        console.error('Error:', err);
    } else {
        console.log(`Connection count: ${countConnect()}`); // Call countConnect only on success
    }
};

class Database {
    constructor () {
        this.connect();
    }

    // Enhanced connect function with improved retry logic
    async connect(retryAttempt = 0) {
        const reconnectDelay = 5000; // Time in milliseconds between retries

        try {
            await mongoose.connect(connectString, {
                maxPoolSize: 50,
                useNewUrlParser: true, // Ensure compatibility with newer MongoDB versions
                useUnifiedTopology: true, // For Mongoose 6+
                // Consider adding reconnect options if necessary (see below)
            });

            logConnection('Connected successfully');

        } catch (err) {
            logConnection('Connection failed:', err);

            // Implement exponential backoff retry logic (optional)
            const maxRetries = 5; // Adjust as needed
            if (retryAttempt < maxRetries) {
                console.warn(`Retrying connection in ${reconnectDelay / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, reconnectDelay));
                await this.connect(retryAttempt + 1);
            } else {
                console.error('Failed to connect to MongoDB after retries. Exiting...');
                process.exit(1); // Exit with an error code
            }
        }
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;
