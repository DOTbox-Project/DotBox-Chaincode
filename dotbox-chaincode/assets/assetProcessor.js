const {v4:uuidv4} = require('uuid');

class Processor{
    constructor(processor){
        this.processorId = processor.processorId;
        this.processorName = processor.name;
        this.processorLocation = processor.location;
        this.email = processor.email;
        this.contact = processor.contact;
        this.hasTestingLab = processor.hasTestingLab;
        this.lastCertified = processor.lastCertified;
        this.certificateAuthorities = processor.certificateAuthorities;
        this.docType = 'processor';
    }
}

module.exports = Processor;