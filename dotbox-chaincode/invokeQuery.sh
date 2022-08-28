# Testing Producer Contract

# Create Producer

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["createProducer","Joseph Barnes","Shikamaru Farms","Ayeduase","josephbarnes@gmail.com","0547290892"]}' --isInit

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["createProducer","Gyabeng Elton","Gyabeng Farms","Tema","gyabengelton@gmail.com","02134567009"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["createProducer","Andrews Tang","Tang Plantations","Ada","andrewstang@gmail.com","1234567890"]}'

# Get Producer By Email
#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getProducerByEmail","josephbarnes@gmail.com"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getProducerByEmail","gyabengelton@gmail.com"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getProducerByEmail","andrewstang@gmail.com"]}'

# Get All Producers

CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode query -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getAllProducers"]}'

# Update Producer

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["updateProducer","josephbarnes@gmail.com","name","Nana Benyin","farmName","Shikamaru Oil Palm Plantation"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["updateProducer","gyabengelton@gmail.com","farmLocation","Kumasi","farmName","Elton Oil Farms"]}'

# Delete Producer

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["deleteProducer","josephbarnes@gmail.com"]}'

# Testing Processor Contract

# Create Processor
#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["createProcessor","Juabeng Oil Mills","Kumasi, Juabeng","jomill@mill.com","0543787367","true","2017-30-20","RSPO,FDA,GSA"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["createProcessor","Benab Oil Mills","Accra, Cantoment","benab@benab.com","0543787367","true","2017-30-20","RSPO,FDA,GSA"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["createProcessor","Benso Oil Mills","Kumasi, Benso","benso@mill.com","0543787367","true","2017-30-20","RSPO,FDA,GSA"]}'

# Get Processor By Email

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getProcessorByEmail","jomill@mill.com"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getProcessorByEmail","benab@benab.com"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getProcessorByEmail","benso@mill.com"]}'

# Get All Processors
#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getAllProcessors"]}'

# Update Processor
#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["updateProcessor","benso@mill.com","processorName","Benso Oil Mills","lastCertified","2022-09-15"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["updateProcessor","benab@benab.com","processorLocation","Ayeduase","contact","0243576890"]}'

# Delete Processor

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["deleteProcessor","benso@mill.com"]}'

# Testing Regulator Contract

# Create Regulator
#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["createRegulator","Food and Drugs Authority","Accra, Osu","mofa@gh.gov.com","0543787367"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["createRegulator","Ghana Standards Authority","Accra, Cantoment","gsa@gh.gov.com","0543787367"]}'

# Get Regulator By Email

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getRegulatorByEmail","mofa@gh.gov.com"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getRegulatorByEmail","gsa@gh.gov.com"]}'

# Get All Regulators
#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getAllRegulators"]}'

# Update Regulator
#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["updateRegulator","mofa@gh.gov.com","regulatorName","Ministry of Foods and Agriculture"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["updateRegulator","gsa@gh.gov.com","regulatorLocation","Accra, Circle","contact","0243576890"]}'


# Delete Regulator

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["deleteRegulator","mofa@gh.gov.com"]}'











