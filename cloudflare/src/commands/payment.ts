import {
	InteractionResponseType,
	InteractionResponseFlags,
} from "discord-interactions";
import { JsonResponse } from "../JsonResponse";
import { IConfig } from "../../config";
import type { APIInteraction } from "discord-api-types/v10";
import validateEnv from "../util/validateEnv";
import { TRUSTED_ROLES } from "../discord/guilds";

/**
 * Handles the "get payment information" command
 * @param interaction Interaction
 * @param env Cloudflare worker env
 */
export default (interaction: APIInteraction, env: IConfig) => {
	// Ensure required env properties are defined
	validateEnv(env, ["DISCORD_APPLICATION_ID", "PAYMENT_ACCOUNT_NUMBER"]);

	const memberRoles = interaction?.member?.roles ?? [];

	// Check if member is trusted
	if (memberRoles.some((role) => TRUSTED_ROLES.includes(role))) {
		// Send payment info
		return new JsonResponse({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `Jos voit, laita Misalle toistuva 2-3 euron kuukausimaksu tilille \`${env.PAYMENT_ACCOUNT_NUMBER}\`. Kiitos!`,
				flags: InteractionResponseFlags.EPHEMERAL,
			},
		});
	}

	// Send a message instructing to contact admins
	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `Kysy maksutietoja Misalta 🫶`,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	});
};
