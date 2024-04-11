'use strict';

const cloudinary = require('cloudinary').v2

//return "https" URLs by setting secure: true
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
})


module.exports = {
    cloudinary
}