/**
 * Copyright 2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const config = require('../../../config'),
  txTypes = require('../../../factories/states/txTypeFactory'),
  exchangeStates = require('../../../factories/states/exchangeStatesFactory'),
  swapMessages = require('../../../factories/messages/swapMessages'),
  blockchainTypes = require('../../../factories/states/blockchainTypesFactory'),
  models = require('../../../models'),
  encodeABIOpenSwap = require('../../../utils/encode/sidechain/encodeABIOpenSwap'),
  _ = require('lodash');

/**
 * @function
 * @description add new keys for client
 * @param req - request object
 * @param res - response object
 * @return {Promise<*>}
 */
module.exports = async (req, res) => {

  let swap = await models[blockchainTypes.main].exchangeModel.findOne({
    swapId: req.params.swap_id,
    status: exchangeStates.APPROVED
  });

  if (!swap)
    return res.send(swapMessages.swapNotFound);

  if (swap.requested.amount >= config.sidechain.swap.requestLimit)
    return res.send(swapMessages.requestLimitReached);

  if (!_.has(req.body, 'nonce'))
    return res.send(swapMessages.wrongParams);

  let openAction = _.find(swap.actions, {type: txTypes.OPEN});

  let result = await encodeABIOpenSwap(swap.swapId, swap.key, req.body.nonce, swap.value, swap.address);

  if (openAction)
    swap.actions = _.reject(swap.actions, {type: txTypes.OPEN});

  let action = {
    type: txTypes.OPEN,
    signature: {
      r: result.r,
      s: result.s,
      v: result.v
    },
    hash: result.hash,
    expiration: result.expiration
  };

  swap.actions.push(action);

  if (swap.requested.nonce !== parseInt(req.body.nonce)) {
    swap.requested = {
      amount: swap.requested.amount + 1,
      nonce: parseInt(req.body.nonce)
    };

    swap.status = exchangeStates.SWAP_OPENED;
    await swap.save();
  }

  return res.send({
    signature: action.signature,
    expiration: action.expiration,
    params: {
      gas: config.sidechain.contracts.actions.open.gas,
      gasPrice: config.sidechain.contracts.actions.open.gasPrice
    }
  });

};
