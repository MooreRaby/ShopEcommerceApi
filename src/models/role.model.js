'use strict';

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Role'
const COLLECTION_NAME = 'Roles'

// const grant_list = [
//     { role: 'admin', resource: 'profile', action: 'update:any', attributes: '*' },
//     { role: 'admin', resource: 'balance', action: 'update:any', attributes: '*, !mount' },

//     { role: 'shop', resource: 'profile', action: 'update:own', attributes: '*' },
//     { role: 'shop', resource: 'balance', action: 'update:own', attributes: '*, !mount' },

//     { role: 'user', resource: 'profile', action: 'update:any', attributes: '*' },
//     { role: 'user', resource: 'profile', action: 'read:own', attributes: '*' },
// ]

const RoleSchema = new Schema({
    rol_name: { type: String, default: 'user', enum: [ 'user', 'shop', 'admin' ] },
    rol_slug: { type: String, require: true },
    rol_status: { type: String, default: 'active', enum: [ 'active', 'block', 'pending' ] },
    rol_description: { type: String, default: '' },
    rol_grants: [
        {
            resource: { type: Schema.Types.ObjectId, ref: 'Resource', required: true },
            actions: [ { type: String, required: true } ],
            attributes: { type: String, default: '*' }
        }
    ]
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, RoleSchema)