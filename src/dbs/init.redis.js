'use strict';

const redis = require('redis');
const { RedisErrorResponse } = require('../core/error.response')

let client = {}, statusConnectRedis = {
    CONNECT: 'connect',
    END: 'end',
    RECONNECT: 'reconnecting',
    ERROR: 'error',
    WARNING: 'warning',
    READY: 'ready'
}, connectionTimeout

const REDIS_CONNECT_TIMEOUT = 10000, REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: {
        vn: 'redis ngao roi anh ae oi',
        en: 'redis connect error'
    }
}

const handleTimeoutError = () => {
    connectionTimeout = setTimeout(() => {
        throw new RedisErrorResponse({
            message: REDIS_CONNECT_MESSAGE.message.vn,
            statusCode: REDIS_CONNECT_MESSAGE.code
        })
    }, REDIS_CONNECT_TIMEOUT)
}

const handleEventConnection = ({
    connectionRedis
}) => {

    connectionRedis.on(statusConnectRedis.CONNECT, () => {

        console.log(`connectionRedis - connection status: connected`);
        clearTimeout(connectionTimeout)
    })

    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`connectionRedis - connection status: disconnected`);

        //connect retry
        handleTimeoutError()
    })

    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`connectionRedis - connection status: reconnecting`);
        clearTimeout(connectionTimeout)
    })
    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`connectionRedis - connection status: error ${err}`);
        handleTimeoutError()
    })

}

const initRedis = () => {
    const instanceRedis = redis.createClient()
    client.instanceConnect = instanceRedis
    handleEventConnection({
        connectionRedis: instanceRedis
    })
}


const getRedis = () => client

const closeRedis = () => {

}

module.exports = {
    initRedis,
    getRedis,
    closeRedis
}