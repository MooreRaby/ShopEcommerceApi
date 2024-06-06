'use strict';

const redis = require('redis');
const { promisify } = require('util');
const { reservationInventory } = require('../models/repositories/inventory.repo');
const { getRedis } = require('../dbs/init.redis');

const { instanceConnect: redisClient } = getRedis();

const pexpireAsync = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2024_${productId}`;
    const retryTimes = 10;
    const expireTime = 3000; // milliseconds

    for (let i = 0; i < retryTimes; i++) {
        try {
            const result = await setnxAsync(key, expireTime);
            console.log(`result::`, result);
            if (result === 1) {
                const isReservation = await reservationInventory({ productId, quantity, cartId });
                if (isReservation.modifiedCount > 0) {
                    await pexpireAsync(key, expireTime);
                    return key;
                } else {
                    await delAsync(key); // Release the lock if reservation fails
                    return null;
                }
            } else {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
        } catch (error) {
            console.error(`Error in acquireLock: ${error.message}`);
            return null;
        }
    }

    return null;
};

const releaseLock = async (keyLock) => {
    try {
        return await delAsync(keyLock);
    } catch (error) {
        console.error(`Error in releaseLock: ${error.message}`);
        return null;
    }
};

module.exports = {
    acquireLock,
    releaseLock
};
