'use strict';

const assetConsumer = require('../assets/assetConsumer');
const {Contract} = require('fabric-contract-api');

class ContractConsumers extends Contract{
    constructor(){
        super('ContractConsumers');
        this.TxId = '';
    }
    
     async beforeTransaction(ctx){
        this.TxId = ctx.stub.getTxID();
        console.log(this.TxId);
    }

     async createConsumer(ctx,userId,name,email,contact,password){
        try{
            // instantiating a new consumer
            const consumer = {
                userId,
                name,
                email,
                password,
                contact
            }
            const newConsumer = new assetConsumer(consumer);

            const doesConsumerExist = await this.getConsumerByEmail(ctx,consumer.email);
            if (JSON.parse(doesConsumerExist).error !== 'Consumer not found'){
                return JSON.stringify({error:`Consumer with email ${email} already exists`});
            }
            
            // creating a composite key
            const indexKey = `consumer~email~consumerId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['consumer',newConsumer.email,newConsumer.userId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newConsumer)));
            delete consumer.password;
            return JSON.stringify({key:key,consumer:consumer});
        }catch(err){
            return err;
        }
    }

     async getConsumerByEmail(ctx,email){
        try{
            // collect the keys
            let keys = ['consumer',email];
            // retrieve the query iterator
            let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('consumer~email~consumerId',keys);
            // Query the world state with the query iterator
            const consumers = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    consumers.push({key:res.value.key,consumer:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(consumers.length === 0){
                        return JSON.stringify({error:'Consumer not found'});
                    }else{
                        return JSON.stringify(consumers[0]);
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

     async getAllConsumers(ctx){
        try{
            // collect the keys
            let keys = ['consumer'];
            // retrieve the query iterator
            let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('consumer~email~consumerId',keys);
            // Query the world state with the query iterator
            const consumers = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    consumers.push({key:res.value.key,consumer:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(consumers.length === 0){
                        return JSON.stringify({error:'No consumers created'});
                    }else{
                        return JSON.stringify({consumers});
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

     async getConsumerById(ctx,userId){
        try{
            const queryString = {
                "selector":{
                    "docType":"consumer",
                    userId:userId
                }
            }
            let consumersIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const consumers = []
            while(true){
                let consumer = await consumersIterator.next();
                if(consumer.value){
                    consumers.push({key:consumer.value.key,consumer:JSON.parse(consumer.value.value.toString('utf-8'))});
                }
                if(consumer.done){
                    await consumersIterator.close();
                    if(consumers.length === 0){
                        return JSON.stringify({error:'Consumer not found'});
                    }
                    return JSON.stringify(consumers[0]);
                }
            }
        }catch(err){
            return err
        }
    }

     async getConsumersByQueryParams(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const newValues = {};
            args.forEach((element,index)=>{
                if(index % 2 === 1){
                    newValues[element] = args[index+1];
                }
            });
            const queryString = {
                "selector":{
                    "docType":"consumer",
                    ...newValues
                }
            }
            let consumersIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const consumers = []
            while(true){
                let consumer = await consumersIterator.next();
                if(consumer.value){
                    consumers.push({key:consumer.value.key,consumer:JSON.parse(consumer.value.value.toString('utf-8'))});
                }
                if(consumer.done){
                    await consumersIterator.close();
                    if(consumers.length === 0){
                        return JSON.stringify({error:'Consumer not found'})
                    }
                    return JSON.stringify({consumers});
                }
            }
        }catch(err){
            return err;
        }
    }

     async updateConsumer(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const userId = args[1];
            const newValues = {};
            args.forEach((element,index)=>{
                if(index % 2 === 0 && index > 1){
                    newValues[element] = args[index+1];
                }
            });
            let consumer = await this.getConsumerById(ctx,userId);
            consumer = JSON.parse(consumer);
            if(consumer === 'Consumer not found'){
                return JSON.stringify(consumer);
            }
            const updates = {...consumer.consumer,...newValues};
            let key;
            if (newValues['email'] !== undefined){
                await this.deleteConsumer(ctx,userId);
                const indexKey = `consumer~email~consumerId`;
                key = await ctx.stub.createCompositeKey(indexKey,['consumer',newValues.email,updates.userId])
            }
            else{
                key = consumer.key;
            }
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(updates)));
            return JSON.stringify({key:key,consumer:updates});
        }catch(err){
            return err;
        }
    }

     async deleteConsumer(ctx,userId){
        try{
            const consumer = await this.getConsumerById(ctx,userId);
            if(JSON.parse(consumer).error === 'Consumer not found'){
                return consumer;
            }
            await ctx.stub.deleteState(JSON.parse(consumer).key);
            return JSON.stringify({message:'Deleted Successfully'});
        }catch(err){
            return err;
        }
    }
}

module.exports = ContractConsumers
