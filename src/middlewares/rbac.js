'use strict';

const { AuthFailureError } = require('../core/error.response');
const { roleList } = require('../services/rbac.service');
const rbac = require('./role.middleware')

/** 
 * @param {string} action // read, delete, or update
 * @param {*} resource // profile, balance,..
 */


const grantAccess = (action, resource) => {
    return async (req, res, next) => {
        try {
            rbac.setGrants(await roleList({
                userId: 9999
            }))
            const rol_name = req.query.role;
            console.log(rol_name,'rolname');
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