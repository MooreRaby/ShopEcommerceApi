'use strict';

const { response } = require("express");
const { SuccessResponse } = require("../core/success.response");
const { newUserService, checkLoginEmailTokenService } = require("../services/user.service");

class UserController {


    //new user
    newUser = async (req, res, next) => {
        const respond = await newUserService({
            email: req.body.email
        })

        new SuccessResponse(respond).send(res)
    }

    // check user token via email

    checkRegisterEmailToken = async (req, res, next) => {
        const { token = null } = req.query


        const respond = await checkLoginEmailTokenService({
            token
        })

        new SuccessResponse({
            message: "check registration",
            metadata: respond
        }).send(res)
    }
}

module.exports = new UserController()