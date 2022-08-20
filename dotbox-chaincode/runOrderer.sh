
export PATH=$(pwd)/build/bin:$PATH

export FABRIC_CFG_PATH=$(pwd)/sampleconfig

configtxgen -profile SampleDevModeSolo -channelID syschannel -outputBlock genesisblock -configPath $FABRIC_CFG_PATH -outputBlock "$(pwd)/sampleconfig/genesisblock"

ORDERER_GENERAL_GENESISPROFILE=SampleDevModeSolo orderer


