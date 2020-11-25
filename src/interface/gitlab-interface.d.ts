export interface GroupParams {
  owned: boolean;
}

export interface CreateParams {
  name?: string;
  namespace_id?: number;
}

export interface VariableParams {
  id: number;
  key: string;
  value: string;
  variable_type?: string;
  protected?: boolean;
}

/**
 * 项目所属分组
 * @export
 * @interface Group
 */
export interface Group {
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
 * @interface Project
 */
export interface Project {
  id: number;
  name: string;
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  web_url: string;
}

export interface TagParams {
  projectId: number;
  id: number;
  order_by?: 'name' | 'updated';
  sort?: 'asc' | 'desc';
  search?: string;
}

export interface ReleaseTag {
  name: string;
  message: string;
  release: string;
}
