const {v4:uuidv4} = require('uuid')


class FFB{
    constructor(ffb){
        this.batchID=uuidv4();
        this.harvestTimestamp=ffb.harvestTimestamp;
        this.percentageRipe=ffb.percentageRipe;
        this.percentageDura=ffb.percentageDura;
        this.arrivalAtProcessorTimestamp=ffb.arrivalAtProcessorTimestamp;
        this.soldTo=ffb.soldTo;
        this.producedBy=ffb.producedBy;
        this.numOfBunches=ffb.numOfBunches;
        this.docType='ffb';
    }
}

module.exports = FFB;