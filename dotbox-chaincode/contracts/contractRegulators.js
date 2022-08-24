'use strict';

const assetRegulator = require('../assets/assetRegulator');
const {Contract} = require('fabric-contract-api');

class ContractRegulators extends Contract{
    constructor(){
        super('ContractRegulators');
        this.TxId = '';
    }
    
    async beforeTransaction(ctx){
        this.TxId = ctx.stub.getTxID();
        console.log(this.TxId);
    }

    async createRegulator(ctx,regulator){
        try{
            // instantiating a new regulator
            const newRegulator = new assetRegulator(SON.parse(regulator));

            const doesRegulatorExist = await this.getRegulatorByEmail(ctx,regulator.email);
            if (doesRegulatorExist !== 'Regulator not found'){
                return `Regulator with email ${email} already exists`;
            }
            
            // creating a composite key
            const indexKey = `regulator~email~regulatorId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['regulator',newRegulator.email,newRegulator.regulatorId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newRegulator)));
            return {key:key,regulator:newRegulator};
        }catch(err){
            return err;
        }
    }

    async getRegulatorByEmail(ctx,email){
        try{
            // collect the keys
            let keys = ['regulator',email];
            // retrieve the query iterator
            let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('regulator~email~regulatorId',keys);
            // Query the world state with the query iterator
            const regulators = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    regulators.push({key:res.value.key,regulator:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(regulators.length === 0){
                        return 'Regulator not found';
                    }else{
                        return regulators[0];
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

    async getRegulatorById(ctx,regulatorId){
        try{
            const queryString = {
                "selector":{
                    "docType":"regulator",
                    regulatorId:regulatorId
                }
            }
            let regulatorsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const regulators = []
            while(true){
                let regulator = await regulatorsIterator.next();
                if(regulator.value){
                    regulators.push({key:regulator.value.key,regulator:JSON.parse(regulator.value.value.toString('utf-8'))});
                }
                if(regulator.done){
                    await regulatorsIterator.close();
                    return regulators[0];
                }
            }
        }catch(err){
            return err
        }
    }

    async getAllRegulators(ctx){
        try{
            // collect the keys
            let keys = ['regulator'];
            // retrieve the query iterator
            let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('regulator~email~regulatorId',keys);
            // Query the world state with the query iterator
            const regulators = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    regulators.push({key:res.value.key,regulator:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(regulators.length === 0){
                        return 'No regulators created';
                    }else{
                        return regulators;
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

    async getRegulatorsByQueryParams(ctx,params){
        try{
            const newValues = JSON.parse(params);
            const queryString = {
                "selector":{
                    "docType":"trader",
                    ...newValues
                }
            }
            let regulatorsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const traders = []
            while(true){
                let trader = await regulatorsIterator.next();
                if(trader.value){
                    traders.push({key:trader.value.key,trader:JSON.parse(trader.value.value.toString('utf-8'))});
                }
                if(trader.done){
                    await regulatorsIterator.close();
                    return traders;
                }
            }
        }catch(err){
            return err;
        }
    }

    async updateRegulator(ctx,currentEmail,updatedValues){
        try{
            const newValues = JSON.parse(updatedValues);
            let regulator = await this.getRegulatorByEmail(ctx,currentEmail);
            if(regulator === 'Regulator not found'){
                return regulator;
            }
            const updates = {...regulator.regulator,...newValues};
            let key;
            if (newValues['email'] !== undefined){
                await this.deleteRegulator(ctx,currentEmail);
                const indexKey = `regulator~email~regulatorId`;
                key = await ctx.stub.createCompositeKey(indexKey,['regulator',newValues.email,updates.regulatorId])
            }
            else{
                key = regulator.key;
            }
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(updates)));
            return JSON.stringify({key:key,regulator:updates})
        }catch(err){
            return err;
        }
    }

    async deleteRegulator(ctx,email){
        try{
            const regulator = await this.getRegulatorByEmail(ctx,email);
            if(regulator === 'Regulator not found'){
                return regulator;
            }
            await ctx.stub.deleteState(regulator.key);
            return 'Deleted Successfully';
        }catch(err){
            return err;
        }
    }
}

module.exports = ContractRegulators;
