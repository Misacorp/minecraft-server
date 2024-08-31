import {
	InteractionResponseType,
	InteractionResponseFlags,
} from "discord-interactions";
import type { APIInteraction } from "discord-api-types/v10";
import { JsonResponse } from "../JsonResponse";
import { IConfig } from "../../config";
import startMachine from "../fly/startMachine";
import updateDiscordInteraction from "../discord/updateDiscordInteraction";
import validateEnv from "../util/validateEnv";
import {
	DISCORD_ROLES_WITH_PERMISSION,
	TRUSTED_ROLES,
} from "../discord/guilds";

const messageContentLocalizations = {
	fi: {
		started: `Palvelin käynnistyy. Käytä \`/status\` komentoa nähdäksesi sen tilan reaaliajassa.\n\nAnna palvelimelle käynnistymisen jälkeen 30-90 sekuntia aikaa ladata Minecraft ja kaikki siihen liittyvät resurssit.`,
		error: `Jokin meni pieleen palvelinta käynnistettäessä. Tässä on virheviesti: `,
		defaultErrorMessage: `(virheviestiä ei ollut)`,
	},
	en: {
		started: `The server is starting. Use \`/status\` for real-time information.\n\nGive it 30-90 seconds after startup is complete to load everything Minecraft related.`,
		error: `Something went wrong when starting the server. Here's the error message: `,
		defaultErrorMessage: `(there was no error message)`,
	},
};

/**
 * Handles the "start server" command
 * @param interaction Interaction
 * @param env Cloudflare worker env
 * @param ctx Cloudflare execution context
 */
export default (
	interaction: APIInteraction,
	env: IConfig,
	ctx: ExecutionContext
) => {
	ctx.waitUntil(startFlyMachine(interaction, env));

	console.debug(
		"Responding to Discord in a hurry… Other functions are still running."
	);

	return new JsonResponse({
		type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	});
};

/**
 * Starts the machine on Fly.io
 * @param interaction Interaction
 * @param env Cloudflare worker env
 */
const startFlyMachine = async (interaction: APIInteraction, env: IConfig) => {
	// Ensure required env properties are defined
	validateEnv(env, [
		"FLY_MACHINE_URI",
		"FLY_API_TOKEN",
		"DISCORD_APPLICATION_ID",
		"PAYMENT_ACCOUNT_NUMBER",
	]);

	// Determine which language to use based on the user's role (which server they're on)
	// Default to English
	let messageContent = messageContentLocalizations.en;

	const memberRoles = interaction?.member?.roles ?? [];

	// Finnish option
	if (memberRoles.includes(DISCORD_ROLES_WITH_PERMISSION[0])) {
		messageContent = messageContentLocalizations.fi;

		// Add payment info to trusted members.
		if (memberRoles.some((role) => TRUSTED_ROLES.includes(role))) {
			messageContent.started = `${messageContent.started}\n\nPS: Palvelimen ylläpitäminen maksaa rahaa. Jos voit, laita Misalle toistuva 2-3 euron kuukausimaksu tilille \`${env.PAYMENT_ACCOUNT_NUMBER}\`. Kiitos!`;
		}
	}

	try {
		// Try to start the machine
		await startMachine(env.FLY_MACHINE_URI, env.FLY_API_TOKEN);
	} catch (error: unknown) {
		// Catch any errors and update the Discord user about them by editing the bot's original message.
		const errorMessage =
			error instanceof Error
				? error.message
				: messageContent.defaultErrorMessage;

		await updateDiscordInteraction(env.DISCORD_APPLICATION_ID, interaction, {
			content: `${messageContent.error}${errorMessage}`,
		});
	}

	// At this point, the Fly machine should be starting.
	// Send an update to Discord
	await updateDiscordInteraction(env.DISCORD_APPLICATION_ID, interaction, {
		content: messageContent.started,
	});
};
