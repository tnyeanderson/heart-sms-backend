import { v4 as uuidv4 } from 'uuid';

const devEnv = 'dev';
const testEnv = 'test';
const prodEnv = 'production';

export class util {

	/**
	 * Generate a 64 character account id using two UUIDs
	 */
	static createAccountId() {
		return (uuidv4() + uuidv4()).replace(/-/g, '');
	}

	/**
	 * Whether a property is missing from an object to validate
	 *
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static propMissing(toValidate: any, prop: string) {
		return (
			!toValidate ||
			toValidate[prop] === undefined ||
			toValidate[prop] === null ||
			toValidate[prop] === ""
		);
	}

	static smartToString(val: string | undefined | null) {
		if (typeof val === 'undefined' || val === null) {
			return '';
		} else {
			return String(val);
		}
	}

	/**
	 * Used for easily determining which environment we are in
	 */
	static env = {
		dev: () => (process.env.NODE_ENV === devEnv),

		test: () => (process.env.NODE_ENV === testEnv),

		devOrTest: () => (process.env.NODE_ENV === devEnv || process.env.NODE_ENV === testEnv),

		prod: () => (!process.env.NODE_ENV || process.env.NODE_ENV === prodEnv), // Prod is default

		pretty: function () {
			switch (process.env.NODE_ENV) {
			case devEnv : return 'Development';
			case testEnv: return 'Test';
			case prodEnv: return 'Production';
			default: return 'Production';
			}
		}
	}
}
