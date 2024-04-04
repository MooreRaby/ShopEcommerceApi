'use strict';

const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const order = require('../models/order.model')
class CheckoutService {


    static async checkoutReview({
        cartId, userId, shop_order_ids
    }) {
        //check cartId ton tai khong?
        const foundCart = await findCartById(cartId)
        if (!foundCart) throw new BadRequestError('Cart does not exists!')


        const checkout_order = {
            totalPrice: 0, // tong tien hang
            feeShip: 0, // phi van chuyen
            totalDiscount: 0, // tong tien discount giam gia
            totalCheckout: 0 // thong thanh toan
        }, shop_order_ids_new = []


        // tinh tong tien bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[ i ]
            //check product available
            const checkProductServer = await checkProductByServer(item_products)
            console.log('checkProductServer::, checkProductServer')
            if (!checkProductServer[ 0 ]) throw new BadRequestError('order wrong!!!')

            // tong tien don hang
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            // tong tien truowc khi xu ly
            checkout_order.totalPrice + checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // tine truoc khi giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }
            // neu shop_discounts ton tai > 0, check xem co hop le hay khong
            if (shop_discounts.length > 0) {
                // gia su chi co mot discount
                // get amount discount
                const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
                    codeId: shop_discounts[ 0 ].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                }) 
                // tong cong discount giam gia
                checkout_order.totalDiscount += discount
                // neu tien giam gia lớn hơn 0
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }


        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }

    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }) {
        const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids_new
        })

        // check lai mot lan xem qua ton kho hay ko?
        // get new array products

        const products = shop_order_ids_new.flatMap(order => order.item_products)
        console.log(`[1]:`, products);
        const acquireProducts = []
        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[ i ]
            const keyLock = await acquireLock(productId, quantity, cartId)
            acquireProducts.push(keyLock ? true : false)
            if (keyLock) {
                await releaseLock(keyLock)
            }
        }

        // check if có mot san pham hay hang ton kho

        if (acquireProducts.includes(false)) {
            throw new BadRequestError('Mot so san pham da duoc cap nhat, vui long quay lai gio hang')
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        // truong hop neu insert thanh cong, thi remove product co trong cart
        if (newOrder) {
            // remove product in my cart

        }

        return newOrder
    }

    static async getOrderByUser() {
        
    }

    static async getOneOrderByUser() {

    }

    static async cancelOrderByUser() {
        
    }

    static async updateOrderStatusByShop() {
        
    }

}

//order




module.exports = CheckoutService