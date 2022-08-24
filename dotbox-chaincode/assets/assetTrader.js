const {v4:uuidv4} = require('uuid')

class Trader{
    constructor(trader){
        this.traderId = trader.traderId;
        this.owner = trader.name;
        this.storeName = trader.storeName;
        this.storeLocation = trader.storeLocation;
        this.contact = trader.contact;
        this.email = trader.email;
        this.category = trader.category; 
        this.docType = 'trader';
    }
}

module.exports = Trader;