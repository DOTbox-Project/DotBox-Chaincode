const {v4:uuidv4} = require('uuid')

class Regulator {
    constructor(regulator){
        this.userId = regulator.userId;
        this.regulatorName = regulator.name;
        this.contact = regulator.contact;
        this.email = regulator.email;
        this.regulatorLocation = regulator.location;
        this.password = regulator.password;
        this.docType = 'regulator';
    }
}

module.exports = Regulator