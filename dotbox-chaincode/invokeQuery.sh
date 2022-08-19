#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["createProducer","Joseph Barnes","Shikamaru Farms","Ayeduase","josephbarnes@gmail.com","0547290892"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["createProducer","Gyabeng Elton","Gyabeng Farms","Tema","gyabengelton@gmail.com","02134567009"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["createProducer","Andrews Tang","Tang Plantations","Ada","andrewstang@gmail.com","1234567890"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getProducerByEmail","josephbarnes@gmail.com"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getProducerByEmail","gyabengelton@gmail.com"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getProducerByEmail","andrewstang@gmail.com"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["getAllProducers"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["updateProducer","josephbarnes@gmail.com","name","Nana Benyin","farmName","Shikamaru Oil Palm Plantation"]}'

#CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["updateProducer","gyabengelton@gmail.com","farmLocation","Kumasi"]}'

CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n test -c '{"Args":["deleteProducer","josephbarnes@gmail.com"]}'









