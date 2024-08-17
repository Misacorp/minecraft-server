// See: https://fly.io/docs/machines/machine-states/
export type MachineState =
	| "created"
	| "starting"
	| "started"
	| "stopping"
	| "stopped"
	| "suspending"
	| "suspended"
	| "replacing"
	| "destroying"
	| "destroyed";

export interface FlyMachine {
	[key: string]: unknown;
	state: MachineState;
}

interface JsonResponseErrorBody {
	error: string;
}

// https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data
export interface InteractionResponseData {
	tts?: boolean;
	content?: string;
	// TODO: embeds
	// TODO: allowed mentions
	flags?: number;
	// TODO: components
	// TODO: attachments
	// TODO: poll
}

export interface InteractionResponse {
	type: number;
	data?: InteractionResponseData;
}

export type JsonResponseBody = InteractionResponse | JsonResponseErrorBody;
