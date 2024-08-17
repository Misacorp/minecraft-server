import { AutoRouter, AutoRouterType } from "itty-router";
import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from "discord-interactions";
import * as COMMANDS from "./commands";
import { JsonResponse } from "./JsonResponse";
import type { IConfig } from "../config";
import status from "./commands/status";

const router: AutoRouterType = AutoRouter();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get("/", (request, env) => {
	return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post("/", async (request, env) => {
	const { isValid, interaction } = await server.verifyDiscordRequest(
		request,
		env
	);

	if (!isValid || !interaction) {
		return new Response("Bad request signature.", { status: 401 });
	}

	if (interaction.type === InteractionType.PING) {
		// The `PING` message is used during the initial webhook handshake, and is
		// required to configure the webhook in the developer portal.
		return new JsonResponse({
			type: InteractionResponseType.PONG,
		});
	}

	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		console.info("Handling command:", interaction.data.name.toLowerCase());

		// Most user commands will come as `APPLICATION_COMMAND`.
		switch (interaction.data.name.toLowerCase()) {
			case COMMANDS.STATUS_COMMAND.name.toLowerCase(): {
				return await status(env);
			}
			default:
				console.info(
					`Command did did not match any known commands. Known commands:`,
					Object.values(COMMANDS).map((command) => command.name)
				);

				return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
		}
	}

	console.error("Unknown Type");

	return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

/**
 * Verifies if a Discord request is valid or not.
 * Required functionality for a Discord Interactions API handler.
 * @param request Request
 * @param env process.env in the Cloudflare worker
 */
async function verifyDiscordRequest(request: Request, env: IConfig) {
	console.info("Verifying Discord request…");

	// Verify that the public key variable is set
	if (!env.DISCORD_PUBLIC_KEY) {
		console.warn(
			"The DISCORD_PUBLIC_KEY environment variable is empty. Treating the request as invalid."
		);

		return { isValid: false };
	}

	const signature = request.headers.get("x-signature-ed25519");
	const timestamp = request.headers.get("x-signature-timestamp");
	const body = await request.text();

	const isValidRequest =
		signature &&
		timestamp &&
		(await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));

	if (!isValidRequest) {
		console.info("Request is INVALID");
		return { isValid: false };
	}

	console.info("Request is VALID");
	return { interaction: JSON.parse(body), isValid: true };
}

const server = {
	verifyDiscordRequest,
	fetch: router.fetch,
};

export default server;
