import NodeCache from 'node-cache';

import { PartialContract } from '../../models/partialContract';
import { getAllActiveContracts } from '../contractService';

const calledTokensCache = new NodeCache({
	stdTTL: 10 * 24 * 60 * 60,
	checkperiod: 60 * 60,
});

const saveCalledTokenToCache = (partialToken: PartialContract): void => {
	const cacheKey = `${partialToken.contractId}_${partialToken.chatId}`;
	calledTokensCache.set(cacheKey, partialToken);
};

const loadCalledTokensToCache = async (): Promise<void> => {
	const calledTokens: PartialContract[] = await getAllActiveContracts();
	console.log(calledTokens);
	calledTokens.forEach((token) => {
		const cacheKey = `${token.contractId}_${token.chatId}`;
		calledTokensCache.set(cacheKey, token);
	});
	console.log('Called tokens loaded into cache.');
};

const tryGetCachedTokenInfo = (
	contractId: string,
	chatId: string,
): PartialContract | undefined => {
	const cacheKey = `${contractId}_${chatId}`;
	return calledTokensCache.get<PartialContract>(cacheKey);
};

const tryGetCachedTokensByName = (userName: string): PartialContract[] => {
	const matchingTokens: PartialContract[] = [];

	// Get all keys from the cache
	const cacheKeys = calledTokensCache.keys();

	// Iterate over each key, retrieve the token, and check if it matches the tokenName
	cacheKeys.forEach((key) => {
		const token = calledTokensCache.get<PartialContract>(key);
		if (token && token.username === userName) {
			matchingTokens.push(token);
		}
	});

	return matchingTokens;
};

export {
	loadCalledTokensToCache,
	saveCalledTokenToCache,
	tryGetCachedTokenInfo,
	tryGetCachedTokensByName,
};
