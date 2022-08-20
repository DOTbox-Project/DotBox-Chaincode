const {v4:uuidv4} = require('uuid');

class Consumer{
    constructor(consumer){
        this.consumerId = uuidv4();
        this.name = consumer.name;
        this.email = consumer.email;
        this.contact = consumer.contact;
    }
}

module.exports = Consumer;