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

    async createProducer(ctx,name,farmName,farmLocation,email,contact){
        const producer = {
            name,
            farmName,
            farmLocation,
            email,
            contact
        }
        try{
            // instantiating a new producer
            const newProducer = new assetProducer(producer);

            const doesProducerExist = await this.getProducerByEmail(ctx,email);
            if (doesProducerExist !== 'Producer not found'){
                return `Producer with email ${email} already exists`;
            }
            
            // creating a composite key
            const indexKey = `producer~email~producerId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['producer',newProducer.email,newProducer.producerId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newProducer)));
            return JSON.stringify({key:key.toString('utf-8'),producer:newProducer});
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
                        return 'Producer not found';
                    }else{
                        return producers[0];
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

    async getProducerById(ctx,producerId){
        try{
            const queryString = {
                "selector":{
                    "docType":"producer",
                    producerId:producerId
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
                    return producers[0];
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
                        return 'No producers created';
                    }else{
                        return producers;
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
            const newValues = {}
            args.forEach((element,index)=>{
                if(index>=1 && index%2==1){
                    newValues[element] = args[index+1]
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
                    return producers;
                }
            }
        }catch(err){
            return err;
        }
    }

    async updateProducer(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const currentEmail = args[1];
            const newValues = {}
            args.forEach((element,index)=>{
                if(index>=2 && index%2==0){
                    newValues[element] = args[index+1]
                }
            })
            let producer = await this.getProducerByEmail(ctx,currentEmail);
            if(producer === 'Producer not found'){
                return producer;
            }
            const updates = {...producer.producer,...newValues};
            let key;
            if (newValues['email'] !== undefined){
                await this.deleteProducer(ctx,currentEmail);
                const indexKey = `producer~email~producerId`;
                key = await ctx.stub.createCompositeKey(indexKey,['producer',newValues.email,updates.producerId])
            }
            else{
                key = producer.key;
            }
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(updates)));
            return {key:key,producer:updates}
        }catch(err){
            return err;
        }
    }

    async deleteProducer(ctx,email){
        try{
            const producer = await this.getProducerByEmail(ctx,email);
            if(producer === 'Producer not found'){
                return producer;
            }
            await ctx.stub.deleteState(producer.key);
            return 'Deleted Successfully';
        }catch(err){
            return err;
        }
    }
}

module.exports = ContractProducers;
