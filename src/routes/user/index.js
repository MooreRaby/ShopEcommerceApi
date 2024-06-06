'use strict'

const express = require('express')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const {  newUser , checkOtp ,signup, login, logout, authGG, authFb, authGoogleCallback, authFacebookCallback, handlerRefreshToken} = require('../../controllers/user.controller')
const router = express.Router()

router.post('/new_user', asyncHandler(newUser))
router.get('/welcome-back', asyncHandler(checkOtp))
router.post('/signup', asyncHandler(signup))
router.post('/login', asyncHandler(login))


// oauth
router.get('/auth/google', authGG)
router.get('/auth/facebook',authFb)

//callback
router.get('/auth/facebook/callback', asyncHandler(authGoogleCallback))
router.get('/auth/google/callback', asyncHandler(authFacebookCallback))

// authentication
router.use(authenticationV2)
router.post('/logout', asyncHandler(logout))
router.post('/handlerRefreshToken', asyncHandler(handlerRefreshToken))



module.exports = router