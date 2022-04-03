import Api from './api';
import { AxiosRequestConfig } from 'axios';
import { PathLike } from 'fs';
import * as qs from 'qs';
import { SONAR_TOKEN } from '@config/constant';
import { ISonarProjectParams, ISonarProject } from '@typings/sonar';

const sonarConfig = {
	returnRejectedPromiseOnError: true,
	withCredentials: true,
	timeout: 30000,
	baseURL: 'http://sonarqube.company.com/api/',
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
		username: SONAR_TOKEN,
		password: ''
	}
} as AxiosRequestConfig;

class SonarApi extends Api {
	constructor(config: AxiosRequestConfig) {
		super(config);
	}

	createProject(params: ISonarProjectParams): Promise<ISonarProject> {
		const data = qs.stringify(params);

		return this.post<ISonarProject, string>('projects/create', data);
	}
}

export const sonarApi = new SonarApi(sonarConfig);
