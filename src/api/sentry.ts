import Api from './api';
import { AxiosRequestConfig } from 'axios';
import { SENTRY_TOKEN } from '@config/constant';
import { PathLike } from 'fs';
import * as qs from 'qs';
import { ISentryCreateParams, ISentryProject } from '@typings/sentry';

const sentryConfig = {
	returnRejectedPromiseOnError: true,
	withCredentials: true,
	timeout: 30000,
	baseURL: 'http://starport.company.com/api/0/',
	headers: {
		Authorization: `Bearer ${SENTRY_TOKEN}`,
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

	createProject(params: ISentryCreateParams): Promise<ISentryProject> {
		return this.post<ISentryProject, ISentryCreateParams>(`teams/starport/${params.team}/projects/`, params);
	}
}

export const sentryApi = new SentryApi(sentryConfig);
