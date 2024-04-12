'use strict';

const RESOURCE = require('../models/resource.model')
const ROLE = require('../models/role.model')
/**
 * new resource
 * @param {string} rol_name
 * @param {string} slug
 * @param {string} description
 */
const createResource = async ({
    name = 'profile',
    slug = 'p00001',
    description = ''
}) => {
    try {
        // 1.  check name or slug exists


        // 2. new resource
        const resource = await RESOURCE.create({
            src_name: name,
            src_slug: slug,
            src_description: description
        })

        return resource
    } catch (error) {
        return error.message
    }
}


const resourceList = async ({
    userId = 0,// admin
    limit = 30,
    offset = 0,
    search = ''
}) => {
    try {
        //1 . check admin ? middleware function

        //2. get list of resource
        const resources = await RESOURCE.aggregate([
            {
                $project: {
                    _id: 0,
                    name: "$src_name",
                    slug: "$src_slug",
                    description: "$src_description",
                    resourceId: "$_id",
                    createAt: 1
                }
            }
        ])

        return resources
    } catch (error) {
        return []
    }
}


const createRole = async ({
    name = 'shop',
    slug = 's00001',
    description = 'extend from shop or user',
    grants = []
}) => {
    try {
        // 1. check role exists


        //2. new role
        const role = await ROLE.create({
            rol_name: name,
            rol_slug: slug,
            rol_description: description,
            rol_grants: grants
        })

        return role
    } catch (error) {
        return error
    }
}


const roleList = async ({
    userId = 0,// admin
    limit = 30,
    offset = 0,
    search = ''
}) => {
    try {

    } catch (error) {

    }
}

module.exports = {
    createResource,
    resourceList,
    createRole,
    roleList
}