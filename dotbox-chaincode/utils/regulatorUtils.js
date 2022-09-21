const checkRegulatorExistsById = async (ctx,regulatorId) => {
    const queryString = {
        "selector":{
            "docType":"regulator",
            userId:regulatorId
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
                return 'Regulator not found';
            }
            return regulators[0];
        }
    }
}

module.exports = {checkRegulatorExistsById}