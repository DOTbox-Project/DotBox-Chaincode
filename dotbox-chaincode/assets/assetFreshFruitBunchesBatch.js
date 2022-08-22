const {v4:uuidv4} = require('uuid')


class FFB{
    constructor(ffb){
        this.ffbId=uuidv4();
        this.harvestTimestamp=ffb.harvestTimestamp;
        this.percentageRipe=ffb.percentageRipe;
        this.percentageDura=ffb.percentageDura;
        this.percentageTenera = ffb.percentageTenera;
        this.arrivalAtProcessorTimestamp=ffb.arrivalAtProcessorTimestamp;
        this.soldTo=ffb.soldTo;
        this.producedBy=ffb.producedBy;
        this.numOfBunches=ffb.numOfBunches;
        this.docType='ffb';
    }
}

module.exports = FFB;