'use strict';

function login(Contract){
    class ContractLogin extends Contract {
        constructor(){
            super('Contract Login');
            this.TxId = '';
        }

         async beforeTransaction(ctx){
            this.TxId = await ctx.stub.getTxID()
        }

         async getUserDetails(ctx,email){
            const queryString = {
                selector:{
                    email:email
                }
            }

            const queryIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            let user = [];
            while(true){
                let currentUser = await queryIterator.next();
                if(currentUser.value){
                    user.push({key:currentUser.value.key,user:JSON.parse(currentUser.value.value.toString('utf-8'))});
                }
                if(currentUser.done){
                    await queryIterator.close();
                    if(user.length === 0){
                        return JSON.stringify({error:"User does not exist"});
                    }
                    return JSON.stringify(user[0]);
                }
            }
        }
    }

    return ContractLogin;
}

module.exports = login;