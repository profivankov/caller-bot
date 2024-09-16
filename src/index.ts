import { connectToDatabase } from './database';
import { loadCalledTokensToCache } from './services/cache/calledTokens';
import { init, sendInitializationMessage } from './services/telegram';

const startApp = async () => {
	try {
		await connectToDatabase();
		await sendInitializationMessage('Connected to database.');
	} catch (error) {
		if (error instanceof Error) {
			await sendInitializationMessage(`${error.name}: ${error.message}`);
		} else {
			const errorMessage = String(error);
			await sendInitializationMessage(`Unknown Error: ${errorMessage}`);
		}
		process.exit(1);
	}

	try {
		await loadCalledTokensToCache();
	} catch (error) {
		console.log(error);
	}

	try {
		console.log('Initializing bot');
		await init();
		await sendInitializationMessage('Caller bot initialized.');
	} catch (error) {
		console.log(error);
		process.exit(1);
	}

	// const contractId = '0xa1d85927514a5c7f517bd2d25d457b0b47c9d3d1';

	// // //  #{symbol} |🎲| called by #{caller} on #{createdAt} at #{initialPrice} USD. Highest price since call: #{currentPrice} with
	// // (currentprice * 100)/initialPrice - 100 % gain (currentPrice/initialPrice X)  10 initial 20 current, thats 100% gain or 2x
	// // | DexScreener (https://dexscreener.com/${chain}/${contractId})

	// // Create a new contract
	// let contract = await getContract(contractId);
	// if (!contract) {
	// 	const data = await getPairData(contractId);
	// 	const pairData = data.pairs[0];
	// 	const symbol = pairData.baseToken.symbol;
	// 	const chain = pairData.chainId;
	// 	const caller = 'some-caller';
	// 	contract = await createContract(
	// 		contractId,
	// 		symbol,
	// 		chain,
	// 		pairData.priceUsd,
	// 		caller,
	// 	);
	// 	console.log('New contract created:', contract);
	// } else {
	// 	console.log('Contract already exists:', contract);
	// }

	// // Function to update the current price
	// const updatePrice = async () => {
	// 	try {
	// 		// Fetch the current price from your API or source
	// 		const pairData = await getPairData(contractId);
	// 		const currentPrice = pairData.pairs[0].priceUsd;

	// 		const updated = await updateContractPrice(contractId, currentPrice);
	// 		console.log('Contract price updated:', updated ? 'success' : 'failure');
	// 	} catch (error) {
	// 		console.error('Error updating price:', error);
	// 	}
	// };

	// // Update the price every minute
	// setInterval(updatePrice, 60000);

	// // Initial price update
	// updatePrice();
};

startApp();
