'use strict';

const contractProducers = require('./contracts/contractProducers');
const contractProcessors = require('./contracts/contractProcessors');

module.exports.ContractProducers = contractProducers;
module.exports.ContractProcessors = contractProcessors;
module.exports.contracts = [contractProducers];