/**
 * Sends a START request to a Fly.io machine
 * @param machineUri Machine URI
 * @param apiToken Fly.io API token
 */
export default async (machineUri: string, apiToken: string) => {
	console.info("Sending a request to start the Fly machine at", machineUri);

	const flyResponse = await fetch(`${machineUri}/start`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiToken}`,
		},
	});

	if (!flyResponse.ok) {
		throw new Error(
			`Request to start the Fly machine at ${machineUri} failed.`
		);
	}

	console.info("Fly machine is starting.");
};
