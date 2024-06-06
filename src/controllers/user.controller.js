"use strict";

const { SuccessResponse } = require("../core/success.response");
const passport = require("passport");
const {
    newUserService,
    verifyOTPService,
    completeRegistrationService,
} = require("../services/user.service");
const GoogleStrategy = require('passport-google-oauth20').Strategy;


class UserController {
    //new user
    newUser = async (req, res, next) => {
        try {
            const respond = await newUserService({
                email: req.body.email,
            });

            new SuccessResponse(respond).send(res);
        } catch (error) {
            next(error);
        }
    };

    // check user token via email
    checkOtp = async (req, res, next) => {
        try {
            const { token = null } = req.query;

            if (!token) {
                throw new BadRequestError({
                    message: "Token is required",
                    statusCode: 400,
                });
            }

            const respond = await verifyOTPService({ token });

            new SuccessResponse({
                message: "Check registration",
                metadata: respond,
            }).send(res);
        } catch (error) {
            // If an error is thrown, use the error handling middleware
            next(error);
        }
    };

    // complete
    signup = async (req, res, next) => {
        try {
            const respond = await completeRegistrationService({
                email: req.body.email,
                password: req.body.password,
                username: req.body.username,
            });

            new SuccessResponse({
                statusCode: 201,
                message: "complete registration",
                metadata: respond,
            }).send(res);
        } catch (error) {
            next(error);
        }
    };


    // Handle Google OAuth authentication
    authGG = passport.authenticate('google', {
        scope: [ 'profile', 'email' ],
    });

    // Handle Facebook OAuth authentication
    authFb = passport.authenticate('facebook');

    // Handle Google OAuth callback
    authGoogleCallback = async(req, res, next) => {
        passport.authenticate('google', (err, user, info) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!user) {
                return res.status(400).json({ error: 'User not found' });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                new SuccessResponse({
                    message: "Logged in successfully",
                    metadata: { user },
                }).send(res);
            });
        })(req, res, next);
    };

    // Handle Facebook OAuth callback
    authFacebookCallback = async (req, res, next) => {
        passport.authenticate('facebook', (err, user, info) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!user) {
                return res.status(400).json({ error: 'User not found' });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                new SuccessResponse({
                    message: "Logged in successfully",
                    metadata: { user },
                }).send(res);
            });
        })(req, res, next);
    };


    login = async (req, res, next) => {
        try {

        } catch (error) {

        }
    }

    logout = async (req, res, next) => {
        try {

        } catch (error) {

        }
    }

    handlerRefreshToken = async (req, res, next) => {

    }
}

module.exports = new UserController();
