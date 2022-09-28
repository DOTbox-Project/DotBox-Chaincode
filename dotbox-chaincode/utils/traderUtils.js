const checkTraderExistsById = async (ctx,traderId) => {
    const queryString = {
        "selector":{
            "docType":"trader",
            userId:traderId
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
                return 'Trader not found';
            }
            return traders[0];
        }
    }
}

module.exports = {checkTraderExistsById}
