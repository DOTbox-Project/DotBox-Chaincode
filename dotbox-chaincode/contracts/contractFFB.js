const assetFFB = require('../assets/assetFreshFruitBunchesBatch');
const {Contract} = require('fabric-contract-api');
const {checkProducerExists} = require('../utils/producerUtils');
const {checkProcessorExistsByKey} = require('../utils/processorUtils');

class ContractFFB extends Contract{
    constructor(){
        super('ContractFFB');
        this.TxId = ''
    }

    async beforeTransaction(ctx){
        this.TxId = await ctx.stub.getTxID();
        console.log(this.TxId);
    }

    async createFFB(ctx){
        try{
        const args = await ctx.stub.getArgs();
        const parameters = [];
        args.forEach(element=>parameters.push(element));
        const ffb = {
                harvestTimestamp : parameters[1],
                percentageRipe : parameters[2],
                percentageDura : parameters[3],
                percentageTenera : parameters[4],
                arrivalAtProcessorTimestamp : parameters[5],
                producedBy : parameters[6],
                soldTo : parameters[7],
                numOfBunches : parameters[8]
            }
            
            const keys = ffb.producedBy.split('~');
            const producer = await checkProducerExists(ctx,keys);
            if (producer === 'Producer not found'){
                return producer;
            }
            const newFFB = new assetFFB(ffb);
            const indexKey = 'ffb~year~month~day';
            const fullDate = new Date(ffb.harvestTimestamp);
            const year = fullDate.getFullYear().toString();
            const month = String(Number(fullDate.getMonth().toString())+1);
            const day = fullDate.getDate().toString();

            const key = await ctx.stub.createCompositeKey(indexKey,['ffb',year,month,day]);

            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newFFB)));
            return {key:key,ffb:newFFB};

        }catch(err){
            return err
        }
    }

    async getFFBByYearMonthDay(ctx,date){
       try{
        const keys = date.split('~');
        let allKeys = keys.map(key=>key);
        allKeys.splice(0,0,'ffb');
        let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('ffb~year~month~day',allKeys);
        let allFFBs = [];
        while(true){
            let ffb = await resultsIterator.next();
            if(ffb.value){
                allFFBs.push({key:ffb.value.key,ffb:JSON.parse(ffb.value.value.toString('utf-8'))});
            }
            if(ffb.done){
                await resultsIterator.close();
                return allFFBs;
            }
        }
       }catch(err){
        return err
       }
    }

    async getAllFFB(ctx){
        try{
            // collect the keys
            let keys = ['ffb'];
            // retrieve the query iterator
            let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('ffb~year~month~day',keys);
            // Query the world state with the query iterator
            const allFFBs = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    allFFBs.push({key:res.value.key,regulator:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(allFFBs.length === 0){
                        return 'No ffbs created';
                    }else{
                        return allFFBs;
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

    async getFFBById(ctx,ffbId){
        try{
            const queryString = {
                "selector":{
                    "docType":"ffb",
                    ffbId:ffbId
                }
            }
            let ffbIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const allFFBs = []
            while(true){
                let ffb = await ffbIterator.next();
                if(ffb.value){
                    allFFBs.push({key:ffb.value.key,ffb:JSON.parse(ffb.value.value.toString('utf-8'))});
                }
                if(ffb.done){
                    await ffbIterator.close();
                    if(allFFBs.length === 0){
                        return 'No ffb found';
                    }
                    return allFFBs[0];
                }
            }
        }catch(err){
            return err
        }
    }

    async getFFBByQueryParams(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const newValues = {}
            args.forEach((element,index)=>{
                if(index>=1 && index%2==1){
                    newValues[element] = args[index+1]
                }
            })
            const queryString = {
                "selector":{
                    "docType":"ffb",
                    ...newValues
                }
            }
            let ffbIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const allFFBs = []
            while(true){
                let ffb = await ffbIterator.next();
                if(ffb.value){
                    allFFBs.push({key:ffb.value.key,ffb:JSON.parse(ffb.value.value.toString('utf-8'))});
                }
                if(ffb.done){
                    await ffbIterator.close();
                    return allFFBs;
                }
            }
        }catch(err){
            return err;
        }
    }

    async updateFFB(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const ffbId = args[1];
            const newValues = {}
            args.forEach((element,index)=>{
                if(index>=2 && index%2==0){
                    newValues[element] = args[index+1]
                }
            })
            const ffb = await this.getFFBById(ctx,ffbId);
            const updates = {...ffb.ffb,...newValues};
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(updates)));
            return {key:key,ffb:updates}
        }catch(err){
            return err;
        }
    }

    async transferFFBToProcessor(ctx,ffbId,processorKey,arrivalAtProcessorTimestamp){
        try{
            const keys = processorKey.split('~');
            const processor = await checkProcessorExistsByKey(ctx,keys);
            if(processor === 'Processor not found'){
                return processor;
            }
            const ffb = await this.getFFBById(ctx,ffbId);
            ffb.ffb = {
                ...ffb.ffb,
                soldTo:processorKey,
                arrivalAtProcessorTimestamp
            }
            await ctx.stub.putState(ffb.key,Buffer.from(JSON.stringify(ffb.ffb)));
        }catch(err){
            return err
        }
    }

    async getFFBHistoryById(ctx,ffbId){
        try{
            const ffb = await this.getFFBById(ctx,ffbId);
            if(ffb === 'No ffb found'){
                return ffb;
            }
            let historyIterator = await ctx.stub.getHistoryForKey(ffb.key);
            const historyRes = {};
            while(true){
                let history = await historyIterator.next();
                if(history.value){
                    console.log(history.value);
                    historyRes.timestamp = history.value.timestamp;
                    historyRes.history = JSON.parse(history.value.value.toString('utf-8'));
                }
                if(history.done){
                    await historyIterator.close();
                    return historyRes
                }
            }
        }catch(err){
            return err;
        }
    }
}

module.exports = ContractFFB;
