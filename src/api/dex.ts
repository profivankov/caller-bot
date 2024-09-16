import { z } from 'zod';

import fetchJson from './helpers/fetchJson';

// Define the Zod schema for TokenInfo
const TokenInfoSchema = z.object({
	address: z.string(),
	name: z.string(),
	symbol: z.string(),
});

// Define the Zod schema for PairData
const PairDataSchema = z
	.object({
		chainId: z.string(),
		dexId: z.string(),
		url: z.string(),
		pairAddress: z.string(),
		baseToken: TokenInfoSchema,
		quoteToken: TokenInfoSchema,
		priceNative: z.string(), // Updated to match the API response
		priceUsd: z.string(), // Updated to match the API response
		txns: z.object({
			m5: z.object({ buys: z.number(), sells: z.number() }),
			h1: z.object({ buys: z.number(), sells: z.number() }),
			h6: z.object({ buys: z.number(), sells: z.number() }),
			h24: z.object({ buys: z.number(), sells: z.number() }),
		}),
		volume: z.object({
			m5: z.number(),
			h1: z.number(),
			h6: z.number(),
			h24: z.number(),
		}),
		priceChange: z.object({
			m5: z.number(),
			h1: z.number(),
			h6: z.number(),
			h24: z.number(),
		}),
		liquidity: z.object({
			usd: z.number(),
			base: z.number(),
			quote: z.number(),
		}),
		marketCap: z.number(),
		fdv: z.number(),
		pairCreatedAt: z.number(),
		info: z.object({
			imageUrl: z.string().optional(),
			websites: z.array(
				z.object({
					label: z.string(),
					url: z.string(),
				}),
			),
			socials: z.array(
				z.object({
					type: z.string(),
					url: z.string(),
				}),
			),
		}),
	})
	.passthrough(); // Allow additional fields not defined in the schema

// Define the Zod schema for the API response
const ApiResponseSchema = z.object({
	schemaVersion: z.string(),
	pairs: z.array(PairDataSchema),
});

// Infer TypeScript types from the Zod schemas
type TokenInfo = z.infer<typeof TokenInfoSchema>;
export type PairData = z.infer<typeof PairDataSchema>;
type ApiResponse = z.infer<typeof ApiResponseSchema>;

/**
 * Function to get pair data from the API.
 * @param {string} contractId - ID of the pair
 * @returns {Promise<PairData>} - a promise that resolves to the pair data object
 */
const getPairData = async (contractId: string): Promise<PairData> => {
	const url = `https://api.dexscreener.com/latest/dex/search?q=${contractId}`;

	try {
		const data = await fetchJson(url, ApiResponseSchema);

		if (!data.pairs || data.pairs.length === 0) {
			throw new Error('No pair data found');
		}

		return data.pairs[0]; // Return the first pair or handle it appropriately
	} catch (error) {
		console.error('Error fetching pair data:', error);
		throw error;
	}
};

export default getPairData;
