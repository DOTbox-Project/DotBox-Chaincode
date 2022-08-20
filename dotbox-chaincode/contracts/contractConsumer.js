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

    async createConsumer(ctx,name,email,contact){
        const consumer = {
            name,
            email,
            contact,
        }
        try{
            // instantiating a new consumer
            const newConsumer = new assetConsumer(consumer);

            const doesConsumerExist = await this.getConsumerByEmail(ctx,email);
            if (doesConsumerExist !== 'Consumer not found'){
                return `Consumer with email ${email} already exists`;
            }
            
            // creating a composite key
            const indexKey = `consumer~email~consumerId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['consumer',newConsumer.email,newConsumer.consumerId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newConsumer)));
            return {key:key,consumer:newConsumer};
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
                        return 'Consumer not found';
                    }else{
                        return consumers[0];
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
                        return 'No consumers created';
                    }else{
                        return consumers;
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

    async updateConsumer(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const currentEmail = args[1];
            const newValues = {}
            args.forEach((element,index)=>{
                if(index>=2 && index%2==0){
                    newValues[element] = args[index+1]
                }
            })
            let consumer = await this.getConsumerByEmail(ctx,currentEmail);
            if(consumer === 'Consumer not found'){
                return consumer;
            }
            const updates = {...consumer.consumer,...newValues};
            let key;
            if (newValues['email'] !== undefined){
                await this.deleteConsumer(ctx,currentEmail);
                const indexKey = `consumer~email~traderId`;
                key = await ctx.stub.createCompositeKey(indexKey,['consumer',newValues.email,updates.consumerId])
            }
            else{
                key = consumer.key;
            }
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(updates)));
            return {key:key,consumer:updates}
        }catch(err){
            return err;
        }
    }

    async deleteConsumer(ctx,email){
        try{
            const consumer = await this.getConsumerByEmail(ctx,email);
            if(consumer === 'Consumer not found'){
                return consumer;
            }
            await ctx.stub.deleteState(consumer.key);
            return 'Deleted Successfully';
        }catch(err){
            return err;
        }
    }
}

module.exports = ContractConsumers;
