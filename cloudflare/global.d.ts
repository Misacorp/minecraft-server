declare namespace NodeJS {
	interface ProcessEnv {
		FLY_MACHINE_URI: string | undefined;
		FLY_API_TOKEN: string | undefined;

		DISCORD_TOKEN: string | undefined;
		DISCORD_APPLICATION_ID: string | undefined;
		DISCORD_PUBLIC_KEY: string | undefined;
		DISCORD_TEST_GUILD_ID: string | undefined;
	}
}

// Export a module
export { ProcessEnv };
