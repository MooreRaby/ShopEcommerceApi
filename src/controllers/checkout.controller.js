'use strict';


const CheckoutService = require('../services/checkout.service')
const { SuccessResponse } = require('../core/success.response')


class CheckoutController {

    /**
     * @desc add to cart for user
     * @param {int} userId
     * @param {*} res
     * @param {*} next
     * @method post
     * @URL /v1/api/cart/user
     * @return {
     * }
     */

    checkoutReview = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new cart successfully',
            metadata: await CheckoutService.checkoutReview(req.body)
        }).send(res);
    }

}

module.exports = new CheckoutController();