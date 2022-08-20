'use strict';

const contractProducers = require('./contracts/contractProducers');
const contractProcessors = require('./contracts/contractProcessors');
const contractRegulators = require('./contracts/contractRegulators');

module.exports.ContractProducers = contractProducers;
module.exports.ContractProcessors = contractProcessors;
module.exports.ContractRegulators = contractRegulators;

module.exports.contracts = [contractRegulators];