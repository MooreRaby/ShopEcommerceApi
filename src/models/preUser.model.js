'use strict';

const { model, Schema } = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = 'PreUser'
const COLLECTION_NAME = 'PreUsers'
// Declare the Schema of the Mongo model
const shopSchema = new Schema({
    pre_token: { type: String, required: true },
    pre_email: { type: String, required: true },
    tem_status: { type: String, default: 'pending', enum: [ 'pending', 'active', 'block' ] }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, shopSchema);