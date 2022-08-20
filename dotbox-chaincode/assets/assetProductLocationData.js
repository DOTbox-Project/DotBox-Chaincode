const {v4:uuidv4} = require('uuid')

class ProductLocationData{
    constructor(locationData){
        this.prevLocation=locationData.prevLocation;
        this.currLocation=locationData.currLocation;
        this.docType='locationData';
    }
}

module.exports = ProductLocationData;
