const {v4:uuidv4} = require('uuid');

class Processor{
    constructor(processor){
        this.userId = processor.userId;
        this.processorName = processor.name;
        this.processorLocation = processor.location;
        this.email = processor.email;
        this.contact = processor.contact;
        this.hasTestingLab = processor.hasTestingLab;
        this.lastCertified = processor.lastCertified;
        this.certificateAuthorities = processor.certificateAuthorities;
        this.password = processor.password
        this.docType = 'processor';
    }
}

module.exports = Processor;