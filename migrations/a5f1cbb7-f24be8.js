
module.exports.id = 'a5f1cbb7.f24be8';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow a5f1cbb7.f24be8 update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({"path":"a5f1cbb7.f24be8","type":"flows"}, {
    $set: {"path":"a5f1cbb7.f24be8","body":[{"id":"98666187.e41ee","type":"amqp in","z":"a5f1cbb7.f24be8","name":"event input","topic":"${config.sidechain.rabbit.serviceName}_chrono_sc.revoke","configname":"","iotype":"3","ioname":"events","noack":"0","durablequeue":"0","durableexchange":"0","server":"","servermode":"1","x":116.0173568725586,"y":144.99999237060547,"wires":[["705e3ca6.256bb4","27a50edf.bc2012"]]},{"id":"705e3ca6.256bb4","type":"function","z":"a5f1cbb7.f24be8","name":"prepare exchange","func":"const prefix = global.get('settings.sidechain.mongo.collectionPrefix');\nconst uniqid = global.get('libs.uniqid');\nconst crypto = global.get('libs.crypto');\n\nlet key = uniqid();\nlet swapId = uniqid();\n\nconst swapIdHash = crypto.createHash('sha256').update(key).digest('hex');\n\nif(msg.amqpMessage)\n    msg.amqpMessage.ackMsg();\n\n\nmsg.payload = JSON.parse(msg.payload).payload;\n\nmsg.tokenAddress = msg.payload.symbol;\nmsg.value = parseInt(msg.payload.value);\nmsg.address = msg.payload.by;\n\nmsg.payload = {\n    model: `${prefix}Exchange`, \n    request: {\n       key: key,\n       swapIdHash: swapIdHash,\n       address: msg.payload.by,\n       swapId: swapId    \n       }\n};\n\n\nreturn msg;","outputs":1,"noerr":0,"x":345.0104293823242,"y":144.9131965637207,"wires":[["12e42d7c.971a13"]]},{"id":"12e42d7c.971a13","type":"mongo","z":"a5f1cbb7.f24be8","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"1","dbAlias":"primary.sidechain","x":543.020881652832,"y":145.99659538269043,"wires":[["ce296751.c5ad68"]]},{"id":"ce296751.c5ad68","type":"async-function","z":"a5f1cbb7.f24be8","name":"open swap","func":"const Web3 = global.get('libs.web3');\nconst mainnetProvider = global.get('settings.main.web3.provider');\nconst crypto = global.get('libs.crypto');\nconst symbol = global.get('settings.sidechain.web3.symbol');\nconst middlewareWallet = global.get('settings.sidechain.web3.wallet');\nconst middlewareAddress = `0x${middlewareWallet.getAddress().toString('hex')}`;\n\nconst mainnetProviderInstance = mainnetProvider.getInstance();\n\nconst keyHash = crypto.createHash('sha256').update(msg.payload.key).digest('hex');\n    \n\nconst contracts = global.get('settings.main.contracts');\nconst mainnetWeb3 = new Web3(mainnetProviderInstance);\n\ncontracts.ChronoBankPlatform.setProvider(mainnetWeb3.currentProvider);\ncontracts.TimeHolder.setProvider(mainnetWeb3.currentProvider);\n\nconst platform = await contracts.ChronoBankPlatform.deployed();\nconst timeHolder = await contracts.TimeHolder.deployed();\n\nconst tokenAddress = await platform.proxies(symbol);\n\nnode.warn([msg.payload.swapId, \n    tokenAddress, \n    msg.value, \n    msg.address, \n    `0x${keyHash}`, {from: middlewareAddress, gas: 5700000}]);\n\nconst replyTx = await timeHolder.registerUnlockShares(\n    msg.payload.swapId, \n    tokenAddress, \n    msg.value, \n    msg.address, \n    `0x${keyHash}`, \n    {from: middlewareAddress, gas: 5700000});\n\nmsg.payload = {\n    swapId: msg.payload.swapId,\n    replyTx: replyTx\n};\n\n\nreturn msg;","outputs":1,"noerr":4,"x":756.0173149108887,"y":145.21183967590332,"wires":[["e4cde897.117be8"]]},{"id":"27a50edf.bc2012","type":"debug","z":"a5f1cbb7.f24be8","name":"","active":true,"console":"false","complete":"false","x":276.01734924316406,"y":64.99999237060547,"wires":[]},{"id":"e4cde897.117be8","type":"debug","z":"a5f1cbb7.f24be8","name":"","active":true,"console":"false","complete":"false","x":774.1944732666016,"y":76.5625,"wires":[]},{"id":"209d334.15015cc","type":"http in","z":"a5f1cbb7.f24be8","name":"get swaps","url":"/sidechain/swaps/:address","method":"get","upload":false,"swaggerDoc":"","x":95.0173568725586,"y":248.01040649414062,"wires":[["77b41e26.cea3a"]]},{"id":"77b41e26.cea3a","type":"function","z":"a5f1cbb7.f24be8","name":"prepare request","func":"const prefix = global.get('settings.sidechain.mongo.collectionPrefix');\nmsg.payload = {\n    model: `${prefix}Exchange`, \n    request: {\n       address: msg.req.params.address\n       }\n};\n\n\nreturn msg;","outputs":1,"noerr":0,"x":281.07642364501953,"y":249.00695610046387,"wires":[["8b7bb830.317508"]]},{"id":"8b7bb830.317508","type":"mongo","z":"a5f1cbb7.f24be8","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.sidechain","x":460.017333984375,"y":248.01040649414062,"wires":[["c5f3bad4.cc7a78"]]},{"id":"eb2ec49e.13b1c8","type":"http response","z":"a5f1cbb7.f24be8","name":"","statusCode":"","headers":{},"x":844.076416015625,"y":247.46533012390137,"wires":[]},{"id":"c5f3bad4.cc7a78","type":"function","z":"a5f1cbb7.f24be8","name":"format response","func":"\nmsg.payload = msg.payload.map(item=>({\n    swapId: item.swapId,\n    isActive: item.isActive,\n    created: item.created\n}));\n\nreturn msg;","outputs":1,"noerr":0,"x":640,"y":248,"wires":[["eb2ec49e.13b1c8"]]},{"id":"dc8e79ff.16f508","type":"http in","z":"a5f1cbb7.f24be8","name":"get key","url":"/sidechain/swaps/obtain/:swap_id","method":"post","upload":false,"swaggerDoc":"","x":95,"y":346.0104064941406,"wires":[["85a983cd.73c08"]]},{"id":"85a983cd.73c08","type":"function","z":"a5f1cbb7.f24be8","name":"prepare request","func":"const prefix = global.get('settings.sidechain.mongo.collectionPrefix');\n\nmsg.pubkey = msg.payload.pubkey;\n\nmsg.payload = {\n    model: `${prefix}Exchange`, \n    request: {\n       swapId: msg.req.params.swap_id\n       }\n};\n\n\nreturn msg;","outputs":1,"noerr":0,"x":275.01734924316406,"y":346.0104064941406,"wires":[["b9920fe0.68845"]]},{"id":"b9920fe0.68845","type":"mongo","z":"a5f1cbb7.f24be8","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.sidechain","x":443.017333984375,"y":346.0104064941406,"wires":[["e8925f32.9305f"]]},{"id":"411be5e.cc5a61c","type":"http response","z":"a5f1cbb7.f24be8","name":"","statusCode":"","headers":{},"x":827.076416015625,"y":345.46533012390137,"wires":[]},{"id":"e8925f32.9305f","type":"async-function","z":"a5f1cbb7.f24be8","name":"","func":"const EthCrypto = global.get('libs.EthCrypto');\n\n\nif(!msg.payload.length){\n    msg.payload = {msg: 'swap not found'};\n    return msg;\n}\n\nconst exchange = msg.payload[0];\n\nconst address = EthCrypto.publicKey.toAddress(msg.pubkey).toLowerCase();\n \n  \nif(exchange.address !== address){\n    msg.payload = {msg: 'wrong pubkey provided'};\n    return msg;\n}\n\n\nmsg.payload = await EthCrypto.encryptWithPublicKey(msg.pubkey, exchange.key);\n\n\nreturn msg;","outputs":1,"noerr":1,"x":628.2986679077148,"y":346.86811351776123,"wires":[["411be5e.cc5a61c"]]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({"path":"a5f1cbb7.f24be8","type":"flows"}, done);
};
