import getPairData, { PairData } from '../../api/dex';
import { cache } from '.';

export const tryGetPairData = async (
	contractAddress: string,
): Promise<PairData> => {
	const cachedData = cache.pairDataCache.get(contractAddress);

	if (cachedData && typeof cachedData === 'object') {
		console.log(`Cache hit for contract: ${contractAddress}`);
		return cachedData as PairData;
	}

	console.log(
		`Cache miss for contract: ${contractAddress}, fetching from API...`,
	);
	const contractData = await getPairData(contractAddress);

	cache.pairDataCache.set(contractAddress, contractData);

	return contractData;
};
