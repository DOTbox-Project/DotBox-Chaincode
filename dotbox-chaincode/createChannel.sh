export PATH=$(pwd)/build/bin:$PATH

export FABRIC_CFG_PATH=$(pwd)/sampleconfig

configtxgen -channelID ch1 -outputCreateChannelTx ch1.tx -profile SampleSingleMSPChannel -configPath $FABRIC_CFG_PATH

peer channel create -o 127.0.0.1:7050 -c ch1 -f ch1.tx

peer channel join -b ch1.block

