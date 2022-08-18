const {v4:uuidv4} = require('uuid')

class Producer{
    constructor(producer){
        this.producerId = uuidv4();
        this.name = producer.name;
        this.farmName = producer.farmName;
        this.farmLocation = producer.farmLocation;
        this.email = producer.email;
        this.contact = producer.contact;
        this.docType = producer;
    }
}

module.exports = Producer;