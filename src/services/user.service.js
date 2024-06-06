'use strict';

const USER = require('../models/user.model');
const { createUser } = require('../models/repositories/user.repo');
const { BadRequestError, ErrorResponse } = require('../core/error.response');
const { sendEmailToken } = require('./email.service');
const { checkEmailToken } = require('./otp.service');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT, generateKeyPair } = require("../auth/authUtils");
const bcrypt = require('bcrypt');
const { getInfoData, convertToObjectIdMongodb } = require('../utils');
const { findRoleByName } = require('../models/repositories/role.repo');
const { getRedis } = require('../dbs/init.redis'); // Import getRedis

const { instanceConnect: redisClient } = getRedis();

const newUserService = async ({ email = null, captcha = null }) => {
    const cachedUser = await redisClient.get(`user:${email}`);
    let existingUser;

    if (cachedUser) {
        existingUser = JSON.parse(cachedUser);
    } else {
        existingUser = await USER.findOne({ usr_email: email }).lean();
        if (existingUser) {
            await redisClient.set(`user:${email}`, JSON.stringify(existingUser), 'EX', 600); // Cache for 10 mins
        }
    }

    if (existingUser) {
        if (existingUser.isEmailVerified) {
            if (existingUser.usr_status === 'active') {
                throw new BadRequestError({
                    message: 'Email already registered and completed',
                    statusCode: 409,
                });
            } else if (existingUser.usr_status === 'pending') {
                const result = await sendEmailToken({ email });
                return {
                    message: 'Verification email resent',
                    metadata: { token: result },
                };
            }
        } else {
            const result = await sendEmailToken({ email });
            return {
                message: 'Verification email resent',
                metadata: { token: result },
            };
        }
    } else {
        const result = await sendEmailToken({ email });
        const user = await USER.create({ usr_email: email, isEmailVerified: false, usr_status: 'pending' });
        if (!user) throw new ErrorResponse("user not created");

        await redisClient.set(`user:${email}`, JSON.stringify(user), 'EX', 600); // Cache for 10 mins

        return {
            message: 'Verification email sent',
            metadata: { token: result },
        };
    }
};

const verifyOTPService = async ({ token }) => {
    const verifiedEmail = await checkEmailToken({ token });

    if (!verifiedEmail) {
        throw new ErrorResponse('Invalid OTP');
    }

    const user = await USER.findOneAndUpdate(
        { usr_email: verifiedEmail.otp_email },
        { isEmailVerified: true },
        { new: true }
    );

    if (!user) {
        throw new ErrorResponse('User not found');
    }

    await redisClient.set(`user:${user.usr_email}`, JSON.stringify(user), 'EX', 600); // Update cache

    return {
        code: 200,
        message: 'Email verified',
        metadata: getInfoData({
            fileds: [ "_id", "usr_email", "isEmailVerified" ],
            object: user
        })
    };
};

const completeRegistrationService = async ({ email, password, username }) => {
    const cachedUser = await redisClient.get(`user:${email}`);
    let user;

    if (cachedUser) {
        user = JSON.parse(cachedUser);
    } else {
        user = await USER.findOne({ usr_email: email }).lean();
        if (user) {
            await redisClient.set(`user:${email}`, JSON.stringify(user), 'EX', 600); // Cache for 10 mins
        }
    }

    if (!user) {
        throw new ErrorResponse('Email not found');
    }

    if (!user.isEmailVerified) {
        throw new ErrorResponse('Email not verified');
    }

    if (user.usr_status === 'active' && user.usr_password) {
        throw new ErrorResponse('Registration already completed');
    }

    const passwordHash = await bcrypt.hash(password, 8);

    const role = await findRoleByName('user');
    if (!role) {
        throw new ErrorResponse('Role not found');
    }

    const updatedUser = await USER.findOneAndUpdate(
        { usr_email: email },
        {
            usr_slug: username,
            usr_name: username,
            usr_password: passwordHash,
            usr_role: convertToObjectIdMongodb(role._id),
            usr_status: 'active'
        },
        { new: true }
    );

    await redisClient.set(`user:${email}`, JSON.stringify(updatedUser), 'EX', 600); // Update cache

    const { publicKey, privateKey } = await generateKeyPair();

    const keyStore = await KeyTokenService.createKeyToken({
        userId: updatedUser._id,
        publicKey,
        privateKey
    });

    if (!keyStore) {
        throw new ErrorResponse("Error: keyString is required");
    }

    const tokens = await createTokenPair(
        { userId: updatedUser._id, email },
        publicKey,
        privateKey
    );

    return {
        code: 201,
        message: 'Signup complete',
        metadata: {
            user: getInfoData({
                fileds: [ "_id", "usr_name", "usr_email" ],
                object: updatedUser
            }),
            tokens
        }
    };
};

const findUserByEmailWithLogin = async ({ email }) => {
    const cachedUser = await redisClient.get(`user:${email}`);
    if (cachedUser) {
        return JSON.parse(cachedUser);
    }

    const user = await USER.findOne({ usr_email: email }).lean();
    if (user) {
        await redisClient.set(`user:${email}`, JSON.stringify(user), 'EX', 600); // Cache for 10 mins
    }
    return user;
}

module.exports = {
    newUserService,
    verifyOTPService,
    completeRegistrationService
};
