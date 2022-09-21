const {v4:uuidv4} = require('uuid')

class Trader{
    constructor(trader){
        this.userId = trader.userId;
        this.owner = trader.name;
        this.storeName = trader.storeName;
        this.storeLocation = trader.storeLocation;
        this.contact = trader.contact;
        this.email = trader.email;
        this.category = trader.category; 
        this.password = trader.password;
        this.docType = 'trader';
    }
}

module.exports = Trader;