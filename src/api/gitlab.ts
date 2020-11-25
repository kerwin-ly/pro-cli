import Api from './api';
import { AxiosRequestConfig } from 'axios';
import {
	Group,
	Project,
	GroupParams,
	CreateParams,
	VariableParams,
	TagParams,
	ReleaseTag
} from '../interface/gitlab-interface';
import { token, gitlabApiAddress } from '../config/constant';
import { PathLike } from 'fs';
import * as qs from 'qs';

const gitlabConfig = {
	returnRejectedPromiseOnError: true,
	withCredentials: true,
	timeout: 30000,
	baseURL: gitlabApiAddress,
	headers: {
		'PRIVATE-TOKEN': token,
		common: {
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			Pragma: 'no-cache',
			'Content-Type': 'application/json',
			Accept: 'application/json'
		}
	},
	paramsSerializer: (params: PathLike) => qs.stringify(params, { indices: false })
} as AxiosRequestConfig;

class GitlabApi extends Api {
	constructor(config: AxiosRequestConfig) {
		super(config);
	}

	getGroups(params: GroupParams): Promise<Group[]> {
		return this.get<Group[]>('groups', { params });
	}

	/**
	 * create project
	 * @param {CreateParams} params
	 * @returns {Promise<Project>}
	 * @memberof GitlabApi
	 */
	create(params: CreateParams): Promise<Project> {
		return this.post<Project, CreateParams>('projects', params);
	}

	createVariables(params: VariableParams): Promise<null> {
		return this.post<null, VariableParams>(`projects/${params.id}/variables`, params);
	}

	/**
	 * get dg-cli release tags
	 * @param {TagParams} params
	 * @returns {Promise<ReleaseTag[]>}
	 * @memberof GitlabApi
	 */
	getTags(params: TagParams): Promise<ReleaseTag[]> {
		return this.get<ReleaseTag[]>(`projects/${params.projectId}/repository/tags`, { params });
	}
}

export const gitlabApi = new GitlabApi(gitlabConfig);
