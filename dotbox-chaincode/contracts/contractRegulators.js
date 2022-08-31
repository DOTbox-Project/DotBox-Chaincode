'use strict';

const assetRegulator = require('../assets/assetRegulator');
const {Contract} = require('fabric-contract-api');

function regulators(Contract){
class ContractRegulators extends Contract{
    constructor(){
        super('ContractRegulators');
        this.TxId = '';
    }
    
     async beforeTransaction(ctx){
        this.TxId = ctx.stub.getTxID();
        console.log(this.TxId);
    }

     async createRegulator(ctx,regulatorId,name,contact,email,location,password){
        try{
            // instantiating a new regulator
            const regulator = {
                regulatorId,
                name,
                contact,
                email,
                location,
                password
            }
            const newRegulator = new assetRegulator(regulator);

            const doesRegulatorExist = await this.getRegulatorByEmail(ctx,regulator.email);
            if (JSON.parse(doesRegulatorExist).error !== 'Regulator not found'){
                return JSON.stringify({error:`Regulator with email ${email} already exists`});
            }
            
            // creating a composite key
            const indexKey = `regulator~email~regulatorId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['regulator',newRegulator.email,newRegulator.regulatorId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newRegulator)));
            delete regulator.password;
            return JSON.stringify({key:key,regulator:regulator});
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
                        return JSON.stringify({error:'Regulator not found'});
                    }else{
                        return JSON.stringify(regulators[0]);
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
                    if(regulators.length === 0){
                        return JSON.stringify({error:'Regulator not found'})
                    }
                    return JSON.stringify(regulators[0]);
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
                        return JSON.stringify({error:'No regulators created'});
                    }else{
                        return JSON.stringify({regulators});
                    }
                }
            }
        }catch(err){
            return err;
        }
    }

     async getRegulatorsByQueryParams(ctx){
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
                    "docType":"regulator",
                    ...newValues
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
                    if(regulators.length === 0){
                        return JSON.stringify({error:'Regulator not found'})
                    }
                    return JSON.stringify({regulators});
                }
            }
        }catch(err){
            return err;
        }
    }

     async updateRegulator(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const regulatorId = args[1];
            const newValues = {};
            args.forEach((element,index)=>{
                if(index % 2 === 0 && index > 1){
                    newValues[element] = args[index+1];
                }
            });                 
            let regulator = await this.getRegulatorBId(ctx,regulatorId);
            regulator = JSON.parse(regulator)
            if(regulator.error === 'Regulator not found'){
                return JSON.stringify(regulator);
            }
            const updates = {...regulator.regulator,...newValues};
            let key;
            if (newValues['email'] !== undefined){
                await this.deleteRegulator(ctx,regulatorId);
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

     async deleteRegulator(ctx,regulatorId){
        try{
            const regulator = await this.getRegulatorById(ctx,regulatorId);
            if(JSON.parse(regulator).error === 'Regulator not found'){
                return regulator;
            }
            await ctx.stub.deleteState(JSON.parse(regulator).key);
            return JSON.stringify({message:'Deleted Successfully'});
        }catch(err){
            return err;
        }
    }
}
return ContractRegulators
}
module.exports = regulators;
