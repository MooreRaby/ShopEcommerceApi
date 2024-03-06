'use strict'


const { model, Schema, Types } = require('mongoose');
const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

const productSchema = new Schema({
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: { type: String, required: true, enum: [ 'Electronics', 'Clothing', 'Furniture', 'Phone', 'Book', 'Cosmetic' ] },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, required: true }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})
// define the product type= clothing
const clothingSchema = new Schema({
    brand: { type: String, require: true },
    size: String,
    material: String
}, {
    collection: 'clothes',
    timestamps: true
})


const electronicSchema = new Schema({
    manufacturer: { type: String, require: true },
    model: String,
    color: String
}, {
    collection: 'electronics',
    timestamps: true
})

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronics', electronicSchema),
    clothing: model('Clothing',clothingSchema)
}