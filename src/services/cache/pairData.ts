import NodeCache from 'node-cache';

import getPairData, { PairData } from '../../api/dex';

const pairDataCache = new NodeCache({
	stdTTL: 100,
	checkperiod: 120,
});

export const tryGetPairData = async (
	contractAddress: string,
): Promise<PairData> => {
	const cachedData = pairDataCache.get(contractAddress);

	if (cachedData && typeof cachedData === 'object') {
		console.log(`Cache hit for contract: ${contractAddress}`);
		return cachedData as PairData;
	}

	console.log(
		`Cache miss for contract: ${contractAddress}, fetching from API...`,
	);
	const contractData = await getPairData(contractAddress);

	pairDataCache.set(contractAddress, contractData);

	return contractData;
};
