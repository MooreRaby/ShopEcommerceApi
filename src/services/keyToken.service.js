'use strict';

const ObjectId = require('mongoose').Types.ObjectId;
const keytokenModel = require('../models/keytoken.model');

class KeyTokenService {

    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {

            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })
            // console.log(tokens)
            // return tokens ? tokens.publicKey : null


            const filter = { user: userId }, update = {
                publicKey,
                privateKey,
                refreshTokensUsed: [],
                refreshToken
            }, options = { upsert: true, new: true }

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }


    static async findByUserId(userId) {
        return await keytokenModel.findOne({ user: new ObjectId(userId) })
    }

    static removeKeyById = async (id) => {
        return await keytokenModel.deleteOne({ _id: id})
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshTokensUsed: refreshToken }).lean()
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshToken: refreshToken  }).lean()
    }


    static deleteKeyById = async (userId) => {
        return await keytokenModel.deleteOne({ user: new ObjectId(userId) })
    }

    // todo: asymmetric cryptography(sử dụng với khoá bất đối xứng)
    // static createKeyToken = async ({ userId, publicKey }) => {
    //     try {
    //         const publicKeyString = publicKey.toString()
    //         const tokens = await keytokenModel.create({
    //             user: userId,
    //             publicKey: publicKeyString
    //         })
    //         console.log(tokens)
    //         return tokens ? tokens.publicKey : null
    //     } catch (error) {
    //         return error
    //     }
    // }
}

module.exports = KeyTokenService;