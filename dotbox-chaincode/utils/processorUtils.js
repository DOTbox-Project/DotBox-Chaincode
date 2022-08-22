const checkProcessorExistsByKey = async (ctx,keys) => {
    let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('processor~email~processorId',keys);
            // Query the world state with the query iterator
            const processors = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    processors.push({key:res.value.key,processor:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(processors.length === 0){
                        return 'Processor not found';
                    }else{
                        return processors[0];
                    }
                }
            }
}

const checkProcessorExistsById = async (ctx,processorId) => {
    const queryString = {
        "selector":{
            "docType":"processor",
            processorId:processorId
        }
    }
    let processorsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
    const processors = []
    while(true){
        let processor = await processorsIterator.next();
        if(processor.value){
            processors.push({key:processor.value.key,processor:JSON.parse(processor.value.value.toString('utf-8'))});
        }
        if(processor.done){
            await processorsIterator.close();
            if(processors.length === 0){
                return 'Processor not found';
            }
            return processors[0];
        }
    }
}

module.exports = {
    checkProcessorExistsByKey,checkProcessorExistsById
}