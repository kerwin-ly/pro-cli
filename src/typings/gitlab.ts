export interface IGitlabGroupParams {
	owned: boolean;
}

export interface IGitlabCreateParams {
	name?: string;
	namespace_id?: number;
}

export interface IGitlabVariableParams {
	id: number;
	key: string;
	value: string;
	variable_type?: string;
	protected?: boolean;
}

/**
 * 项目所属分组
 * @export
 * @interface IGitlabGroup
 */
export interface IGitlabGroup {
	id: number;
	name: string;
	path?: string;
	description?: string;
	visibility?: string;
	lfs_enabled?: boolean;
	avatar_url?: string;
	web_url?: string;
	request_access_enabled?: boolean;
	full_name?: string;
	full_path?: string;
	parent_id?: number;
}

/**
 * 创建项目，返回参数
 * @export
 * @interface IGitlabProject
 */
export interface IGitlabProject {
	id: number;
	name: string;
	ssh_url_to_repo: string;
	http_url_to_repo: string;
	web_url: string;
}

export interface IGitlabTagParams {
	projectId: number;
	id: number;
	order_by?: 'name' | 'updated';
	sort?: 'asc' | 'desc';
	search?: string;
}

export interface IGitlabReleaseTag {
	name: string;
	message: string;
	release: string;
}
