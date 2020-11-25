import Api from './api';
import { AxiosRequestConfig } from 'axios';
import { SonarProject, ProjectParams } from '../interface/sonar-interface';
import { PathLike } from 'fs';
import * as qs from 'qs';
import { sonarToken, sonarApiAddress } from '../config/constant';

const sonarConfig = {
	returnRejectedPromiseOnError: true,
	withCredentials: true,
	timeout: 30000,
	baseURL: sonarApiAddress,
	headers: {
		common: {
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			Pragma: 'no-cache',
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		'Content-Type': 'application/x-www-form-urlencoded'
	},
	paramsSerializer: (params: PathLike) => qs.stringify(params, { indices: false }),
	auth: {
		username: sonarToken,
		password: ''
	}
} as AxiosRequestConfig;

class SonarApi extends Api {
	constructor(config: AxiosRequestConfig) {
		super(config);
	}

	createProject(params: ProjectParams): Promise<SonarProject> {
		const data = qs.stringify(params);

		return this.post<SonarProject, string>('projects/create', data);
	}
}

export const sonarApi = new SonarApi(sonarConfig);
