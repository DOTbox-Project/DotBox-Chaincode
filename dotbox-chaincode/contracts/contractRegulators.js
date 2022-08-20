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

    async createRegulator(ctx,name,location,email,contact){
        const regulator = {
            name,
            location,
            email,
            contact
        }
        try{
            // instantiating a new regulator
            const newRegulator = new assetRegulator(regulator);

            const doesRegulatorExist = await this.getRegulatorByEmail(ctx,email);
            if (doesRegulatorExist !== 'Regulator not found'){
                return `Regulator with email ${email} already exists`;
            }
            
            // creating a composite key
            const indexKey = `regulator~email~regulatorId`;
            const key = await ctx.stub.createCompositeKey(indexKey,['regulator',newRegulator.email,newRegulator.regulatorId])
            
            // committing the asset to the blockchain and updating the world state
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newRegulator)));
            return JSON.stringify({key:key.toString('utf-8'),regulator:newRegulator});
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

    async updateRegulator(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const currentEmail = args[1];
            const newValues = {}
            args.forEach((element,index)=>{
                if(index>=2 && index%2==0){
                    newValues[element] = args[index+1]
                }
            })
            let regulator = await this.getRegulatorByEmail(ctx,currentEmail);
            if(regulator === 'Regulator not found'){
                return regulator;
            }
            const updates = {...regulator.regulator,...newValues};
            await ctx.stub.putState(regulator.key,Buffer.from(JSON.stringify(updates)));
            return JSON.stringify({key:regulator.key,regulator:updates})
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
