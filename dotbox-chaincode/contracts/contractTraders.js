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

    async createTrader(ctx,name,storeName,storeLocation,email,contact,category){
        const trader = {
            name,
            storeName,
            storeLocation,
            email,
            contact,
            category
        }
        try{
            // instantiating a new trader
            const newTrader = new assetTrader(trader);

            const doesTraderExist = await this.getTraderByEmail(ctx,email);
            if (doesTraderExist !== 'Trader not found'){
                return `Trader with email ${email} already exists`;
            }
            
            // creating a composite key
            const indexKey = `trader~email~traderId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['trader',newTrader.email,newTrader.traderId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newTrader)));
            return {key:key,trader:newTrader};
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
                        return 'Trader not found';
                    }else{
                        return traders[0];
                    }
                }
            }
        }catch(err){
            return err;
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
                        return 'No traders created';
                    }else{
                        return traders;
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

    async updateTrader(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const currentEmail = args[1];
            const newValues = {}
            args.forEach((element,index)=>{
                if(index>=2 && index%2==0){
                    newValues[element] = args[index+1]
                }
            })
            let trader = await this.getTraderByEmail(ctx,currentEmail);
            if(trader === 'Trader not found'){
                return trader;
            }
            const updates = {...trader.trader,...newValues};
            let key;
            if (newValues['email'] !== undefined){
                await this.deleteConsumer(ctx,currentEmail);
                const indexKey = `trader~email~traderId`;
                key = await ctx.stub.createCompositeKey(indexKey,['trader',newValues.email,updates.traderId])
            }
            else{
                key = trader.key;
            }
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(updates)));
            return {key:key,trader:updates}
        }catch(err){
            return err;
        }
    }

    async deleteTrader(ctx,email){
        try{
            const trader = await this.getTraderByEmail(ctx,email);
            if(trader === 'Trader not found'){
                return trader;
            }
            await ctx.stub.deleteState(trader.key);
            return 'Deleted Successfully';
        }catch(err){
            return err;
        }
    }
}

module.exports = ContractTraders;
