import {
	InteractionResponseType,
	InteractionResponseFlags,
} from "discord-interactions";
import { JsonResponse } from "../JsonResponse";
import type { FlyMachine } from "../../types";
import { IConfig } from "../../config";

/**
 * Handles the "check server status" command
 * @param env Cloudflare worker env
 */
export default async (env: IConfig) => {
	console.info("Getting machine state from", env.FLY_MACHINE_URI);

	const response = await fetch(`${env.FLY_MACHINE_URI}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${env.FLY_API_TOKEN}`,
		},
	});

	console.info("Fly machine response received. Parsing…");

	// Get Fly machine status. This request might not be what we expect since the request can fail!
	const body: FlyMachine = (await response.json()) as FlyMachine;

	console.info("Parsing successful");

	// Something went wrong when getting the results
	if (!body?.state) {
		console.warn('Fly machine response has no "state" property.');
		return new JsonResponse({
			error: "Something went wrong. Try again, or don't 🤷",
		});
	}

	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `The server is currently \`${body.state.toUpperCase()}\`.`,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	});
};
