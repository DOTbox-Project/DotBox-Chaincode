'use strict';

const contractProducers = require('./contracts/contractProducers');
const contractProcessors = require('./contracts/contractProcessors');
const contractRegulators = require('./contracts/contractRegulators');
const contractTraders = require('./contracts/contractTraders');
const contractConsumers = require('./contracts/contractConsumer');
const contractFFB = require('./contracts/contractFFB');
const contractLogin = require('./contracts/contractLogin')
const { Contract } = require('fabric-contract-api');

module.exports.ContractProducers = contractProducers(Contract);
module.exports.ContractProcessors = contractProcessors(Contract);
module.exports.ContractRegulators = contractRegulators(Contract);
module.exports.ContractTraders = contractTraders(Contract);
module.exports.ContractConsumers = contractConsumers(Contract);
module.exports.ContractFFB = contractFFB(Contract)
module.exports.ContractLogin = contractLogin(Contract)


module.exports.contracts = [contractProcessors(Contract)];