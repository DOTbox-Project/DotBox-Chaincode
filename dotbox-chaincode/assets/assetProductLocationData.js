const {v4:uuidv4} = require('uuid')

class ProductLocationData{
    constructor(location){
        this.locationId=uuidv4();
        this.previousLocations="";
        this.currentLocation=location;
        this.docType='location';
    }
}

module.exports = ProductLocationData;
