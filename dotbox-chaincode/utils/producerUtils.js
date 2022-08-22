const checkProducerExists = async (ctx,keys) => {
    let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('producer~email~producerId',keys);
            // Query the world state with the query iterator
            const producers = [];
            while(true){
                const res = await resultsIterator.next();
                if(res.value){
                    producers.push({key:res.value.key,producer:JSON.parse(res.value.value.toString('utf-8'))});
                }
                if(res.done){
                    await resultsIterator.close();
                    if(producers.length === 0){
                        return 'Producer not found';
                    }else{
                        return producers[0];
                    }
                }
            }
}

module.exports = {
    checkProducerExists
}