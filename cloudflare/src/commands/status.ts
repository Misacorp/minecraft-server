import {
	InteractionResponseType,
	InteractionResponseFlags,
} from "discord-interactions";
import { JsonResponse } from "../JsonResponse";
import { IConfig } from "../../config";
import getMachineState from "../fly/getMachineState";
import type { APIInteraction } from "discord-api-types/v10";
import updateDiscordInteraction from "../discord/updateDiscordInteraction";

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
	// Validate ENV
	if (!env.FLY_MACHINE_URI) {
		throw new Error("FLY_MACHINE_URI is not defined in env");
	}
	if (!env.FLY_API_TOKEN) {
		throw new Error("FLY_API_TOKEN is not defined in env");
	}
	if (!env.DISCORD_APPLICATION_ID) {
		throw new Error("DISCORD_APPLICATION_ID is not defined in env");
	}

	try {
		// Get the machine state
		const state = await getMachineState(env.FLY_MACHINE_URI, env.FLY_API_TOKEN);

		// Update the original Discord message with the machine's state
		await updateDiscordInteraction(env.DISCORD_APPLICATION_ID, interaction, {
			content: `The server's current state is \`${state.toUpperCase()}\``,
		});
	} catch (error: unknown) {
		// Catch any errors and update the Discord user about them by editing the bot's original message.
		const errorMessage =
			error instanceof Error ? error.message : "(there was no error message)";

		await updateDiscordInteraction(env.DISCORD_APPLICATION_ID, interaction, {
			content: `Something went wrong when getting the server's status. Here's the error message: ${errorMessage}`,
		});
	}
};
