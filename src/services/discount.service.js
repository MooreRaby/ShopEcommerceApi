"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const { convertToObjectIdMongodb } = require("../utils");
const discount = require("../models/discount.model");
const { findAllProducts } = require("./product.service.xxx");
const {
    findAllDiscountCodesUnSelect,
    checkDiscountExists,
    findAllDiscountCodesSelect,
} = require("../models/repositories/discount.repo");

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            users_used,
            max_value,
            max_uses,
            uses_count,
            max_uses_per_user,
        } = payload;

        // kiem tra
        if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            throw new BadRequestError("Discount code has expried!");
        }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError("Start date must be before end_date");
        }

        // create index for discount code
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError("Discount exists!");
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === "all" ? [] : product_ids,
        });

        return newDiscount;
    }

    static async getAllDiscountCodesWithProduct({
        code,
        shopId,
        userId,
        limit,
        page,
    }) {
        // create index for discount_code
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError("discount not exists!");
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount;
        let products;
        if (discount_applies_to === "all") {
            // get all product
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: [ "product_name" ],
            });
        }

        if (discount_applies_to === "specific") {
            // get the products ids
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: [ "product_name" ],
            });
        }

        return products;
    }

    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodesSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true,
            },
            select: [ "discount_code", "discount_name" ],
            model: discount,
        });
        return discounts;
    }

    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });

        console.log(foundDiscount, 'xyz');

        if (!discount) throw new NotFoundError(`discount doesn't exist`);

        const { discount_is_active, discount_max_uses,
            discount_min_order_value,
            discount_users_used,
            discount_start_date,
            discount_end_date,
            discount_max_uses_per_user,
            discount_type,
            discount_value
        } = foundDiscount;

        if (!discount_is_active) throw new NotFoundError(`discount expried!`)
        if (!discount_max_uses) throw new NotFoundError(`discount are out!`)

        if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
            throw new NotFoundError(`discount code expried!`)

        }
        // check xem cos et gia tri toi thieu hay khong ?
        let totalOrder = 0
        if (discount_min_order_value > 0) {
            // get total
            totalOrder = products.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)
            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(`discount require a minimum order value of ${discount_min_order_value}`)
            }
        }

        if (discount_max_uses_per_user > 0) {
            const userDiscount = discount_users_used.find(user => user.userId === userId);
            if (userDiscount) {
                // Check if the user has already used the maximum allowed times
                if (userDiscount.usedCount >= discount_max_uses_per_user) {
                    throw new BadRequestError("You have already used the maximum allowed times for this discount.");
                } else {
                    // Update the user's used count for the discount
                    userDiscount.usedCount++;
                }
            } else {
                // User hasn't used the discount before, add it to the users_used array
                discount_users_used.push({ userId: userId, usedCount: 1 });
            }
        }

        // check xem discount nay laf fixed_amount
        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId),
        })

        return deleted
    }

    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {

                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            }
        })

        if (!foundDiscount) throw new NotFoundError(`discount doesn't exists`)

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })

        return result
    }
}


module.exports = DiscountService;