const {v4:uuidv4} = require('uuid');

class Transaction{
    constructor(transaction,prevTransactionId,batchId){
        this.transactionId = transaction.transactionId
        this.prevTransactionId = prevTransactionId;
        this.userType = transaction.userType
        this.quantitySold = transaction.quantitySold
        this.soldTo = transaction.soldTo
        this.batchId = batchId
        this.remainingQuantity = transaction.remainingQuantity;
        this.dateTransferred = transaction.dateTransferred
        this.from = transaction.from
        this.volumePerUnit = transaction.volumePerUnit
        this.arrivalAtNewOwnerDate = transaction.arrivalAtNewOwnerDate
        this.docType = "transaction"
    }
}

module.exports = Transaction