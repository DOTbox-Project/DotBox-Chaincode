
const {v4:uuidv4} = require('uuid');

class PalmOil{
    constructor(palmOil){
        this.palmOilId=uuidv4();
        this.batchId = palmOil.batchId;
        this.componentProductIDs=palmOil.componentProductIDs;
        this.productionDate=palmOil.productionDate;
        this.expirationDate=palmOil.expirationDate;
        this.unitType=palmOil.unitType;
        this.unitQuantity=palmOil.unitQuantity;
        this.productTest='';
        this.approvedBy='';
        this.producedBy=palmOil.producedBy;
        this.volumePerUnit=palmOil.volumePerUnit;
        this.docType='palmOil';
    }
}

class unitPalmOil{
    constructor(unit){
        this.unitId = uuidv4();
        this.batchId = unit.batchId;
        this.location = unit.locationId;
        this.owner = unit.owner;
        this.volume = unit.volume;
        this.docType = 'unitPalmOil';
    }
}

class repackagedUnitPalmOil{
    constructor(unit){
        this.repackagedId = uuidv4();
        this.componentIds = unit.componentIds;
        this.batchId = unit.batchId;
        this.volume = unit.volume;
        this.owner = unit.owner;
        this.location = unit.locationId;
        this.docType = 'repackagedUnit';
    }
}

module.exports.assetPalmOil = PalmOil;
module.exports.assetUnitPalmOil = unitPalmOil;
module.exports.assetRepackagedUnitPalmOil = repackagedUnitPalmOil;


