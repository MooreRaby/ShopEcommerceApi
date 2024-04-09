'use strict';

const { model, Schema } = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = 'Template'
const COLLECTION_NAME = 'Templates'
// Declare the Schema of the Mongo model
const shopSchema = new Schema({
    tem_userId: { type: Number, required: true },
    tem_name: { type: String, required: true },
    tem_status: { type: String, default: 'active' },
    tem_html: {type: String, required: true}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, shopSchema);