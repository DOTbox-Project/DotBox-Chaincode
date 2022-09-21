'use strict';

const ContractProducers = require('./contracts/contractProducers');
const ContractProcessors = require('./contracts/contractProcessors');
const ContractRegulators = require('./contracts/contractRegulators');
const ContractTraders = require('./contracts/contractTraders');
const ContractConsumers = require('./contracts/contractConsumer');
const ContractFFB = require('./contracts/contractFFB');
const ContractLogin = require('./contracts/contractLogin');
const ContractPalmOil = require('./contracts/contractPalmOil');




module.exports.ContractProducers = ContractProducers;
module.exports.ContractProcessors = ContractProcessors;
module.exports.ContractRegulators = ContractRegulators;
module.exports.ContractTraders = ContractTraders;
module.exports.ContractConsumers = ContractConsumers;
module.exports.ContractFFB = ContractFFB;
module.exports.ContractPalmOil = ContractPalmOil;
module.exports.ContractLogin = ContractLogin;


module.exports.contracts = [ContractProducers,ContractProcessors,ContractRegulators,ContractTraders,ContractConsumers,ContractFFB,ContractPalmOil,ContractLogin];

