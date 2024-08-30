import type { FlyMachine } from "../../types";

/**
 * Gets the state of a Fly machine
 * @param machineUri Fly machine URI
 * @param apiToken Fly API token
 */
export default async (machineUri: string, apiToken: string) => {
	console.info("Getting machine state from", machineUri);

	const response = await fetch(`${machineUri}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${apiToken}`,
		},
	});

	// Optimistically parse the response body and dig out the machine state
	let body: FlyMachine;
	try {
		console.debug("Fly machine response received. Parsing…");
		body = (await response.json()) as FlyMachine;
		console.debug("Parsing successful");
	} catch {
		// Throw a more readable error
		throw new Error("Could not parse the response received from the Fly API.");
	}

	if (!response.ok) {
		throw new Error(`Request to get Fly machine info from failed.`);
	}

	if (!body?.state) {
		throw new Error(
			'Fly machine request failed or its response has no "state" property.'
		);
	}

	return body.state;
};
