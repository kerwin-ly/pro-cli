import Api from './api';
import { AxiosRequestConfig } from 'axios';
import { sentryToken, sentryApiAddress } from '../config/constant';
import { PathLike } from 'fs';
import * as qs from 'qs';
import { CreateParams, Project } from '../interface/sentry-interface';

const sentryConfig = {
	returnRejectedPromiseOnError: true,
	withCredentials: true,
	timeout: 30000,
	baseURL: sentryApiAddress,
	headers: {
		Authorization: `Bearer ${sentryToken}`,
		common: {
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			Pragma: 'no-cache',
			'Content-Type': 'application/json',
			Accept: 'application/json'
		}
	},
	paramsSerializer: (params: PathLike) => qs.stringify(params, { indices: false })
} as AxiosRequestConfig;

class SentryApi extends Api {
	constructor(config: AxiosRequestConfig) {
		super(config);
	}

	createProject(params: CreateParams): Promise<Project> {
		return this.post<Project, CreateParams>(`teams/starport/${params.team}/projects/`, params);
	}
}

export const sentryApi = new SentryApi(sentryConfig);
