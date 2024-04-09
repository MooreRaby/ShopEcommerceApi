'use strict';
const USER = require('../models/user.model')
const { SuccessResponse } = require('../core/success.response')
const { BadRequestError} = require('../core/error.response')

const newUser = async ({
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

    return SuccessResponse({
        message: 'verified email user',
        metadata: {
            
        }
    })
}


module.exports = {
    newUser
}