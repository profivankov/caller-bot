import { ObjectId } from 'mongodb';

export default class Contract {
	constructor(
		public contractId: string,
		public symbol: string,
		public chain: string,
		public initialLiquity: number,
		public initialMcap: number,
		public currentMcap: number,
		public maxMcap: number,
		public createdAt: Date,
		public updatedAt: Date,
		public createdBy: string,
		public chatId: string,
		public id?: ObjectId,
	) {}
}
