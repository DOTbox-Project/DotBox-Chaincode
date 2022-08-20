'use strict';

const contractProducers = require('./contracts/contractProducers');
const contractProcessors = require('./contracts/contractProcessors');
const contractRegulators = require('./contracts/contractRegulators');
const contractTraders = require('./contracts/contractTraders');
const contractConsumers = require('./contracts/contractConsumer');

module.exports.ContractProducers = contractProducers;
module.exports.ContractProcessors = contractProcessors;
module.exports.ContractRegulators = contractRegulators;
module.exports.ContractTraders = contractTraders;
module.exports.ContractConsumers = contractConsumers;

module.exports.contracts = [contractConsumers];