'use strict'

const express = require('express')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const CommentController = require('../../controllers/comment.controller')
const router = express.Router()

//
router.use(authenticationV2)
//
router.post('', asyncHandler(CommentController.createComment))
router.get('', asyncHandler(CommentController.getCommentsByParentId))
router.delete('', asyncHandler(CommentController.deleteComment))




module.exports = router