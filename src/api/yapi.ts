import Api from './api';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';
import { PathLike } from 'fs';
import { YapiUser, YapiRes, LoginParams, ExportSwaggerParams, Swagger } from '../interface/yapi-interface';
import axios from 'axios';
import { uniq } from 'lodash';
import { yapiApiAddress } from '../config/constant';

export const yapiConfig = {
	returnRejectedPromiseOnError: true,
	withCredentials: true,
	timeout: 30000,
	baseURL: yapiApiAddress,
	headers: {
		common: {
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			Pragma: 'no-cache',
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		'Content-Type': 'application/json'
	},
	paramsSerializer: (params: PathLike) => qs.stringify(params, { indices: false })
} as AxiosRequestConfig;

class YApi extends Api {
	cookie: string;

	constructor(config: AxiosRequestConfig) {
		super(config);

		this.cookie = '';
		this.api = axios.create(config); // 重写父类的api属性赋值

		let cookies: string[] = [];

		this.api.interceptors.response.use(
			(response: AxiosResponse) => {
				response.headers['set-cookie'] && (cookies = uniq([...cookies, ...response.headers['set-cookie']]));
				if (cookies && cookies.length) {
					this.cookie = cookies.reduce((total: string, item: string) => (total += ` ${item.split(' ')[0]}`), '');
				}
				return response.data;
			},
			(err) => {
				return Promise.reject(err.response.data);
			}
		);
	}

	login(params: LoginParams): Promise<YapiRes<YapiUser>> {
		return this.post<YapiRes<YapiUser>, LoginParams>('user/login', params);
	}

	getSwaggerJson(params: ExportSwaggerParams): Promise<Swagger> {
		return this.get<Swagger>('plugin/exportSwagger', {
			params,
			headers: {
				Cookie: this.cookie
			}
		});
	}
}

export const yApi = new YApi(yapiConfig);
