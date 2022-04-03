// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ISafeAny = any;

/**
 * 动态导入文件json
 * @export
 * @interface ImportJson
 */
export interface ImportJson {
	COMPONENTS: {
		[key: string]: string;
	};
	ENTRY_COMPONENTS: {
		[key: string]: string;
	};
	SERVICES: {
		[key: string]: string;
	};
	MODULES: {
		[key: string]: string;
	};
}

export interface Package {
	name: string;
	version: string;
	description: string;
	[props: string]: any;
}

export interface Dependencies {
	dependencies?: string[];
	devDependencies?: string[];
}

export interface Readdir {
	dir: string;
	from: string;
	to: string;
	exclude?: string[];
}
