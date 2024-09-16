import { MongoError, ObjectId, UpdateResult } from 'mongodb';

import config from '../config';
import { getDB } from '../database';
import Contract from '../models/contract';
import { PartialContract } from '../models/partialContract';

const db = await getDB();

export const createContract = async (contract: Contract): Promise<ObjectId> => {
	await db
		.collection('contracts')
		.createIndex({ contractId: 1 }, { unique: true });

	try {
		const result = await db.collection('contracts').insertOne(contract);
		return result.insertedId;
	} catch (error) {
		if (error instanceof MongoError && error.code === 11000) {
			throw new Error(
				`Contract with ID ${contract.contractId} already exists.`,
			);
		}

		throw error;
	}
};

export const getContract = async (
	contractId: string,
): Promise<Contract | null> =>
	db.collection<Contract>('contracts').findOne({ contractId });

export const updateContract = async (
	contractId: string,
	updates: Partial<Contract>,
): Promise<UpdateResult> =>
	db.collection('contracts').updateOne({ contractId }, { $set: updates });

export const getAllActiveContracts = async (): Promise<PartialContract[]> => {
	const daysToFilter = config.daysToMonitor || 1;
	const dateThreshold = new Date();
	dateThreshold.setDate(dateThreshold.getDate() - daysToFilter);

	const contracts = await db
		.collection<Contract>('contracts')
		.find(
			{
				createdAt: { $gte: dateThreshold },
			},
			{ projection: { contractId: 1, chatId: 1, createdBy: 1, _id: 0 } },
		)
		.toArray();

	return contracts.map((doc) => ({
		contractId: doc.contractId,
		chatId: doc.chatId,
		username: doc.createdBy,
	}));
};
