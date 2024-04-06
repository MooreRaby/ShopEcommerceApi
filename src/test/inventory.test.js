const redisPubSubService = require('../services/redisPubSub.service')

class InventoryServiceTest {

    constructor () {
        redisPubSubService.subscribe('purchase_events', (channel, message) => {
            InventoryServiceTest.updateInventory(message)
        })
    }

    static updateInventory(productId, quantity) {
        console.log(`update inventory ${productId} with quantity ${quantity}`);
    }
}


module.exports = new InventoryServiceTest()