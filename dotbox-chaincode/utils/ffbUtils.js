const checkFFBExistsById = async (ctx,ffbId) => {
    const queryString = {
        "selector":{
            "docType":"ffb",
            ffbId:ffbId
        }
    }
    let ffbIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
    const allFFBs = []
    while(true){
        let ffb = await ffbIterator.next();
        if(ffb.value){
            allFFBs.push({key:ffb.value.key,ffb:JSON.parse(ffb.value.value.toString('utf-8'))});
        }
        if(ffb.done){
            await ffbIterator.close();
            if(allFFBs.length === 0){
                return 'No ffb found';
            }
            return allFFBs[0];
        }
    }
}

async function checkAllFFBExist(ctx,ffbs){
    const ffbExists = []
    for(let component=0;component < ffbs.length;component++){
        const ffb = await checkFFBExistsById(ctx,ffbs[component]);
        if(ffb === 'No ffb found'){
            ffbExists.push(0);
        }
        else{
            ffbExists.push(1);
        };
    }
    return ffbExists;
    }

module.exports = {checkFFBExistsById,checkAllFFBExist}