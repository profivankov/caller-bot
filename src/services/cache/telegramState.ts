//
import NodeCache from 'node-cache';

const actionCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

interface ActionData {
	contractAddress: string;
	userId: string | undefined;
}

export const saveActionData = (actionId: string, data: ActionData): void => {
	actionCache.set(actionId, data);
};

export const getActionData = (actionId: string): ActionData | undefined => {
	return actionCache.get<ActionData>(actionId);
};

export const deleteActionData = (actionId: string): void => {
	actionCache.del(actionId);
};
