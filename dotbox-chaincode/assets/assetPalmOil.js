
const {v4:uuidv4} = require('uuid');

class PalmOil{
    constructor(palmOil){
        this.batchID=uuidv4();
        this.componentProductIDs=palmOil.componentProductIDs;
        this.productionDate=palmOil.productionDate;
        this.expirationDate=palmOil.expirationDate;
        this.unitQuantityType=palmOil.unitQuantityType;
        this.unitQuantity=palmOil.unitQuantity;
        this.batchQuantity=palmOil.batchQuantity;
        this.productTest=palmOil.productTest;
        this.approval=palmOil.approval;
        this.location=palmOil.location;
        this.soldTo=palmOil.soldTo;
        this.docType='palmOil';
    }
}

module.exports = PalmOil;


