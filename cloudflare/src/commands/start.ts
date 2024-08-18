import {
	InteractionResponseType,
	InteractionResponseFlags,
} from "discord-interactions";
import { JsonResponse } from "../JsonResponse";
import { IConfig } from "../../config";

/**
 * Handles the "start server" command
 * @param env Cloudflare worker env
 */
export default async (env: IConfig) => {
	console.info("Starting the machine at", env.FLY_MACHINE_URI);

	const response = await fetch(`${env.FLY_MACHINE_URI}/start`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.FLY_API_TOKEN}`,
		},
	});

	console.info("Start request sent");

	if (!response.ok) {
		console.warn("Fly machine response was not OK");
		return new JsonResponse({
			error: "Something went wrong. Try again, or don't 🤷",
		});
	}

	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `The server is starting. Use \`/status\` for real-time information. Give it 30-90 seconds after startup is complete to load everything Minecraft related.`,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	});
};
