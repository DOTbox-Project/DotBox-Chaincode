'use strict';

const assetProducer = require('../assets/assetProducer');
const {Contract} = require('fabric-contract-api');

class ContractProducers extends Contract{
    constructor(){
        super('ContractProducers');
        this.TxId = '';
    }
    
     async beforeTransaction(ctx){
        this.TxId = ctx.stub.getTxID();
        console.log(this.TxId);
    }

     async createProducer(ctx,userId,name,email,password,farmName,farmLocation,contact){
        const producer = {
            userId,
            name,
            email,
            password,
            farmName,
            farmLocation,
            contact
        }
       
        try{
            // instantiating a new producer
            const newProducer = new assetProducer(producer);

            const doesProducerExist = await this.getProducerByEmail(ctx,producer.email);
            if (JSON.parse(doesProducerExist).error !== 'Producer not found'){
                return JSON.stringify({error:`Producer with email ${email} already exists`});
            }
            
            // creating a composite key
            const indexKey = `producer~email~producerId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['producer',newProducer.email,newProducer.userId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newProducer)));
            delete producer.password;
            return JSON.stringify({key:key,producer:producer});
        }catch(err){
            return err;
        }
    }

     async getProducerByEmail(ctx,email){
        try{
            // collect the keys
            let keys = ['producer',email];
            // retrieve the query iterator
            let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('producer~email~producerId',keys);
            // Query the world state with the query iterator
            const producers = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    producers.push({key:res.value.key,producer:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(producers.length === 0){
                        return JSON.stringify({error:'Producer not found'});
                    }else{
                        return JSON.stringify(producers[0]);
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

     async getProducerById(ctx,userId){
        try{
            const queryString = {
                "selector":{
                    "docType":"producer",
                    userId:userId
                }
            }
            let producersIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const producers = []
            while(true){
                let producer = await producersIterator.next();
                if(producer.value){
                    producers.push({key:producer.value.key,producer:JSON.parse(producer.value.value.toString('utf-8'))});
                }
                if(producer.done){
                    await producersIterator.close();
                    if(producers.length === 0){
                        return JSON.stringify({error:'Producer not found'});
                    }
                    return JSON.stringify(producers[0]);
                }
            }
        }catch(err){
            return err
        }
    }

     async getAllProducers(ctx){
        try{
            // collect the keys
            let keys = ['producer'];
            // retrieve the query iterator
            let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('producer~email~producerId',keys);
            // Query the world state with the query iterator
            const producers = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    producers.push({key:res.value.key,producer:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(producers.length === 0){
                        return JSON.stringify({error:'Producer not found'});;
                    }else{
                        return JSON.stringify({producers});
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

     async getProducersByQueryParams(ctx){
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
                    "docType":"producer",
                    ...newValues
                }
            }
            let producersIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const producers = []
            while(true){
                let producer = await producersIterator.next();
                if(producer.value){
                    producers.push({key:producer.value.key,producer:JSON.parse(producer.value.value.toString('utf-8'))});
                }
                if(producer.done){
                    await producersIterator.close();
                    if(producers.length === 0){
                        return JSON.stringify({error:'Producer not found'});
                    }
                    return JSON.stringify({producers});
                }
            }
        }catch(err){
            return err;
        }
    }

     async updateProducer(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const userId = args[1];
            const newValues = {};
            args.forEach((element,index)=>{
                if(index % 2 === 0 && index > 1){
                    newValues[element] = args[index+1];
                }
            })     
            let producer = await this.getProducerById(ctx,userId);
            producer = JSON.parse(producer);
            if(producer.error === 'Producer not found'){
                return JSON.stringify(producer);
            }
            const updates = {...producer.producer,...newValues};
            let key;
            if (newValues['email'] !== undefined){
                await this.deleteProducer(ctx,userId);
                const indexKey = `producer~email~producerId`;
                key = await ctx.stub.createCompositeKey(indexKey,['producer',newValues.email,updates.userId])
            }
            else{
                key = producer.key;
            }
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(updates)));
            return JSON.stringify({key:key,producer:updates})
        }catch(err){
            return err;
        }
    }

     async deleteProducer(ctx,userId){
        try{
            const producer = await this.getProducerById(ctx,userId);
            if(JSON.parse(producer).error === 'Producer not found'){
                return producer;
            }
            await ctx.stub.deleteState(JSON.parse(producer).key);
            return JSON.stringify({message:'Deleted Successfully'});
        }catch(err){
            return err;
        }
    }
}
module.exports = ContractProducers;
