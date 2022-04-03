import Api from './api';
import { AxiosRequestConfig } from 'axios';
import {
	IGitlabGroup,
	IGitlabProject,
	IGitlabGroupParams,
	IGitlabCreateParams,
	IGitlabVariableParams,
	IGitlabTagParams,
	IGitlabReleaseTag
} from '@typings/gitlab';
import { GIT_TOKEN } from '@config/constant';
import { PathLike } from 'fs';
import * as qs from 'qs';

const gitlabConfig = {
	returnRejectedPromiseOnError: true,
	withCredentials: true,
	timeout: 30000,
	baseURL: 'https://git.company.com/api/v4/',
	headers: {
		'PRIVATE-TOKEN': GIT_TOKEN,
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

	getGroups(params: IGitlabGroupParams): Promise<IGitlabGroup[]> {
		return this.get<IGitlabGroup[]>('groups', { params });
	}

	/**
	 * create project
	 * @param {IGitlabCreateParams} params
	 * @returns {Promise<Project>}
	 * @memberof GitlabApi
	 */
	create(params: IGitlabCreateParams): Promise<IGitlabProject> {
		return this.post<IGitlabProject, IGitlabCreateParams>('projects', params);
	}

	createVariables(params: IGitlabVariableParams): Promise<null> {
		return this.post<null, IGitlabVariableParams>(`projects/${params.id}/variables`, params);
	}

	/**
	 * get pro-cli release tags
	 * @param {TagParams} params
	 * @returns {Promise<ReleaseTag[]>}
	 * @memberof GitlabApi
	 */
	getTags(params: IGitlabTagParams): Promise<IGitlabReleaseTag[]> {
		return this.get<IGitlabReleaseTag[]>(`projects/${params.projectId}/repository/tags`, { params });
	}
}

export const gitlabApi = new GitlabApi(gitlabConfig);
