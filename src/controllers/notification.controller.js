'use strict';

const NotificationService = require('../services/notification.service')
const { SuccessResponse } = require('../core/success.response')

class NotificationController {

    listNotiByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'create new notification',
            metadata: await NotificationService.listNotiByUser(req.query)
        }).send(res)
    }

}

module.exports = new NotificationController()