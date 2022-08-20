const {v4:uuidv4} = require('uuid')


class TestEntry{
    constructor(testEntry){
        this.testID=uuidv4();
        this.tester=testEntry.tester;
    }
}




// const {v4:uuidv4} = require('uuid')