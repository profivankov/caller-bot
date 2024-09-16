import { z } from 'zod';

/**
 * Helper function to fetch JSON data with Zod schema validation.
 * @param {string} url - The URL to fetch data from
 * @param {z.ZodSchema<T>} schema - The Zod schema to validate the response data
 * @returns {Promise<T>} - A promise that resolves to the validated data
 */
export default async function fetchJson<T>(
	url: string,
	schema: z.ZodSchema<T>,
): Promise<T> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP status code: ${response.status}`);
	}

	// Log raw data for debugging purposes
	const data: unknown = await response.json();

	// Validate the data using the provided Zod schema
	const result = schema.safeParse(data);
	if (!result.success) {
		console.error('Zod Validation Error Details:', result.error.format());
		throw new Error('Invalid data format');
	}

	return result.data; // Safely return the validated data
}
