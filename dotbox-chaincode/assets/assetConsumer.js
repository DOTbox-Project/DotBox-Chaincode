const {v4:uuidv4} = require('uuid');

class Consumer{
    constructor(consumer){
        this.consumerId = consumer.consumerId;
        this.name = consumer.name;
        this.email = consumer.email;
        this.contact = consumer.contact;
        this.docType = 'consumer';
    }
}

module.exports = Consumer;