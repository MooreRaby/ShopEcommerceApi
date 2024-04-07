'use strict';

const { NOTI } = require('../models/notification.model')

const pushNotiToSystem = async ({
    type = 'SHOP-001',
    receivedId = 1,
    senderId = 1,
    options = {}
}) => {
    let noti_content

    if (type === 'SHOP-001') {
        noti_content = '@@@ vua them mot san pham: @@@@'

    } else if (type === 'PROMOTION-001') {
        noti_content = '@@@ vua them mot san voucher: @@@@@'
    }

    const newNoti = await NOTI.create({
        noti_type: type,
        noti_content,
        noti_senderId: senderId,
        noti_receivedId: receivedId,
        noti_options: options
    })

    return newNoti
}

const listNotiByUser = async ({
    userId = 1,
    type = 'All',
    isReal = 0
}) => {
    const match = { noti_receivedId: userId }
    if (type !== 'All') {
        match[ 'noti_type' ] = type
    }

    return await NOTI.aggregate([
        {
            $match: match
        },

        {
            $project: {

                noti_type: 1,
                noti_content: {
                    $concat: [
                        {
                            $substr: [ '$noti_options.shop_name', 0, -1 ]
                        },

                        ' Vừa mới thêm một sản phẩm mới ',

                        {
                            $substr: [ '$noti_options.product_name', 0, -1 ]
                        }
                    ]
                },
                noti_senderId: 1,
                noti_receivedId: 1,
                createAt: 1,
                noti_options: 1

            }
        },
    ])
}

module.exports = {
    pushNotiToSystem,
    listNotiByUser
}