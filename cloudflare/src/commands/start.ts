import {
	InteractionResponseType,
	InteractionResponseFlags,
} from "discord-interactions";
import { JsonResponse } from "../JsonResponse";
import { IConfig } from "../../config";

/**
 * Handles the "start server" command
 * @param request Request
 * @param env Cloudflare worker env
 * @param ctx Cloudflare execution context
 */
export default async (
	request: Request,
	env: IConfig,
	ctx: ExecutionContext
) => {
	ctx.waitUntil(startFlyMachine(env));

	console.debug(
		"Responding to Discord in a hurry… Other functions are still running."
	);

	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `The server is starting. Use \`/status\` for real-time information. Give it 30-90 seconds after startup is complete to load everything Minecraft related.`,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	});
};

/**
 * Starts the machine on Fly.io
 * @param env Cloudflare worker env
 */
const startFlyMachine = async (env: IConfig) => {
	console.info("Starting the machine at", env.FLY_MACHINE_URI);

	const response = await fetch(`${env.FLY_MACHINE_URI}/start`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.FLY_API_TOKEN}`,
		},
	});

	console.debug("Start response received");

	if (!response.ok) {
		console.warn("Fly machine response was not OK");
		return new JsonResponse({
			error: "Something went wrong. Try again, or don't 🤷",
		});
	}

	console.debug('Start request was OK')

	// TODO: Update the response previously sent to Discord with actual data of the request
};
