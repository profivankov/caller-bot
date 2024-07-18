/**
 * Function to get pair data from the API.
 * @param {string} contractId - ID of the pair
 * @returns {Promise<Object>} - a promise that resolves to the pair data object
 */
const getPairData = async (contractId) => {
  const url = `https://api.dexscreener.com/latest/dex/search?q=${contractId}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP status code: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching pair data:', error)
    throw error
  }
}

export default getPairData
