'use strict';
const {Contract} = require('fabric-contract-api');
const assetProcessors = require('../assets/assetProcessor');
class ContractProcessors extends Contract{
    constructor(){
        super();
        this.TxId = '';
    }

     async beforeTransaction(ctx){
        this.TxId = ctx.stub.getTxID();
        console.log(this.TxId);
    }

     async createProcessor(ctx,processorId,name,location,email,contact,hasTestingLab,lastCertified,certificateAuthorities,password){
        try{
            const processor = {
                processorId,
                name,
                location,
                email,
                contact,
                hasTestingLab,
                lastCertified,
                certificateAuthorities,
                password
            }
            // instantiating a new processor
            const newProcessor = new assetProcessors(processor);

            const doesProcessorExist = await this.getProcessorByEmail(ctx,processor.email);
            if (JSON.parse(doesProcessorExist).error !== 'Processor not found'){
                return `Processor with email ${email} already exists`;
            }
            // creating a composite key
            const indexKey = `processor~email~processorId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['processor',newProcessor.email,newProcessor.processorId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newProcessor)));
            delete processor.password
            return JSON.stringify({key:key,processor:processor});
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
                        return JSON.stringify({error:'Processor not found'});
                    }else{
                        return JSON.stringify(processors[0]);
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
                    if(processors.length === 0){
                        return JSON.stringify({error:"Processornot found"});
                    }
                    return JSON.stringify(processors[0]);
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
                        return JSON.stringify({error:'No processors created'});
                    }else{
                        return JSON.stringify({processors:allProcessors});
                    } 
                }
            }
        }catch(err){
            return err;
        }
    }

     async getProcessorsByQueryParams(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const newValues = {};
            args.forEach((element,index)=>{
                if(index % 2 === 1){
                    newValues[element] = args[index+1];
                }
            })   
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
                    if(processors.length === 0){
                        return JSON.stringify({error:"Processor not found"})
                    }
                    return JSON.stringify({processors});
                }
            }
        }catch(err){
            return err;
        }
    }

     async updateProcessor(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const processorId = args[1];
            const newValues = {};
            args.forEach((element,index)=>{
                if(index % 2 === 0 && index > 1){
                    newValues[element] = args[index+1];
                }
            });
            let processor = await this.getProcessorById(ctx,processorId);
            processor = JSON.parse(processor)
            if(processor.error === 'Processor not found'){
                return processor;
            }
            const updates = {...processor.processor,...newValues};
            let key;
            if (newValues['email'] !== undefined){
                await this.deleteProcessor(ctx,processorId);
                const indexKey = `processor~email~processorId`;
                key = await ctx.stub.createCompositeKey(indexKey,['processor',newValues.email,updates.processorId])
            }
            else{
                key = processor.key;
            }
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(updates)));
            return JSON.stringify({key:key,processor:updates});
        }catch(err){
            return err;
        }
    }

     async deleteProcessor(ctx,processorId){
        const processor = await this.getProcessorById(ctx,processorId);
        if(JSON.parse(processor).error === 'Processor not found'){
            return processor;
        }
        await ctx.stub.deleteState(JSON.parse(processor).key);
        return JSON.stringify({message:'Deleted Successfully'});
    }

}
module.exports = ContractProcessors