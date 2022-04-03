import { ISafeAny } from './common';

export interface IYapiRes<T> {
	errcode: number;
	errmsg: string;
	data: T;
}

export interface IYapiSwaggerJson {}

export interface IYapiUser {
	username: string;
	role: string;
	uid: number;
	email: string;
	add_time: number;
	up_time: number;
	type: string;
	study: boolean;
}

export interface IYapiLoginParams {
	email: string;
	password: string;
}

export interface IYapiExportSwaggerParams {
	type: string;
	pid: number;
	status: string;
	isWiki: boolean;
}

export interface IYapiSwagger {
	swagger: string;
	info: {
		title: string;
		version: string;
	};
	tags: Array<{
		name: string;
		description?: string;
	}>;
	schemes: string[];
	paths: {
		[props: string]: ISafeAny;
	};
	[props: string]: ISafeAny;
}
