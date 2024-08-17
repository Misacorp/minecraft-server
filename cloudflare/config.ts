export interface IConfig extends NodeJS.ProcessEnv {
	FLY_MACHINE_URI: string | undefined;
	FLY_API_TOKEN: string | undefined;

	DISCORD_TOKEN: string | undefined;
	DISCORD_APPLICATION_ID: string | undefined;
	DISCORD_PUBLIC_KEY: string | undefined;
	DISCORD_TEST_GUILD_ID: string | undefined;
}

export const Config: IConfig = {
	FLY_MACHINE_URI: process.env.FLY_MACHINE_URI,
	FLY_API_TOKEN: process.env.FLY_API_TOKEN,

	DISCORD_TOKEN: process.env.DISCORD_TOKEN,
	DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID,
	DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY,
	DISCORD_TEST_GUILD_ID: process.env.DISCORD_TEST_GUILD_ID,
};
