'use strict';
const { Contract } = require('fabric-contract-api');
class ContractLogin extends Contract {
    constructor(){
        super();
        this.TxId = '';
    }

    async beforeTransaction(ctx){
        this.TxId = ctx.stub.getTxID()
    }

    async getUserDetails(ctx,email){
        try{       
            const queryString = {
                "selector":{
                    "email":email
                }
            }
            let usersIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const user = []
            while(true){
                let currentUser = await usersIterator.next();
                if(currentUser.value){
                    user.push({key:currentUser.value.key,user:JSON.parse(currentUser.value.value.toString('utf-8'))});
                }
                if(currentUser.done){
                    await usersIterator.close();
                    if(user.length === 0){
                        return JSON.stringify({error:'User does not exist'});
                    }
                    return JSON.stringify(user[0]);
                }
            }
        }catch(err){
            return err;
        }
    }
}    



module.exports = ContractLogin;