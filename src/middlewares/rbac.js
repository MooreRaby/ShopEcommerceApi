'use strict';

const { AuthFailureError } = require('../core/error.response')
const rbac = require('./role.middleware')

/** 
 * @param {string} action // read, delete, or update
 * @param {*} resource // profile, balance,..
 */


const grantAccess = (action, resource) => {
    return async (req, res, next) => {
        try {
            const rol_name = req.query.rol_name
            const permission = rbac.can(rol_name)[ action ](resource);
            if (!permission.granted) {
                throw new AuthFailureError('you dont have enough permissions....')
            }

            next()
        } catch (err) {
            next(err)
        }
    }
}


module.exports = {
    grantAccess
}