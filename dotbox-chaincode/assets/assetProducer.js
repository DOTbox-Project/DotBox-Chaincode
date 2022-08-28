class Producer{
    constructor(producer){
        this.producerId = producer.producerId;
        this.name = producer.name;
        this.farmName = producer.farmName;
        this.farmLocation = producer.farmLocation;
        this.email = producer.email;
        this.contact = producer.contact;
        this.password = producer.password;
        this.docType = 'producer';
    }
}

module.exports = Producer;