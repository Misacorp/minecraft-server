import {
	InteractionResponseType,
	InteractionResponseFlags,
} from "discord-interactions";
import type { APIInteraction } from "discord-api-types/v10";
import { JsonResponse } from "../JsonResponse";
import { IConfig } from "../../config";

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
			content: `Sending the start command…`,
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
	console.info("Starting the machine at", env.FLY_MACHINE_URI);

	const flyResponse = await fetch(`${env.FLY_MACHINE_URI}/start`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.FLY_API_TOKEN}`,
		},
	});

	console.debug("Start response received");

	if (!flyResponse.ok) {
		console.warn("Fly machine response was not OK");
		return new JsonResponse({
			error: "Something went wrong. Try again, or don't 🤷",
		});
	}

	console.debug("Start request was OK");

	// Send an update to Discord
	const url = `https://discord.com/api/v10/webhooks/${env.DISCORD_APPLICATION_ID}/${interaction.token}/messages/@original`;

	console.debug(`Sending a PATCH request to ${url}…`);

	const discordResponse = await fetch(url, {
		method: "PATCH",
		headers: new Headers({
			"Content-Type": "application/json",
		}),
		body: JSON.stringify({
			content: `The server is starting. Use \`/status\` for real-time information. Give it 30-90 seconds after startup is complete to load everything Minecraft related.`,
		}),
	});

	if (!discordResponse.ok) {
		console.warn("Something was wrong with the Discord response");

		try {
			const json = await discordResponse.json();
			console.warn(JSON.stringify(json));
		} catch {
			console.warn("Could not parse and display Discord response as JSON");
		}
	}
};
