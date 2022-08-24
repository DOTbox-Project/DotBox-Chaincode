'use strict';
const {Contract} = require('fabric-contract-api');
const assetProcessors = require('../assets/assetProcessor')
class ContractProcessors extends Contract{
    constructor(){
        super('ContractProcessors');
        this.TxId = '';
    }

    async beforeTransaction(ctx){
        this.TxId = ctx.stub.getTxID();
        console.log(this.TxId);
    }

    async createProcessor(ctx,processor){
        try{
            // instantiating a new processor
            const newProcessor = new assetProcessors(JSON.parse(processor));

            const doesProcessorExist = await this.getProcessorByEmail(ctx,processor.email);
            if (doesProcessorExist !== 'Processor not found'){
                return `Processor with email ${email} already exists`;
            }
            // creating a composite key
            const indexKey = `processor~email~processorId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['processor',newProcessor.email,newProcessor.processorId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newProcessor)));
            return JSON.stringify({key:key.toString('utf-8'),processor:newProcessor});
        }catch(err){
            return err;
        }
    }

    async getProcessorByEmail(ctx,email){
        try{
            // collect the keys
            let keys = ['processor',email];
            // retrieve the query iterator
            let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('processor~email~processorId',keys);
            // Query the world state with the query iterator
            const processors = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    processors.push({key:res.value.key,processor:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(processors.length === 0){
                        return 'Processor not found';
                    }else{
                        return processors[0];
                    }
                }
            }
        }catch(err){
            return err
        }
    }

    async getProcessorById(ctx,processorId){
        try{
            const queryString = {
                "selector":{
                    "docType":"processor",
                    processorId:processorId
                }
            }
            let processorsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const processors = []
            while(true){
                let processor = await processorsIterator.next();
                if(processor.value){
                    processors.push({key:processor.value.key,processor:JSON.parse(processor.value.value.toString('utf-8'))});
                }
                if(processor.done){
                    await processorsIterator.close();
                    return processors[0];
                }
            }
        }catch(err){
            return err
        }
    }

    async getAllProcessors(ctx){
        try{
            const allProcessors = [];
            let processorsIterator = await ctx.stub.getStateByPartialCompositeKey('processor~email~processorId',['processor']);
            while(true){
                const processor = await processorsIterator.next();
                if(processor.value){
                    allProcessors.push({key:processor.value.key,processor:JSON.parse(processor.value.value.toString('utf-8'))})
                }
                if(processor.done){
                    await processorsIterator.close();
                    if(allProcessors.length === 0){
                        return 'No proessors created';
                    }else{
                        return allProcessors;
                    } 
                }
            }
        }catch(err){
            return err;
        }
    }

    async getProcessorsByQueryParams(ctx,params){
        try{
            const newValues = JSON.parse(params);
            const queryString = {
                "selector":{
                    "docType":"processor",
                    ...newValues
                }
            }
            let processorsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const processors = []
            while(true){
                let processor = await processorsIterator.next();
                if(processor.value){
                    processors.push({key:processor.value.key,processor:JSON.parse(processor.value.value.toString('utf-8'))});
                }
                if(processor.done){
                    await processorsIterator.close();
                    return processors;
                }
            }
        }catch(err){
            return err;
        }
    }

    async updateProcessor(ctx,currentEmail,updatedValues){
        try{
            const newValues = JSON.parse(updatedValues);
            let processor = await this.getProcessorByEmail(ctx,currentEmail);
            if(processor === 'Processor not found'){
                return processor;
            }
            const updates = {...processor.processor,...newValues};
            let key;
            if (newValues['email'] !== undefined){
                await this.deleteProcessor(ctx,processor.email);
                const indexKey = `processor~email~processorId`;
                key = await ctx.stub.createCompositeKey(indexKey,['processor',newValues.email,updates.processorId])
            }
            else{
                key = processor.key;
            }
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(updates)));
            return {key:key,processor:updates}
        }catch(err){
            return err;
        }
    }

    async deleteProcessor(ctx,email){
        const processor = await this.getProcessorByEmail(ctx,email);
        if(processor === 'Processor not found'){
            return processor;
        }
        await ctx.stub.deleteState(processor.key);
        return 'Deleted Successfully';
    }

}

module.exports = ContractProcessors;