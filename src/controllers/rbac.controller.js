'use strict';

const { SuccessResponse } = require("../core/success.response");
const { createRole, roleList, resourceList, createResource } = require("../services/rbac.service");

const newRole = async (req, res, next) => {
    new SuccessResponse({
        message: 'create role',
        metadata: await createRole(req.body)
    }).send(res)
}

const newResource = async (req, res, next) => {
    new SuccessResponse({
        message: 'create resource',
        metadata: await createResource(req.body)
    }).send(res)
}


const listRoles = async (req, res, next) => {
    new SuccessResponse({
        message: 'get list roles',
        metadata: await roleList(req.body)
    }).send(res)
}

const listResources = async (req, res, next) => {
    new SuccessResponse({
        message: 'get list resources',
        metadata: await resourceList(req.body)
    }).send(res)
}



module.exports = {
    newRole,
    newResource,
    listRoles,
    listResources
}