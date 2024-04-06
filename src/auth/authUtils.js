'use strict';

const JWT = require('jsonwebtoken');
const { asyncHandler } = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');
const { generateKeyPairSync } = require('node:crypto');
const ms = require('ms');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id',
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        //access token
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256', //sử dụng với asymmetric cryptography
            expiresIn: '2h',

        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256', //sử dụng với asymmetric cryptography
            expiresIn: '60 days',
        })

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error(`Error verifying:: ${err.message}`)
            } else {
                console.log(`Decoded:`, decode)
            }
        })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new Error(`Error verifying:: ${error.message}`)
    }
}

// const authentication = asyncHandler(async (req, res, next) => {
//     /*
//        1. check userId missing
//        2. get access token
//        3. verify access token
//        4. check user in db
//        5. check keystore with this userId 
//        6. return next
//     */
//     const userId = req.headers[ HEADER.CLIENT_ID ]
//     console.log(userId)
//     if (!userId) throw new AuthFailureError('INVALID REQUEST1')

//     //2
//     const keyStore = await findByUserId(userId)
//     if (!keyStore) throw new NotFoundError('Not found keyStore')

//     //3
//     const accessToken = req.headers[ HEADER.AUTHORIZATION ]
//     if (!accessToken) throw new AuthFailureError('INVALID REQUEST2')


//     try {
//         const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
//         if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid userId')
//         req.keyStore = keyStore


//         return next()
//     } catch (error) {
//         throw error
//     }
// })



const authenticationV2 = asyncHandler(async (req, res, next) => {
    /*
       1. check userId missing
       2. get access token
       3. verify access token
       4. check user in db
       5. check keystore with this userId 
       6. return next
    */
    const userId = req.headers[ HEADER.CLIENT_ID ]
    if (!userId) throw new AuthFailureError('Invalid Request')
    //2
    const keyStore = await findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Not found keyStore')

    //3
    if (req.headers[ HEADER.REFRESHTOKEN ]) {
        try {
            const refreshToken = req.headers[ HEADER.REFRESHTOKEN ]
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
            if (userId !== decodeUser.userId) throw new AuthFailureError(' Invalid Userid')
            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
            throw error
        }
    }
    const accessToken = req.headers[ HEADER.AUTHORIZATION ]
    if (!accessToken) throw new AuthFailureError('Invalid Request')
    try {

        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) throw new AuthFailureError(' Invalid Userid')
        req.keyStore = keyStore
        req.user = decodeUser // {userId, email}
        return next()
    } catch (error) {
        throw error
    }

})

const generateKeyPair = async () => {
    const {
        publicKey,
        privateKey,
    } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    });

    console.log(privateKey + 'private key');

    return {
        publicKey,
        privateKey,
    };
}


const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    // authentication,
    verifyJWT,
    authenticationV2,
    generateKeyPair
}