const {v4:uuidv4} = require('uuid')

class ProductLocationData{
    constructor(locationData){
        this.locID=uuidv4();
        this.prevLocation=locationData.prevLocation;
        this.currLocation=locationData.currLocation;
        this.docType='locationData';
    }
}

module.exports = ProductLocationData;
