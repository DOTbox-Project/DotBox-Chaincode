const {v4:uuidv4} = require('uuid')

class ProductLocationData{
    constructor(location){
        this.locationId=location.locationId;
        this.previousLocations="";
        this.currentLocation=location.location;
        this.docType='location';
    }
}

module.exports = ProductLocationData;
