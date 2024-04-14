'use strict';

const USER = require('../models/user.model')
const { createUser } = require('../models/repositories/user.repo')
const { SuccessResponse } = require('../core/success.response')
const { BadRequestError, ErrorResponse } = require('../core/error.response');
const { sendEmailToken } = require('./emai.service');
const { checkEmailToken } = require('./otp.service');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT, generateKeyPair } = require("../auth/authUtils");
const bcrypt = require('bcrypt');
const { getInfoData, convertToObjectIdMongodb } = require('../utils');
const { findRoleByName } = require('../models/repositories/role.repo');

const newUserService = async ({
    email = null,
    captcha = null,
}) => {
    //1 check email exists
    const user = await USER.findOne({ email }).lean()

    // 2. if exits
    if (user) {
        return BadRequestError({
            message: 'Email already exists',
            statusCode: 409
        })
    }

    //3 send token via email user
    const result = await sendEmailToken({
        email
    })

    return {
        message: 'verified email user',
        metadata: {
            token: result
        }
    }
}

const checkLoginEmailTokenService = async ({
    token
}) => {
    try {

        //1  . check token in mode otp
        console.log(token + ' 1111');

        const { otp_email: email, otp_token } = await checkEmailToken({ token })
        console.log(email + " has email  ", otp_token);

        if (!email) throw new ErrorResponse('token not found')

        // 2. check email exists in user model
        const hasUser = await findUserByEmailWithLogin({
            email
        })

        if (hasUser) throw new ErrorResponse('Email already exists')

        // new User
        const passwordHash = await bcrypt.hash(email, 8);
        console.log('yyyyyyyy');

        // check role
        let role, roleId;
        role = await findRoleByName('user'); 
        if (!role ) {
            throw new ErrorResponse('role not found');
        } else {
            roleId = convertToObjectIdMongodb(role._id);
        }

        const newUser = await createUser({
            usr_id: 1,
            usr_slug: 'abcxyz',
            usr_email: email,
            usr_name: email,
            usr_password: passwordHash,
            usr_role: roleId
        })


        if (newUser) {
            console.log('created new user');
            // create public key, private key
            const { publicKey, privateKey } = await generateKeyPair()


            const keyStore = await KeyTokenService.createKeyToken({
                userId: newUser.usr_id,
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
                { userId: newUser.usr_id, email },
                publicKey,
                privateKey
            );
            console.log(`Created token success`, tokens);

            return {
                code: 201,
                message: 'verify success',
                metadata: {
                    user: getInfoData({
                        fileds: [ "usr_id", "usr_name", "usr_email" ],
                        object: newUser
                    }),
                    tokens
                }
            };
        }

    } catch (error) {
        console.log(error);
    }
}


const findUserByEmailWithLogin = async ({
    email
}) => {
    const user = await USER.findOne({ usr_email: email }).lean()
    return user
}

module.exports = {
    newUserService,
    checkLoginEmailTokenService
}