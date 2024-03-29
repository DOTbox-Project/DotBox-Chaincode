const {v4:uuidv4} = require('uuid')


class TestEntry{
    constructor(testEntry){
        this.testId=testEntry.testEntryId;
        this.tester=testEntry.tester;
        this.testTimestamp=testEntry.testTimestamp;
        this.moistureContent=testEntry.moistureContent;
        this.ffaLevel=testEntry.ffaLevel;
        this.color=testEntry.color;
        this.sampleTested=testEntry.sampleTested;
        this.testedBy=testEntry.organization;
        this.docType='testEntry';
    }
}

module.exports = TestEntry;
