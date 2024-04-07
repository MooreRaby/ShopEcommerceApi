'use strict';

const CommentService = require('../services/comment.service')
const { SuccessResponse } = require('../core/success.response')

class CommentController {

    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'create new comment',
            metadata: await CommentService.createComment(req.body)
        }).send(res)
    }


    deleteComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'delete comment',
            metadata: await CommentService.deleteComment(req.body)
        }).send(res)
    }


    getCommentsByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: 'get comment by parent id',
            metadata: await CommentService.getCommentsByParentId(req.query)
        }).send(res)
    }
}

module.exports = new CommentController()