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
                    producers.push({key:res.value.key.toString('utf-8'),producer:res.value.value.toString('utf-8')});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(producers.length === 0){
                        return 'Producer not found';
                    }else{
                        return JSON.stringify(producers[0]);
                    }
                }
            }
        }catch(err){
            return err;
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
                    producers.push({key:res.value.key.toString('utf-8'),producer:res.value.value.toString('utf-8')});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(producers.length === 0){
                        return 'No producers created';
                    }else{
                        return JSON.stringify(producers);
                    }
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
            producer = JSON.parse(producer);
            
            const updates = {...producer.producer,...newValues};
            return updates;
            // await ctx.stub.putState(producer.key,Buffer.from(JSON.stringify(updates)));
            // return JSON.stringify({key:producer.key,producer:updates})
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
            producer = JSON.parse(producer);
            return JSON.stringify(producer.key);
            // await ctx.stub.deleteState(producer.key);
            // return 'Deleted Successfully';
        }catch(err){
            return err;
        }
    }
}

module.exports = ContractProducers;
