
const {v4:uuidv4} = require('uuid');

class PalmOil{
    constructor(palmOil){
        this.palmOilId=palmOil.palmOilId;
        this.batchId = palmOil.batchId;
        this.componentProductIds=palmOil.componentProductIds;
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
        this.unitId = unit.unitId;
        this.batchId = unit.batchId;
        this.location = unit.locationId;
        this.owner = unit.owner;
        this.volume = unit.volume;
        this.docType = 'unitPalmOil';
        this.producedBy = unit.owner;
    }
}

class repackagedUnitPalmOil{
    constructor(unit){
        this.repackagedId = unit.repackagedId;
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


