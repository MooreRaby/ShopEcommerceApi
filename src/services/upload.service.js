'use strict';

const { cloudinary } = require('../configs/cloudinary.config');

//`  upload from url iamge

const uploadImageFromUrl = async () => {
    try {
        const urlImage = 'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lfgpj5oyv5o5e1'
        const folderName = 'product/shopId', newFileName = 'testdemo'

        const result = await cloudinary.uploader.upload(urlImage, {
            // public_id: newFileName
            folder: folderName,

        })

        console.log(result);
    } catch (error) {
        console.log('Error uploading image:: ', error);
    }
}

// 2. upload image from local storage

const uploadImageFromLocal = async ({
    path,
    folderName = 'product/8409'
}) => {
    try {
        const result = await cloudinary.uploader.upload(path, {
            public_id: 'thumb',
            folder: folderName,
        })

        console.log(result);
        return {
            image_url: result.secure_url,
            shopId: 8409
        }
    } catch (error) {
        console.log('Error uploading image: ' + error)
    }
}

module.exports = {
    uploadImageFromUrl, uploadImageFromLocal
}