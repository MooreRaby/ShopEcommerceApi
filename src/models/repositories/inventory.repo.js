'use strict';

const { convertToObjectIdMongodb } = require('../../utils');
const { inventory } = require('../inventory.model');
const { Types } = require('mongoose');

const insertInventory = async ({
    productId, shopId, stock, location = 'unKnown'
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_location: location,
        inven_shopId: shopId
    });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
    const query = {
        inven_productId: convertToObjectIdMongodb(productId),
        inven_stock: { $gte: quantity }
    };

    const updateSet = {
        $inc: {
            inven_stock: -quantity
        },
        $push: {
            inven_reservations: {
                quantity,
                cartId,
                createdOn: new Date()
            }
        }
    };

    const options = { new: true };

    return await inventory.updateOne(query, updateSet, options);
};

module.exports = {
    insertInventory,
    reservationInventory
};
