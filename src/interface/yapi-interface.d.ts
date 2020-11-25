export interface YapiRes<T> {
  errcode: number;
  errmsg: string;
  data: T;
}

export interface SwaggerJson {}

export interface YapiUser {
  username: string;
  role: string;
  uid: number;
  email: string;
  add_time: number;
  up_time: number;
  type: string;
  study: boolean;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface ExportSwaggerParams {
  type: string;
  pid: number;
  status: string;
  isWiki: boolean;
}

export interface Swagger {
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
    [props: string]: any;
  };
  [props: string]: any;
}
