import { IConfig } from "../../config";

type Defined<T> = {
	[K in keyof T]-?: Exclude<T[K], undefined>;
};

/**
 * Validates the specified properties in the env object are not undefined.
 *
 * Type info:
 *
 * 1.	The type assertion `asserts env is IConfig & Defined<Pick<IConfig, K>>`
 *    combines the original `IConfig` type with the specific properties we validate,
 *    ensuring those properties are defined.
 *    This way, TypeScript understands that the env object still conforms to the
 *    `IConfig` interface, but with the specified properties guaranteed
 *    to be non-undefined.
 *
 * 2.	The intersection type `IConfig & Defined<Pick<IConfig, K>>` indicates that
 *    after validation, env is still of type IConfig with additional guarantees
 *    that the specific properties in K are defined.
 *
 * @param env
 * @param keys
 */
const validateEnv: <K extends keyof IConfig>(
	env: IConfig,
	keys: K[]
) => asserts env is IConfig & Defined<Pick<IConfig, K>> = (env, keys) => {
	keys.forEach((key) => {
		if (env[key] === undefined) {
			throw new Error(`${key} is not defined in env`);
		}
	});
};

export default validateEnv;
