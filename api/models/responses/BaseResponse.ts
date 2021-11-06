import { FieldInfo } from "mysql";
import { QueryResult } from "pg";

type OptionalName = {
    target: string;
    source: string;
}

export class BaseResponse {
	/**
     * Empty constructor
     */
	// We MUST include the r here to avoid errors when calling new this(r) in .create()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
	constructor(r?: any) { }

	/**
     * Creates an instance of the calling class from a result
     * @param result Array of results, usually from a database or API call
     */
	static fromResult (result: FieldInfo[] | unknown[]) {
		return new this(result[0]);
	}


	/**
     * Creates an array of instances of the calling class from a result
     * Used for GET results which are arrays of items
     * @param result Array of results, usually from a database or API call
     */
	static getList (result: QueryResult[] | unknown[]) {
		return (result).map((item: unknown) => this.fromResult([item]))
	}

	/**
     *
     * @param name The name of the property
     * @param sourceObj The object to get the property from
     * @param Cast The function used to cast the value to the proper type
     */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setProp(name: OptionalName | string, sourceObj: any, Cast: (arg: unknown) => boolean | string | number) {
		if (typeof name === 'string') {
			name = {target: name, source: name}
		}

		if (!sourceObj || sourceObj[name.source] === undefined || sourceObj[name.source] === null) {
			// @ts-expect-error TS7053
			this[name.target] = null;
		} else {
			// @ts-expect-error TS7053
			this[name.target] = Cast(sourceObj[name.source])
		}
	}
}