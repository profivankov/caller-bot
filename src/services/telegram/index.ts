import { Context, Telegraf } from 'telegraf';
import { Message } from 'typegram';

import { PairData } from '../../api/dex';
import { PartialContract } from '../../models/partialContract';
import {
	saveCalledTokenToCache,
	tryGetCachedTokenInfo,
	tryGetCachedTokensByName,
} from '../cache/calledTokens';
import { tryGetPairData } from '../cache/pairData';
import { getActionData, saveActionData } from '../cache/telegramState';
import { createContract } from '../contractService';
import {
	getActiveChatIds,
	loadChatIds,
	setupActiveChatListener,
} from './activeChats';

const BOT_TOKEN = process.env.BOT_TOKEN ?? null;

if (!BOT_TOKEN) {
	throw Error('Invalid bot token');
}

const bot = new Telegraf(BOT_TOKEN);

const init = async (): Promise<void> => {
	await loadChatIds();
	await startBot();
	setupActiveChatListener(bot);
};

const startBot = async (): Promise<void> => {
	try {
		// https://github.com/telegraf/telegraf/issues/1749
		void bot.launch({ dropPendingUpdates: true }, () =>
			console.log('Bot is starting!'),
		);
	} catch (err) {
		console.error('Error during bot initialization:', err);
	}
};

const isTextMessage = (message: Message): message is Message.TextMessage =>
	'text' in message;

const generateActionId = (): string => {
	return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

bot.command('call', async (ctx: Context) => {
	try {
		if (!ctx.message || !isTextMessage(ctx.message)) {
			await ctx.reply('This command can only be used in a text message.');
			return;
		}

		const commandParts = ctx.message.text.split(' ');
		const contractAddress = commandParts[1];

		if (!contractAddress) {
			await ctx.reply(
				'Please provide a contract address, e.g., /call 0x123...',
			);
			return;
		}

		const cachedTokenInfo = tryGetCachedTokenInfo(
			contractAddress,
			ctx.chat!.id.toString(),
		);

		if (cachedTokenInfo) {
			console.log(cachedTokenInfo);

			await ctx.reply(
				`${contractAddress} has been called by ${cachedTokenInfo.username} already`,
			);
			return;
		}

		const contractData: PairData = await tryGetPairData(contractAddress);

		const actionId = generateActionId();

		saveActionData(actionId, {
			contractAddress,
			userId: ctx.from?.id.toString(),
		});

		await ctx.reply(
			`Make a call for *${contractData.baseToken.name} \\[${contractData.chainId}\\]*?`,
			{
				parse_mode: 'MarkdownV2',
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: 'Yes',
								callback_data: `confirm_call:${actionId}`,
							},
						],
						[{ text: 'No', callback_data: 'cancel_call' }],
					],
				},
			},
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(`Error in /call command: ${errorMessage}`);
		await ctx.reply(`An error occurred: ${errorMessage}`);
	}
});

bot.on('callback_query', async (ctx) => {
	if ('data' in ctx.callbackQuery) {
		const callbackData: string = ctx.callbackQuery.data;
		const parts = callbackData.split(':');
		const action = parts[0];

		if (action === 'confirm_call') {
			const actionId = parts[1];
			const actionData = getActionData(actionId);

			if (!actionData) {
				await ctx.answerCbQuery('Action expired or invalid.');
				return;
			}

			const contractAddress = actionData.contractAddress;
			const originalUserId = actionData.userId;

			const userId = ctx.from?.id;

			if (userId.toString() !== originalUserId) {
				await ctx.answerCbQuery(
					'You are not authorized to perform this action.',
				);
				return;
			}

			const username = ctx.from?.username ?? 'Unknown User';

			const contractData: PairData = await tryGetPairData(contractAddress);

			const chatId = ctx.chat!.id.toString();

			await createContract({
				contractId: contractData.baseToken.address,
				symbol: contractData.baseToken.symbol,
				chain: contractData.chainId,
				initialLiquity: contractData.liquidity.usd,
				initialMcap: contractData.marketCap,
				currentMcap: contractData.marketCap,
				maxMcap: contractData.marketCap,
				createdAt: new Date(),
				updatedAt: new Date(),
				createdBy: username,
				chatId,
			});

			await ctx.reply(
				`Contract ${contractAddress} has been called by ${username} at ${contractData.marketCap}.`,
			);

			const partialContract: PartialContract = {
				contractId: contractData.baseToken.address,
				chatId,
				username,
			};

			saveCalledTokenToCache(partialContract);

			await ctx.editMessageReplyMarkup({
				inline_keyboard: [
					[
						{
							text: '✅ Confirmed',
							callback_data: 'disabled',
						},
					],
				],
			});

			await ctx.answerCbQuery();
		} else if (action === 'cancel_call') {
			await ctx.reply('Call canceled.');
			await ctx.editMessageReplyMarkup({
				inline_keyboard: [
					[
						{
							text: '❌ Cancelled',
							callback_data: 'disabled',
						},
					],
				],
			});
			await ctx.answerCbQuery();
		} else {
			await ctx.answerCbQuery('Unknown action.');
		}
	} else {
		await ctx.answerCbQuery('No callback data available.');
	}
});

bot.command('calls', async (ctx: Context) => {
	if (!ctx.message || !ctx.chat || !isTextMessage(ctx.message)) {
		await ctx.reply('This command can only be used in a text message.');
		return;
	}

	const chatId = ctx.chat.id;

	const commandParts = ctx.message.text.split(' ');
	const username = commandParts[1];

	let response: string;

	if (username) {
		const recentCalls = tryGetCachedTokensByName(username);
		const userCalls = recentCalls.filter(
			(call) => call.chatId === chatId.toString() && call.username === username,
		);

		if (userCalls.length === 0) {
			response = `No calls found for user: ${username} in this group.`;
		} else {
			response = `Calls made by ${username} in this group:\n${userCalls.map((call) => `- ${call.contractId}`).join('\n')}`;
		}
	} else {
		response = 'TBI';
		// const groupCalls = recentCalls.filter((call) => call.chatId === chatId);

		// if (groupCalls.length === 0) {
		// 	response = 'No recent calls found in this group.';
		// } else {
		// 	response = `Recent calls in this group:\n${groupCalls.map((call) => `${call.user}: ${call.contractAddress}`).join('\n')}`;
		// }
	}

	await ctx.reply(response);
});

bot.catch(async (err, ctx) => {
	console.error(`Error for ${ctx.updateType}`, err);
	try {
		await ctx.reply('Oops, something went wrong!');
	} catch (replyError) {
		console.error('Error replying after catching an error:', replyError);
	}
});

const sendMessage = async (
	chatId: string | number,
	text: string,
): Promise<void> => {
	try {
		await bot.telegram.sendMessage(chatId, text);
	} catch (error) {
		console.error('Failed to send message to Telegram:', error);
	}
};

const sendInitializationMessage = async (text: string): Promise<void> => {
	const activeChatIds = getActiveChatIds();
	for (const chatId of activeChatIds) {
		try {
			await bot.telegram.sendMessage(chatId, text);
			console.log(`Message sent to chat ${chatId}`);
		} catch (error) {
			console.error(`Failed to send message to chat ${chatId}:`, error);
		}
	}
};

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export { bot, init, sendInitializationMessage, sendMessage };
