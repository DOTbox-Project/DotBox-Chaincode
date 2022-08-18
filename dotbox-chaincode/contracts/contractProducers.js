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
            const indexKey = `email~producerId`;
            const key = await ctx.stub.createCompositeKey(indexKey,[newProducer.email,newProducer.producerId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newProducer)));
            return JSON.stringify(newProducer);
        }catch(err){
            throw new Error(`This transaction ${this.TxId} cannot be saved ${err}`)
        }
    }

    async getProducerByEmail(ctx,email){
        // collect the keys
        let keys = [email];
        // retrieve the query iterator
        let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('email~producerId',keys);
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
    }

    async getAllProducers(ctx){
        const startKey = '';
        const endKey = '';
        const allProducers = [];
        const producersIterator = await ctx.stub.getStateByRange(startKey,endKey);
        while(true){
            const producer = producersIterator.next();
            if(producer.value){
                allProducers.push({key:producer.value.key.toString('utf-8'),producer:JSON.parse(producer.value.value.toString('utf-8'))})
            }
            if(producersIterator.done){
                producersIterator.close();
                return JSON.stringify({producers:allProducers});
            }
        }
    }

    async updateProducer(ctx){
        const args = ctx.stub.getArgs();
        const currentEmail = args[1];
        const newValues = {}
        for(let i=1;i<args.length;i+2){
            newValues[args[i]] = args[i+1];
        }
        let producer = this.getProducerByEmail(ctx,currentEmail);
        if(producer === 'Producer not found'){
            return producer;
        }
        producer = JSON.parse(producer);
        const updates = {...producer.producer,...newValues};
        await ctx.stub.putState(producer.key,Buffer.from(JSON.stringify(updates)));
        return JSON.stringify({key:producer.key,producer:updates})
    }

    async deleteProducer(ctx,email){
        const producer = this.getProducerByEmail(ctx,email);
        if(producer === 'Producer not found'){
            return producer;
        }
        producer = JSON.parse(producer);
        await ctx.stub.deleteState(producer.key);
        return 'Deleted Successfully';
    }
}

module.exports = ContractProducers;
