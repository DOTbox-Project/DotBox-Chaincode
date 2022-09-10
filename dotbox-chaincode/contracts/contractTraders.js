'use strict';

const assetTrader = require('../assets/assetTrader');
const {Contract} = require('fabric-contract-api');

class ContractTraders extends Contract{
    constructor(){
        super('ContractTraders');
        this.TxId = '';
    }
    
     async beforeTransaction(ctx){
        this.TxId = ctx.stub.getTxID();
        console.log(this.TxId);
    }

     async createTrader(ctx,traderId,name,storeName,storeLocation,contact,email,category,password){
        try{
            // instantiating a new trader
            const trader = {
                traderId,
                name,
                storeName,
                storeLocation,
                contact,
                email,
                category,
                password
            }
            const newTrader = new assetTrader(trader);

            const doesTraderExist = await this.getTraderByEmail(ctx,trader.email);
            if (JSON.parse(doesTraderExist).error !== 'Trader not found'){
                return JSON.stringify({error:`Trader with email ${email} already exists`});
            }
            
            // creating a composite key
            const indexKey = `trader~email~traderId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['trader',newTrader.email,newTrader.traderId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newTrader)));
            delete trader.password;
            return JSON.stringify({key:key,trader:trader});
        }catch(err){
            return err;
        }
    }

     async getTraderByEmail(ctx,email){
        try{
            // collect the keys
            let keys = ['trader',email];
            // retrieve the query iterator
            let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('trader~email~traderId',keys);
            // Query the world state with the query iterator
            const traders = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    traders.push({key:res.value.key,trader:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(traders.length === 0){
                        return JSON.stringify({error:'Trader not found'});
                    }else{
                        return JSON.stringify(traders[0]);
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

     async getTraderById(ctx,traderId){
        try{
            const queryString = {
                "selector":{
                    "docType":"trader",
                    traderId:traderId
                }
            }
            let tradersIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const traders = []
            while(true){
                let trader = await tradersIterator.next();
                if(trader.value){
                    traders.push({key:trader.value.key,trader:JSON.parse(trader.value.value.toString('utf-8'))});
                }
                if(trader.done){
                    await tradersIterator.close();
                    if(traders.length === 0){
                        return JSON.stringify({error:"Trader not found"})
                    }
                    return JSON.stringify(traders[0]);
                }
            }
        }catch(err){
            return err
        }
    }

     async getAllTraders(ctx){
        try{
            // collect the keys
            let keys = ['trader'];
            // retrieve the query iterator
            let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('trader~email~traderId',keys);
            // Query the world state with the query iterator
            const traders = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    traders.push({key:res.value.key,trader:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(traders.length === 0){
                        return JSON.stringify({error:'No traders created'});
                    }else{
                        return JSON.stringify({traders});
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

     async getTradersByQueryParams(ctx){
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
                    "docType":"trader",
                    ...newValues
                }
            }
            let tradersIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const traders = []
            while(true){
                let trader = await tradersIterator.next();
                if(trader.value){
                    traders.push({key:trader.value.key,trader:JSON.parse(trader.value.value.toString('utf-8'))});
                }
                if(trader.done){
                    await tradersIterator.close();
                    if(traders.length === 0){
                        return JSON.stringify({error:"Trader not found"})
                    }
                    return JSON.stringify({traders});
                }
            }
        }catch(err){
            return err;
        }
    }

     async updateTrader(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const traderId = args[1];
            const newValues = {};
            args.forEach((element,index)=>{
                if(index % 2 === 0 && index > 1){
                    newValues[element] = args[index+1];
                }
            });
            let trader = await this.getTraderById(ctx,traderId);
            trader = JSON.parse(trader);
            if(trader.error === 'Trader not found'){
                return JSON.stringify(trader);
            }
            const updates = {...trader.trader,...newValues};
            let key;
            if (newValues['email'] !== undefined){
                await this.deleteConsumer(ctx,traderId);
                const indexKey = `trader~email~traderId`;
                key = await ctx.stub.createCompositeKey(indexKey,['trader',newValues.email,updates.traderId])
            }
            else{
                key = trader.key;
            }
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(updates)));
            return JSON.stringify({key:key,trader:updates});
        }catch(err){
            return err;
        }
    }

     async deleteTrader(ctx,traderId){
        try{
            const trader = await this.getTraderById(ctx,traderId);
            if(JSON.parse(trader).error === 'Trader not found'){
                return trader;
            }
            await ctx.stub.deleteState(JSON.parse(trader).key);
            return JSON.stringify({message:'Deleted Successfully'});
        }catch(err){
            return err;
        }
    }
}
module.exports = ContractTraders
