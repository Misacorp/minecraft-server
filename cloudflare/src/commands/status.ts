import {
	InteractionResponseType,
	InteractionResponseFlags,
} from "discord-interactions";
import { JsonResponse } from "../JsonResponse";
import { IConfig } from "../../config";
import getMachineState from "../fly/getMachineState";
import type { APIInteraction } from "discord-api-types/v10";
import updateDiscordInteraction from "../discord/updateDiscordInteraction";
import validateEnv from "../util/validateEnv";
import { DISCORD_ROLES_WITH_PERMISSION } from "../discord/guilds";

const messageContentLocalizations = {
	fi: {
		status: `Palvelimen tämänhetkinen tila on `,
		error: `Jokin meni pieleen palvelimen tilaa haettaessa. Tässä on virheviesti: `,
		defaultErrorMessage: `(virheviestiä ei ollut)`,
	},
	en: {
		status: `The server's current state is `,
		error: `Something went wrong when getting the server status. Here's the error message: `,
		defaultErrorMessage: `(there was no error message)`,
	},
};

/**
 * Handles the "check server status" command
 * @param interaction Interaction
 * @param env Cloudflare worker env
 * @param ctx Cloudflare execution context
 */
export default (
	interaction: APIInteraction,
	env: IConfig,
	ctx: ExecutionContext
) => {
	ctx.waitUntil(getFlyMachineState(interaction, env));

	return new JsonResponse({
		type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	});
};

/**
 * Gets the Fly machine's state and updates the Discord user about it.
 * @param interaction Discord interaction
 * @param env Cloudflare worker env
 */
const getFlyMachineState = async (
	interaction: APIInteraction,
	env: IConfig
) => {
	// Ensure required env properties are defined
	validateEnv(env, [
		"FLY_MACHINE_URI",
		"FLY_API_TOKEN",
		"DISCORD_APPLICATION_ID",
	]);

	// Determine which language to use based on the user's role (which server they're on)
	// Default to English
	let messageContent = messageContentLocalizations.en;

	const memberRoles = interaction?.member?.roles ?? [];

	// Finnish option
	if (memberRoles.includes(DISCORD_ROLES_WITH_PERMISSION[0])) {
		messageContent = messageContentLocalizations.fi;
	}

	try {
		// Get the machine state
		const state = await getMachineState(env.FLY_MACHINE_URI, env.FLY_API_TOKEN);

		// Update the original Discord message with the machine's state
		await updateDiscordInteraction(env.DISCORD_APPLICATION_ID, interaction, {
			content: `${messageContent.status}\`${state.toUpperCase()}\``,
		});
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
};
