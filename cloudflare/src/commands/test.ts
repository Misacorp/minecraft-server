import {
	InteractionResponseType,
	InteractionResponseFlags,
} from "discord-interactions";
import { JsonResponse } from "../JsonResponse";
import { IConfig } from "../../config";
import { APIInteraction } from "discord-api-types/v10";

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
	console.debug("Test command received.");

	ctx.waitUntil(wait(interaction, env.DISCORD_APPLICATION_ID));

	console.debug(
		"Responding to Discord in a hurry… Other functions are still running."
	);

	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: "Command succeeded. Stuff is still going on though…",
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	});
};

const TIMEOUT_MS = 4000;

const wait = async (
	interaction: APIInteraction,
	applicationId: string | undefined
) => {
	return new Promise<void>((resolve) => {
		console.debug(`Starting timeout of ${TIMEOUT_MS}ms…`);

		setTimeout(async () => {
			console.debug("Timeout ended.");

			// Try to edit the message
			if (applicationId) {
				// const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interaction.token}/messages/@original`;

				// console.debug(`Sending a PATCH request to ${url}…`);
				// const response = await fetch(url, {
				// 	method: "PATCH",
				// 	headers: new Headers({
				// 		"Content-Type": "application/json",
				// 	}),
				// 	body: JSON.stringify({
				// 		content: "yeet I updated",
				// 	}),
				// });

				const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interaction.token}`;

				console.debug(`Sending a POST request to ${url}…`);
				const response = await fetch(url, {
					method: "POST",
					headers: new Headers({
						"Content-Type": "application/json",
					}),
					body: JSON.stringify({
						content: "yeet I updated",
					}),
				});

				console.debug("Request sent and response received.");

				try {
					const body = await response.json();
					console.debug("Body:", body);
				} catch {
					console.warn("Could not parse response JSON");
				}
			} else {
				console.warn("Application ID is not available in worker env");
			}

			resolve();
		}, 4000);
	});
};
