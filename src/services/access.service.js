"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const keyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT, generateKeyPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const KeyTokenService = require("./keyToken.service");
const keytokenModel = require("../models/keytoken.model");

const roleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN"
};

class AccessService {


    static handlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {

        const { userId, email } = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId)
            console.log('aaaaaaaa')
            throw new ForbiddenError('Something went wrong! Please login')
        }

        //check userId
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw AuthFailureError('shop not registered')

        //create 1 token pair
        const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)

        //update token 
        await keyStore.update({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken // da duoc su dung der lay token moi
            }
        })

        // await keytokenModel.updateOne(
        //     { user: holderToken.userId },
        //     {
        //         $set: {
        //             refreshToken: tokens.refreshToken
        //         },
        //         $addToSet: {
        //             refreshTokensUsed: refreshToken
        //         }
        //     }
        // )

        return {
            user,
            tokens
        }

    }

    // handler refresh token
    static handlerRefreshToken = async (refreshToken) => {

        // check token da duoc su dung chua
        const foundToken = await keyTokenService.findByRefreshTokenUsed(refreshToken)
        // neu co
        if (foundToken) {
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log({ userId, email })

            // xoa tat ca token trong keyStore
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something went wrong, please relogin')
        }

        // neu ko
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!holderToken) {
            throw new AuthFailureError('Shop not registered')
        }

        console.log('xxxxxxxxxxxx', refreshToken, " XXXXX ", holderToken)

        //verify token
        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
        console.log(`[2---]`, { userId, email })

        //check userId
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw AuthFailureError('shop not registered')

        //create 1 token pair
        const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)

        //update token 
        await keytokenModel.updateOne(
            { user: holderToken.userId },
            {
                $set: {
                    refreshToken: tokens.refreshToken
                },
                $addToSet: {
                    refreshTokensUsed: refreshToken
                }
            }
        )

        return {
            user: { userId, email }
        }

    }



    static logout = async (keyStore) => {
        console.log("abc  " + keyStore._id)
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({ delKey })
        return delKey
    }

    /* 
         check email
         match password
         create at and rt and save
         generate token
         get info data
        */
    static login = async ({ email, password, refreshToken = null }) => {
        const foundShop = await findByEmail({ email });
        //1
        if (!foundShop) {
            throw new BadRequestError("Error: Shop not registered");
        }
        //2
        const match = bcrypt.compare(password, foundShop.password);
        if (!match) throw new AuthFailureError("Authentication failed");

        //3
        const {publicKey, privateKey}  = generateKeyPair()

        //4
        const { _id: userId } = foundShop._id;
        const tokens = await createTokenPair(
            { userId, email },
            publicKey,
            privateKey
        );

        console.log(tokens, "Tokenssss");

        await KeyTokenService.createKeyToken({
            userId: userId,
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey
        });

        return {
            shop: getInfoData({
                fileds: [ "_id", "name", "email" ],
                object: foundShop
            }),
            tokens
        }
    }

    static signUp = async ({ name, email, password }) => {
        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop) {
            throw new BadRequestError("Error: Shop already exists");
        }

        const passwordHash = await bcrypt.hash(password, 8);
        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [ roleShop.SHOP ]
        });

        if (newShop) {
            // create public key, private key
            const {publicKey, privateKey} = generateKeyPair()
            console.log({ privateKey, publicKey });

            const keyStore = await keyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            });

            if (!keyStore) {
                return {
                    code: "xxxx",
                    message: "error: keyString is required"
                };
            }

            // created token pair
            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKey,
                privateKey
            );
            console.log(`Created token success`, tokens);

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({
                        fileds: [ "_id", "name", "email" ],
                        object: newShop
                    }),
                    tokens
                }
            };
        }
        return {
            code: 200,
            metadata: null
        };
    };

    

}

module.exports = AccessService;
