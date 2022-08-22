const assetTestEntry = require('../assets/assetTestEntry');
const {Contract} = require('fabric-contract-api');

class ContractTest extends Contract{
    constructor(){
        super('ContractTest');
        this.TxId = '';
    }

    async beforeTransaction(ctx){
        this.TxId = await ctx.stub.getTxID();
        console.log(this.TxId);
    }

    // async createTest(ctx){
    //     try{
    //         const args = await ctx.stub.getArgs();
    //         const params = args.map(element=>element);
    //         const test = {
    //             tester:params[1],
    //             testTimestamp:params[2],
    //             moistureContent:params[3],
    //             ffaLevel:params[4],
    //             sampleTested:params[5],
    //         }

    //         const newTest = new assetTestEntry(test);

    //     }catch(err){
    //         return err;
    //     }
    // }
}