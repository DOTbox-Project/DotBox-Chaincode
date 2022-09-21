const {v4:uuidv4} = require('uuid');

class Consumer{
    constructor(consumer){
        this.userId = consumer.userId;
        this.name = consumer.name;
        this.email = consumer.email;
        this.contact = consumer.contact;
        this.password = consumer.password;
        this.docType = 'consumer';
    }
}

module.exports = Consumer;