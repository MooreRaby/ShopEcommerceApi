'use strict'

const express = require('express')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const {  newUser , checkRegisterEmailToken } = require('../../controllers/user.controller')
const router = express.Router()

router.post('/new_user', asyncHandler(newUser))
router.get('/welcome-back', asyncHandler(checkRegisterEmailToken))



module.exports = router