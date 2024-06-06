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

    uploadFileThumb = async (req, res, next) => {// upload single thumb
        const { file } = req
        console.log(file + 'file uploaded');
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

    uploadMultipleFileThumb = async (req, res, next) => {// upload multiple file
        const { files } = req.body;
        console.log(files.length + ' files uploaded');
        if (!files || files.length === 0) {
            throw new BadRequestError("files missing");
        }
        const metadata = [];
        for (const file of files) {
            metadata.push(await uploadImageFromLocal({ path: file.path }));
        }
        
        new SuccessResponse({
            message: 'upload successfully',
            metadata
        }).send(res);
    };
}

module.exports = new uploadController();