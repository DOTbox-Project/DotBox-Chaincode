const {assetPalmOil,assetUnitPalmOil,assetRepackagedUnitPalmOil} = require('../assets/assetPalmOil');
const assetProductionLocationData = require('../assets/assetProductLocationData');
const assetTestEntry = require('../assets/assetTestEntry');
const { checkProcessorExistsById } = require('../utils/processorUtils');
const {checkRegulatorExistsById} =require('../utils/regulatorUtils')
const {Contract} = require('fabric-contract-api');

class ContractPalmOil extends Contract{
    constructor(){
        super('ContractPalmOil');
        this.TxId = '';
    }

    async beforeTransaction(ctx){
        this.TxId = await ctx.stub.getTxID();
        console.log(this.TxId);
    }

    // Palm Oil Batch

    async createPalmOilBatch(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const params = args.map(element=>element);
            const palmOil = {
                batchId:params[1],
                componentProductIDs:params[2],
                productionDate:params[3],
                expirationDate:params[4],
                unitType:params[5],
                unitQuantity:params[6],
                volumePerUnit:params[7],
                producedBy:params[8]
            }

            const newPalmOilBatch = new assetPalmOil(palmOil);
            const processor = await checkProcessorExistsById(palmOil.producedBy);
            if(processor === 'Processor not found'){
                return processor;
            }
            const ffbExists = componentProductIDs.split(',').forEach(async(component)=>{
                const ffb = await checkFFBExistsById(component);
                if(ffb === 'No ffb found'){
                    return 0;
                }
                return 1;
            })
            if(ffbExists.some(0)){
                return 'FFBs used to create palm oil do not exist';
            }
            // Create a new palm oil batch
            const indexKey = 'palmoil~processorId~palmOilId';
            const key = await ctx.stub.createCompositeKey(indexKey,['palmoil',newPalmOilBatch.producedBy,newPalmOilBatch.palmOilId])

            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newPalmOilBatch)));

            await this.createPalmOilLocationData(ctx,processor.processor.processorLocation);
            
            // Create unit palm oil based on the unitQuantity 
            let counter = 1;
            while(counter <= palmOil.unitQuantity){
                await this.createUnitPalmOil(ctx,newPalmOilBatch.batchId,newLocation.locationId,processor.processor.processorId,palmOil.volumePerUnit);
                counter = counter + 1;
            }

            return newPalmOilBatch;
        }catch(err){
            return err;
        }
    }

    async getPalmOilByProcessorId(ctx,processorId){
        try{
            const queryString = {
                selector:{
                    docType:"palmOil",
                    producedBy:processorId
                }
            }

            let palmOilIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const palmOilBatches = [];
            while(true){
                let palmOil = await palmOilIterator.next();
                if(palmOil.value){
                    palmOilBatches.push({key:palmOil.value.key,palmOilBatch:JSON.parse(palmOil.value.value.toString('utf-8'))})
                }
                if(palmOil.done){
                    await palmOilIterator.close();
                    if(palmOilBatches.length === 0){
                        return 'No palm Oil produced by processor';
                    }
                    return palmOilBatches;
                }
            }
        }catch(err){
            return err;
        }
    }

    async getPalmOilByBatchId(ctx,batchId){
        try{
            const queryString = {
                selector:{
                    "docType":"palmOil",
                    "batchId":batchId
                }
            }

            let palmOilIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const palmOilBatches = [];
            while(true){
                let palmOil = await palmOilIterator.next();
                if(palmOil.value){
                    palmOilBatches.push({key:palmOil.value.key,palmOilBatch:JSON.parse(palmOil.value.value.toString('utf-8'))})
                }
                if(palmOil.done){
                    await palmOilIterator.close();
                    if(palmOilBatches.length === 0){
                        return 'Palm Oil Batch not found';
                    }
                    return palmOilBatches[0];
                }
            }
        }catch(err){
            return err;
        }
    }

    async updatePalmOilBatchById(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const palmOilBatchId = args[1];
            const newValues = {}
            args.forEach((element,index)=>{
                if(index>=2 && index%2==0){
                    newValues[element] = args[index+1]
                }
            })

            const palmOilBatch = await this.getPalmOilByBatchId(ctx,palmOilBatchId);
            if(palmOilBatch === 'Palm Oil Batch not found'){
                return palmOilBatch;
            }
            const updates = {
                ...palmOilBatch.palmOilBatch,
                ...newValues
            }
            await ctx.stub.putState(palmOilBatch.key,Buffer.from(JSON.stringify(updates)));
            return {key:palmOilBatch.key,palmOilBatch:updates};
        }catch(err){
            return err;
        }
    }

    async deletePalmOilBatchById(ctx,palmOilBatchId){
        try{
            const palmOil = await this.getPalmOilByBatchId(ctx,palmOilBatchId);
            if(palmOil === 'Palm Oil Batch not found'){
                return palmOil;
            }
            await ctx.stub.deleteState(palmOil.key);
            return "Deleted Successfully";
        }catch(err){
            return err;
        }
    }

    async getPalmOilBatchHistoryByBatchId(ctx,palmOilBatchId){
        try{
            const palmOilBatch = await this.getPalmOilByBatchId(ctx,palmOilBatchId);
            if(palmOilBatch === 'Palm Oil Batch not found'){
                return palmOilBatch;
            }
            let historyIterator = await ctx.stub.getHistoryForKey(palmOilBatch.key);
            const historyRes = {};
            while(true){
                let history = await historyIterator.next();
                if(history.value){
                    console.log(history.value);
                    historyRes.timestamp = history.value.timestamp;
                    historyRes.history = JSON.parse(history.value.value.toString('utf-8'));
                }
                if(history.done){
                    await historyIterator.close();
                    return historyRes
                }
            }
        }catch(err){
            return err;
        }
    }

    // Unit Palm Oil

    async createUnitPalmOil(ctx,batchId,location,owner,volume){
        try{
            const palmOil = await this.getPalmOilByBatchId(ctx,batchId);
            if(palmOil === 'Palm Oil Batch not found'){
                return palmOil;
            }
            const unitPalmOil = {
                batchId,
                location,
                owner,
                volume,
            }

            const newUnitPalmOil = new assetUnitPalmOil(unitPalmOil);
            const key = await ctx.createCompositeKey('unitpalmoil~palmoilbatch~unitpalmoilId',['unitpalmoil',newUnitPalmOil.batchId,newUnitPalmOil.unitId]);
            await ctx.stub.putState(key,Buffer.from(JSON.stringify(newUnitPalmOil)));
            return newUnitPalmOil;

        }catch(err){
            return err;
        }
    }

    async getUnitPalmOilById(ctx,unitPalmOilId){
        try{
            const queryString = {
                selector:{
                    docType:"unitPalmOil",
                    unitId:unitPalmOilId
                }
            }

            let unitPalmOilIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const unitPalmOilList = [];
            while(true){
                let unitPalmOil = await unitPalmOilIterator.next();
                if(unitPalmOil.value){
                    unitPalmOilList.push({key:unitPalmOil.value.key,unitPalmOil:JSON.parse(unitPalmOil.value.value.toString('utf-8'))})
                }
                if(unitPalmOil.done){
                    await unitPalmOilIterator.close();
                    if(unitPalmOilList.length===0){
                        return "No unit palm oil found";
                    }
                    return unitPalmOilList[0];
                }
            }
        }catch(err){
            return err;
        }
    }

    async updateUnitPalmOilById(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const unitPalmOilId = args[1];
            const newValues = {}
            args.forEach((element,index)=>{
                if(index>=2 && index%2==0){
                    newValues[element] = args[index+1]
                }
            })

            const unitPalmOil = await this.getUnitPalmOilById(ctx,unitPalmOilId);
            if(unitPalmOil === 'No unit palm oil found'){
                return unitPalmOil;
            }
            const updates = {
                ...unitPalmOil.unitPalmOil,
                ...newValues
            }
            await ctx.stub.putState(unitPalmOil.key,Buffer.from(JSON.stringify(updates)));
            return {key:unitPalmOil.key,unitPalmOil:updates};
        }catch(err){
            return err;
        }
    }

    async deleteUnitPalmOilById(ctx,unitPalmOilId){
        try{
            const unitPalmOil = await this.getUnitPalmOilById(ctx,unitPalmOilId);
            if(unitPalmOil === 'No unit palm oil found'){
                return unitPalmOil;
            }
            await ctx.stub.deleteState(unitPalmOil.key);
            return "Deleted successfully"
        }catch(err){
            return err;
        }
    }

    // Change Palm Oil Unit Owner
    async changePalmOilUnitOwner(ctx,unitPalmOilId,oldOwnerId,newOwnerId){
        try{
            const palmOilUnit = await this.getUnitPalmOilById(ctx,unitPalmOilId);
            if(palmOilUnit === 'No unit palm oil found'){
                return palmOilUnit;
            }
            if(palmOilUnit.unitPalmOil.owner === oldOwnerId){
                palmOilUnit.unitPalmOil.owner = newOwnerId;
                await ctx.stub.putState(palmOilUnit.key,Buffer.from(JSON.stringify(palmOilUnit.unitPalmOil)))
                return {key:palmOilUnit.key,unitPalmOil:palmOilUnit.unitPalmOil};
            }
            return "You are not the previous owner";
        }catch(err){
            return err;
        }
    }

    async getUnitPalmOilHistoryById(ctx,unitPalmOilId){
        try{
            const unitPalmOil = await this.getUnitPalmOilById(ctx,unitPalmOilId);
            if(unitPalmOil === 'No unit palm oil found'){
                return unitPalmOil;
            }
            let historyIterator = await ctx.stub.getHistoryForKey(unitPalmOil.key);
            const historyRes = {};
            while(true){
                let history = await historyIterator.next();
                if(history.value){
                    console.log(history.value);
                    historyRes.timestamp = history.value.timestamp;
                    historyRes.history = JSON.parse(history.value.value.toString('utf-8'));
                }
                if(history.done){
                    await historyIterator.close();
                    return historyRes
                }
            }
        }catch(err){
            return err;
        }
    }

    // Palm Oil Location Data

    async createPalmOilLocationData(ctx,location){
        try{
            // Create a new location entry
            const newLocation = new assetProductionLocationData(location);
            await ctx.stub.putState(newLocation.locationId,Buffer,from(JSON.stringify(newLocation)));
            return newLocation;
        }catch(err){
            return err;
        }
    }

    async getPalmOilLocationData(ctx,locationId){
        try{
            const locationAsByte = await ctx.stub.getState(locationId);
            if(!locationAsByte || locationAsByte.length === 0){
                return 'location not found';
            }
            const location = JSON.parse(locationAsByte.toString('utf-8'));
            return {key:location.locationId,locationData:location};
        }catch(err){
            return err;
        }
    }

    async changePalmOilLocation(ctx,unitPalmOilId,newLocation){
        try{
            const unitPalmOil = await this.getUnitPalmOilById(ctx,unitPalmOilId);
            if(unitPalmOil === 'No unit palm oil found'){
                return unitPalmOil;
            }
            const currentLocationData = await this.getPalmOilLocationData(ctx,unitPalmOil.location);
            currentLocationData.locationData.previousLocations = currentLocationData.locationData.previousLocations.split(',').push(currentLocationData.locationData.currentLocation).join(",");
            currentLocationData.locationData.currentLocation = newLocation;
            await ctx.stub.putState(currentLocationData.key,Buffer.from(JSON.stringify(currentLocationData.locationData)));
            return {key:currentLocationData.key,locationData:currentLocationData.locationData};
        }catch(err){
            return err;
        }
    }

    async removeLocationFromPalmOilLocationData(ctx,unitPalmOilId,location){
        try{
            const unitPalmOil = await this.getUnitPalmOilById(ctx,unitPalmOilId);
            if(unitPalmOil === 'No unit palm oil found'){
                return unitPalmOil;
            }
            const currentLocationData = await this.getPalmOilLocationData(ctx,unitPalmOil.location);
            if(currentLocationData.locationData.currentLocation === location){
                const locationData = currentLocationData.locationData;
                const previousLocations = locationData.previousLocations.split(',');
                locationData.currentLocation = [previousLocations.length - 1];
                previousLocations.splice(previousLocations.length - 1,1);
                locationData.previousLocations = previousLocations.join(',');
                await ctx.stub.putState(currentLocationData.key,Buffer.from(JSON.stringify(locationData)));
                return {key:currentLocationData.key,locationData:locationData};
            }
            currentLocationData.locationData.previousLocations = currentLocationData.locationData.previousLocations.split(',').filter(locationData => locationData !== location).join(',');
            await ctx.stub.putState(currentLocationData.key,Buffer.from(JSON.stringify(currentLocationData.locationData)));
        }catch(err){
            return err;
        }
    }

    async getLocationHistoryById(ctx,locationId){
        try{
            const locationData = await this.getPalmOilLocationData(ctx,locationId);
            if(locationData === 'location not found'){
                return locationData;
            }
            let historyIterator = await ctx.stub.getHistoryForKey(locationData.key);
            const historyRes = {};
            while(true){
                let history = await historyIterator.next();
                if(history.value){
                    console.log(history.value);
                    historyRes.timestamp = history.value.timestamp;
                    historyRes.history = JSON.parse(history.value.value.toString('utf-8'));
                }
                if(history.done){
                    await historyIterator.close();
                    return historyRes
                }
            }
        }catch(err){
            return err;
        }
    }
    // Palm Oil Test Data
    async createPalmOilTestEntry(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const params = args.map(element=>element);
            const testEntry = {
                tester:params[1],
                testTimestamp: params[2],
                moistureContent:params[3],
                ffaLevel:params[4],
                color:params[5],
                sampleTested:params[6],
                organization:params[7]
            }

            const newTestEntry = new assetTestEntry(testEntry);
            const processor = await checkProcessorExistsById(ctx,testEntry.organization);
            const regulator = await checkRegulatorExistsById(ctx,testEntry.organization);

            if(processor === 'Processor not found' && regulator === 'Regulator not found'){
                return "Test Organization is neither a Processor nor Regulator";
            }
        
            await ctx.stub.putState(newTestEntry.testId,Buffer.from(JSON.stringify(newTestEntry)));
            return newTestEntry;
        }catch(err){
            return err;
        }
    }

    async getPalmOilTestEntryById(ctx,palmOilTestEntryId){
        try{
            const queryString = {
                selector:{
                    docType:"testEntry",
                    testId:palmOilTestEntryId
                }
            }

            const testIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const tests = [];
            while(true){
                const test = await testIterator.next();
                if(test.value){
                    tests.push({key:test.value.key,test:JSON.parse(test.value.value.toString('utf-8'))});
                }
                if(test.done){
                    await testIterator.close();
                    if(tests.length === 0){
                        return 'Test entry not found';
                    }
                    return tests[0];
                }
            }
        }catch(err){
            return err;
        }
    }

    async getPalmOilTestEntryByOrganizationId(ctx,organizationId){
        try{
            const queryString = {
                selector:{
                    docType:"testEntry",
                    testedBy:organizationId
                }
            }

            const testIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const tests = [];
            while(true){
                const test = await testIterator.next();
                if(test.value){
                    tests.push({key:test.value.key,test:JSON.parse(test.value.value.toString('utf-8'))});
                }
                if(test.done){
                    await testIterator.close();
                    if(tests.length === 0){
                        return 'Test entry not found';
                    }
                    return tests[0];
                }
            }
        }catch(err){
            return err;
        }
    }

    async updatePalmOilTestEntryById(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const palmOilTestEntryId = args[1];
            const newValues = {}
            args.forEach((element,index)=>{
                if(index>=2 && index%2==0){
                    newValues[element] = args[index+1]
                }
            })

            const testEntry = await this.getPalmOilTestEntryById(ctx,palmOilTestEntryId);
            if(testEntry === 'Test entry not found'){
                return testEntry;
            }
            const updates = {
                ...testEntry.test,
                ...newValues
            }
            await ctx.stub.putState(testEntry.key,Buffer.from(JSON.stringify(updates)));
            return {key:testEntry.key,test:updates};
        }catch(err){
            return err;
        }
    }

    async addTestToPalmOilBatch(ctx,palmOilBatchId,testEntryId){
        try{
            const palmOilBatch = await this.getPalmOilByBatchId(ctx,palmOilBatchId);
            if(palmOilBatch === 'Palm Oil Batch not found'){
                return palmOilBatch;
            }
            const testEntry = await this.getPalmOilTestEntryById(ctx,testEntryId);
            if(testEntry === 'Test entry not found'){
                return testEntry;
            }
            palmOilBatch.palmOilBatch.productTest = palmOilBatch.palmOilBatch.productTest.split(',').push(testEntryId).join(',');
            await ctx.stub.putState(palmOilBatch.key,Buffer.from(JSON.stringify(palmOilBatch.palmOilBatch)));
        }catch(err){
            return err;
        }
    }

    async removeTestFromPalmOilBatch(ctx,palmOilBatchId,testEntryId,organizationId){
        try{
            const palmOilBatch = await this.getPalmOilByBatchId(ctx,palmOilBatchId);
            if(palmOilBatch === 'Palm Oil Batch not found'){
                return palmOilBatch;
            }
            const queryString = {
                selector:{
                    docType:"testEntry",
                    testId:testEntryId,
                    testedBy:organizationId
                }
            }

            const testEntryIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const test = [];
            while(true){
                const testEntry = await testEntryIterator.next();
                if(testEntry.value){
                    test.push({key:testEntry.value.key,test:JSON.parse(testEntry.value.value.toString('utf-8'))})
                }
                if(testEntry.done){
                    await testEntryIterator.close();
                    if(test.length === 0){
                        return "Test entry not found"
                    }
                    break;
                }
            }
            palmOilBatch.palmOilBatch.productTest = palmOilBatch.palmOilBatch.productTest.split(',').filter(id=>id !== testEntryId).join(',');
            await ctx.stub.putState(palmOilBatch.key,palmOilBatch);
            return palmOilBatch;
        }catch(err){
            return err;
        }
    }

    async getPalmOilTestEntryHistory(ctx,testEntryId){
        try{
            const testEntry = await this.getPalmOilTestEntryById(ctx,testEntryId);
            if(testEntry === 'Test entry not found'){
                return testEntry;
            }
            let historyIterator = await ctx.stub.getHistoryForKey(testEntry.key);
            const historyRes = {};
            while(true){
                let history = await historyIterator.next();
                if(history.value){
                    console.log(history.value);
                    historyRes.timestamp = history.value.timestamp;
                    historyRes.history = JSON.parse(history.value.value.toString('utf-8'));
                }
                if(history.done){
                    await historyIterator.close();
                    return historyRes
                }
            }
        }catch(err){
            return err;
        }
    }

    // Palm Oil Approval
    async approvePalmOilBatch(ctx,palmOilBatchId,regulatorId){
        try{
            const queryString = {
                selector:{
                    docType:"testEntry",
                    sampleTested:palmOilBatchId,
                    testedBy:regulatorId
                }
            }

            const testEntryIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
            const testEntry = [];
            while(true){
                const test = await testEntryIterator.next();
                if(test.value){
                    testEntry.push({key:test.value.key,test:JSON.parse(test.value.value.toString('utf-8'))});
                }
                if(test.done){
                    await testEntryIterator.close();
                    if(testEntry.length === 0){
                         return "An approval can't be made without a valid test";
                    }
                    break;
                }
            }

            const palmOilBatch = await this.getPalmOilByBatchId(ctx,palmOilBatchId);
            palmOilBatch.palmOilBatch.approvedBy = palmOil.palmOilBatch.approvedBy.split(',').push(regulatorId).join(',');
            await ctx.putState(palmOilBatch.key,palmOilBatch.palmOilBatch);
            return palmOilBatch;
        }catch(err){
            return err;
        }
    }

    async removeApprovalFromPalmOilBatch(ctx,palmOilBatchId,regulatorId){
        try{
            const palmOilBatch = await this.getPalmOilByBatchId(ctx,palmOilBatchId);
            if(palmOilBatch === 'Palm Oil Batch not found'){
                return palmOilBatch;
            }
            palmOilBatch.palmOilBatch.approvedBy = palmOilBatch.palmOilBatch.approvedBy.split(',').filter(id=>id !== regulatorId).join(',');
            await ctx.putState(palmOilBatch.key,palmOilBatch.palmOilBatch);
            return palmOilBatch;
        }catch(err){
            return err;
        }
    }

    // Repackaging Palm Oil
    async createRepackagedUnitPalmOil(ctx,batchId,componentIds,volume,locationId,owner){
        try{
            const repackagedUnit = {
                componentIds:componentIds,
                batchId:batchId,
                volume:volume,
                locationId:locationId,
                owner:owner
            }

            const newRepackagedUnit = new assetRepackagedUnitPalmOil(repackagedUnit);
            await ctx.putState(newRepackagedUnit.repackagedId,Buffer.from(JSON.stringify(newRepackagedUnit)));

            return {key:newRepackagedUnit.repackagedId,repackagedUnitnewRepackagedUnit};
        }catch(err){
            return err;
        }
    }

    async getRepackagedUnitPalmOilById(ctx,repackagedUnitId){
        try{
            const repackagedUnitAsByte = await ctx.stub.getState(repackagedUnitId);
            if(!repackagedUnitAsByte || repackagedUnitAsByte.length === 0){
                return 'Repackaged unit not found';
            }
            const repackagedUnit = JSON.parse(repackagedUnitAsByte.toString('utf-8'))
            return {key:repackagedUnit.repackagedId,repackagedUnit:repackagedUnit};
        }catch(err){
            return err;
        }
    }

    async updateRepackagedUnitById(ctx){
        try{
            const args = await ctx.stub.getArgs();
            const params = args.map(element=>element);
            const repackagedUnitId = params[1];
            const newValues = {}
            args.forEach((element,index)=>{
                if(index>=2 && index%2==0){
                    newValues[element] = args[index+1]
                }
            })

            const repackagedUnit = await this.getRepackagedUnitPalmOilById(ctx,repackagedUnitId);
            if(repackagedUnit === 'Repackaged unit not found'){
                return repackagedUnit;
            }
            const updates = {
                ...repackagedUnit.repackagedUnit,
                ...newValues
            }
            await ctx.stub.putState(repackagedUnit.key,Buffer.from(JSON.stringify(updates)));
            return {key:repackagedUnit.repackagedId,repackagedUnit:updates};

        }catch(err){
            return err;
        }
    }

    async deleteRepackagedUnitByRepackagedId(ctx,repackagedId){
        try{
            const repackagedUnit = await this.getRepackagedUnitPalmOilById(ctx,repackagedId);
            if(repackagedUnit === 'Repackaged unit not found'){
                return repackagedUnit;
            }
            await ctx.stub.deleteState(repackagedUnit.key);
            return "Deleted Successfully";
        }catch(err){
            return err
        }
    }

    // Change Repackaged Palm Oil Unit Owner
    async changeRepackagedPalmOilUnitOwner(ctx,repackagedUnitPalmOilId,oldOwnerId,newOwnerId){
        try{
            const repackagedPalmOilUnit = await this.getRepackagedUnitPalmOilById(ctx,repackagedUnitPalmOilId);
            if(repackagedPalmOilUnit === 'Repackaged unit not found'){
                return repackagedPalmOilUnit;
            }
            if(repackagedPalmOilUnit.repackagedUnit.owner === oldOwnerId){
                repackagedPalmOilUnit.repackagedUnit.owner = newOwnerId;
                await ctx.stub.putState(repackagedPalmOilUnit.key,Buffer.from(JSON.stringify(repackagedPalmOilUnit.repackagedUnit)))
                return {key:repackagedPalmOilUnit.key,repackagedUnit:repackagedPalmOilUnit.repackagedUnit};
            }
            return "You are not the previous owner";
        }catch(err){
            return err;
        }
    }

    async getRepackagedUnitHistoryById(ctx,repackagedUnitId){
        try{
            const repackagedUnit = await this.getRepackagedUnitPalmOilById(ctx,repackagedUnitId);
            if(repackagedUnit === 'Repackaged unit not found'){
                return repackagedUnit;
            }
            let historyIterator = await ctx.stub.getHistoryForKey(repackagedUnit.key);
            const historyRes = {};
            while(true){
                let history = await historyIterator.next();
                if(history.value){
                    console.log(history.value);
                    historyRes.timestamp = history.value.timestamp;
                    historyRes.history = JSON.parse(history.value.value.toString('utf-8'));
                }
                if(history.done){
                    await historyIterator.close();
                    return historyRes
                }
            }
        }catch(err){
            return err;
        }
    }
}

module.exports = ContractPalmOil;