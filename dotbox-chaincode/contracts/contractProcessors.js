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

    async createProcessor(ctx,name,location,email,contact,hasTestingLab,lastCertified,certificateAuthorities){
        const processor = {
            name,
            location,
            email,
            contact,
            hasTestingLab,
            lastCertified,
            certificateAuthorities
        }
        try{
            // instantiating a new producer
            const newProcessor = new assetProcessors(processor);
            
            // creating a composite key
            const indexKey = `processor~email~processorId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['processor',newProducer.email,newProducer.producerId])
            
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
                    processors.push({key:res.value.key.toString('utf-8'),processor:res.value.value.toString('utf-8')});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(producers.length === 0){
                        return 'Processor not found';
                    }else{
                        return JSON.stringify(processors[0]);
                    }
                }
            }
        }catch(err){
            return err
        }
    }

    async getAllProcessors(ctx){
        try{
            const allProcessors = [];
            const processorsIterator = await ctx.stub.getStateByPartialCompositeKey('processor~email~processorId',['processor']);
            while(true){
                const processor = processorsIterator.next();
                if(processor.value){
                    allProcessors.push({key:processor.value.key.toString('utf-8'),processor:JSON.parse(producer.value.value.toString('utf-8'))})
                }
                if(processorsIterator.done){
                    processorsIterator.close();
                    return JSON.stringify({processors:allProcessors});
                }
            }
        }catch(err){
            return err;
        }
    }

    async updateProcessor(ctx){
        try{
            const args = ctx.stub.getArgs();
            const currentEmail = args[1];
            const newValues = {}
            for(let i=1;i<args.length;i+2){
                newValues[args[i]] = args[i+1];
            }
            let processor = this.getProcessorByEmail(ctx,currentEmail);
            if(processor === 'Producer not found'){
                return processor;
            }
            processor = JSON.parse(processor);
            const updates = {...processor.processor,...newValues};
            await ctx.stub.putState(processor.key,Buffer.from(JSON.stringify(updates)));
            return JSON.stringify({key:processor.key,processor:updates})
        }catch(err){
            return err;
        }
    }

    async deleteProcessor(ctx,email){
        const processor = this.getProcessorByEmail(ctx,email);
        if(processor === 'Processor not found'){
            return processor;
        }
        processor = JSON.parse(processor);
        await ctx.stub.deleteState(processor.key);
        return 'Deleted Successfully';
    }

}

module.exports = ContractProcessors;