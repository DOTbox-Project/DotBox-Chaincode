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