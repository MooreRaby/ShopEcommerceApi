'use strict';

const { BadRequestError } = require('../core/error.response');
const { SuccessResponse } = require('../core/success.response');
const { uploadImageFromUrl, uploadImageFromLocal } = require('../services/upload.service');


class uploadController {

    uploadFile = async (req, res, next) => {
        new SuccessResponse({
            message: 'upload successfully',
            metadata: await uploadImageFromUrl()
        }).send(res);
    }

    uploadFileThumb = async (req, res, next) => {
        const { file } = req
        if (!file) {
            throw new BadRequestError("file missing")
        }
        new SuccessResponse({
            message: 'upload successfully',
            metadata: await uploadImageFromLocal({
                path: file.path
            })
        }).send(res);
    }
}

module.exports = new uploadController();