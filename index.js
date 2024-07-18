import getPairData from './api.js'
import { connectDB } from './database/index.js'
import {
  createContract,
  updateContractPrice,
  getContract
} from './database/contractModel.js'

const startApp = async () => {
  await connectDB()

  const contractId = '0xa1d85927514a5c7f517bd2d25d457b0b47c9d3d1'

  // Create a new contract
  let contract = await getContract(contractId)
  if (!contract) {
    const data = await getPairData(contractId)
    const pairData = data.pairs[0]
    const symbol = pairData.baseToken.symbol
    const chain = pairData.chainId
    const caller = 'some-caller'
    contract = await createContract(
      contractId,
      symbol,
      chain,
      pairData.priceUsd,
      caller
    )
    console.log('New contract created:', contract)
  } else {
    console.log('Contract already exists:', contract)
  }

  // Function to update the current price
  const updatePrice = async () => {
    try {
      // Fetch the current price from your API or source
      const pairData = await getPairData(contractId)
      const currentPrice = pairData.pairs[0].priceUsd

      const updated = await updateContractPrice(contractId, currentPrice)
      console.log('Contract price updated:', updated ? 'success' : 'failure')
    } catch (error) {
      console.error('Error updating price:', error)
    }
  }

  // Update the price every minute
  setInterval(updatePrice, 60000)

  // Initial price update
  updatePrice()
}

startApp()
