'use strict';

const User = require("../models/user.model"),
    bcrypt = require("bcrypt"),
    LocalStrategy = require("passport-local").Strategy,
    FacebookStrategy = require("passport-facebook").Strategy,
    GoogleStrategy = require('passport-google-oauth20').Strategy

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET,
    FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    passport.use(
        new FacebookStrategy(
            {
                clientID: FACEBOOK_APP_ID,
                clientSecret: FACEBOOK_APP_SECRET,
                callbackURL: "http://localhost:3000/v1/api/user/auth/facebook/callback",
            },
            async function (accessToken, refreshToken, profile, cb) {
                try {
                    let user = await User.findOne({ where: { facebookId: profile.id } });
                    if (!user) {
                        const email = profile.emails && profile.emails[ 0 ] && profile.emails[ 0 ].value;
                        const phone = profile.phoneNumbers && profile.phoneNumbers[ 0 ] && profile.phoneNumbers[ 0 ].value;

                        // Check if email or phone number already exists
                        if (email) {
                            const emailExists = await User.findOne({ where: { usr_email: email } });
                            if (emailExists) {
                                return cb(null, false, { message: 'Email already in use.' });
                            }
                        }

                        if (phone) {
                            const phoneExists = await User.findOne({ where: { usr_phone: phone } });
                            if (phoneExists) {
                                return cb(null, false, { message: 'Phone number already in use.' });
                            }
                        }

                        user = await User.create({
                            facebookId: profile.id,
                            usr_name: profile.displayName,
                            usr_email: email,
                            usr_phone: phone,
                        });
                    }
                    cb(null, user);
                } catch (error) {
                    cb(error, null);
                }
            }
        )
    );


    passport.use(

        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: 'http://localhost:3000/v1/api/user/auth/google/callback',
                passReqToCallback: true,
            },
            async function (accessToken, refreshToken, profile, cb) {
                console.log('tokenGG ' + accessToken);
                console.log('GOOGLE_CLIENT_ID ', GOOGLE_CLIENT_ID);
                try {
                    let user = await User.findOne({ where: { googleId: profile.id } });
                    if (!user) {
                        const email = profile.emails && profile.emails[ 0 ] && profile.emails[ 0 ].value;
                        const phone = profile.phoneNumbers && profile.phoneNumbers[ 0 ] && profile.phoneNumbers[ 0 ].value;

                        // Check if email or phone number already exists
                        if (email) {
                            const emailExists = await User.findOne({ where: { usr_email: email } });
                            if (emailExists) {
                                return cb(null, false, { message: 'Email already in use.' });
                            }
                        }

                        if (phone) {
                            const phoneExists = await User.findOne({ where: { usr_phone: phone } });
                            if (phoneExists) {
                                return cb(null, false, { message: 'Phone number already in use.' });
                            }
                        }

                        user = await User.create({
                            googleId: profile.id,
                            usr_name: profile.displayName,
                            usr_email: email,
                            usr_phone: phone,
                        });
                    }
                    cb(null, user);
                } catch (error) {
                    cb(error, null);
                }
            }
        )
    );





};
