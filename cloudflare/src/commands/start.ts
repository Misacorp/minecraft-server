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
	]);

	try {
		// Try to start the machine
		await startMachine(env.FLY_MACHINE_URI, env.FLY_API_TOKEN);
	} catch (error: unknown) {
		// Catch any errors and update the Discord user about them by editing the bot's original message.
		const errorMessage =
			error instanceof Error ? error.message : "(there was no error message)";

		await updateDiscordInteraction(env.DISCORD_APPLICATION_ID, interaction, {
			content: `Something went wrong when starting the server. Here's the error message: ${errorMessage}`,
		});
	}

	// At this point, the Fly machine should be starting.
	// Send an update to Discord
	await updateDiscordInteraction(env.DISCORD_APPLICATION_ID, interaction, {
		content: `The server is starting. Use \`/status\` for real-time information. Give it 30-90 seconds after startup is complete to load everything Minecraft related.`,
	});
};
