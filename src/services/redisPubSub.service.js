const Redis = require('redis')

class RedisPubSubService {

    
     constructor ()  {
         this.publisher = Redis.createClient();
         this.subscriber = Redis.createClient();

         this.publisher.connect().then(() => {
             console.log('Publisher connected');
         }).catch(err => {
             console.error('Publisher connection error:', err);
         });

         this.subscriber.connect().then(() => {
             console.log('Subscriber connected');
         }).catch(err => {
             console.error('Subscriber connection error:', err);
         });

    }

    publish(channel, message) {
        return new Promise((resolve, reject) => {
            this.publisher.publish(channel, message, (err, reply) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(reply)
                }
            })
        })
    }


    subscribe(channel, callback) {
        this.subscriber.subscribe(channel)
        this.subscriber.on('message', (subcriberChannel, message) => {
            if (channel === subcriberChannel) {
                callback(channel, message)
            }
        })
    }
}

 
module.exports = new RedisPubSubService()