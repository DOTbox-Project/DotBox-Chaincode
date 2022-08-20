const {v4:uuidv4} = require('uuid')

class Regulator {
    constructor(regulator){
        this.regulatorId = uuidv4();
        this.regulatorName = regulator.name;
        this.contact = regulator.contact;
        this.email = regulator.email;
        this.regulatorLocation = regulator.location;
        this.docType = 'regulator';
    }
}

module.exports = Regulator