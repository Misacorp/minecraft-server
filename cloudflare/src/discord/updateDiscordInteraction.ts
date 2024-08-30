import {
	APIInteraction,
	RESTPatchAPIInteractionFollowupJSONBody,
} from "discord-api-types/v10";

/**
 * Updates an existing Discord interaction
 * @param applicationId Discord application id
 * @param interaction Discord interaction
 * @param body Message content
 */
export default async (
	applicationId: string,
	interaction: APIInteraction,
	body: RESTPatchAPIInteractionFollowupJSONBody
) => {
	const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interaction.token}/messages/@original`;

	console.debug(`Updating a Discord interaction…`);

	const discordResponse = await fetch(url, {
		method: "PATCH",
		headers: new Headers({
			"Content-Type": "application/json",
		}),
		body: JSON.stringify(body),
	});

	if (!discordResponse.ok) {
		console.warn("Something went wrong with the Discord request.");

		try {
			const json = await discordResponse.json();
			console.warn(JSON.stringify(json));
		} catch {
			console.warn(
				"Could not parse and display the erroneous Discord response as JSON."
			);
		}
	}

	console.debug("Discord interaction updated.");
};
