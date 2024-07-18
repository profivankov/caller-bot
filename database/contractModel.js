import { getDB } from './index.js'

const createContract = async (
  contractId,
  symbol,
  chain,
  initialPrice,
  caller
) => {
  const db = getDB()
  const currentDate = new Date()
  const result = await db.collection('contracts').insertOne({
    contractId,
    symbol,
    chain,
    initialPrice,
    currentPrice: initialPrice,
    createdAt: currentDate,
    updatedAt: currentDate,
    createdBy: caller
  })
  return {
    _id: result.insertedId,
    contractId,
    symbol,
    chain,
    initialPrice,
    currentPrice: initialPrice,
    createdAt: currentDate,
    updatedAt: currentDate,
    createdBy: caller
  }
}

//  #{symbol} |🎲| called by #{caller} on #{createdAt} at #{initialPrice} USD. Highest price since call: #{currentPrice} with
// (currentprice * 100)/initialPrice - 100 % gain (currentPrice/initialPrice X)  10 initial 20 current, thats 100% gain or 2x
// | DexScreener (https://dexscreener.com/${chain}/${contractId})

const updateContractPrice = async (contractId, currentPrice) => {
  const db = getDB()
  const currentDate = new Date()
  const result = await db
    .collection('contracts')
    .updateOne(
      { contractId },
      { $set: { currentPrice, updatedAt: currentDate } }
    )
  return result.modifiedCount > 0
}

const getContract = async (contractId) => {
  const db = getDB()
  const contract = await db.collection('contracts').findOne({ contractId })
  return contract
}

export { createContract, updateContractPrice, getContract }
