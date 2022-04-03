import Api from './api';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';
import { PathLike } from 'fs';
import { IYapiUser, IYapiRes, IYapiLoginParams, IYapiExportSwaggerParams, IYapiSwagger } from '@typings/yapi';
import axios from 'axios';
import { uniq } from 'lodash';

export const yapiConfig = {
	returnRejectedPromiseOnError: true,
	withCredentials: true,
	timeout: 30000,
	baseURL: 'https://yapi.company.com/api/',
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

	login(params: IYapiLoginParams): Promise<IYapiRes<IYapiUser>> {
		return this.post<IYapiRes<IYapiUser>, IYapiLoginParams>('user/login', params);
	}

	getSwaggerJson(params: IYapiExportSwaggerParams): Promise<IYapiSwagger> {
		return this.get<IYapiSwagger>('plugin/exportSwagger', {
			params,
			headers: {
				Cookie: this.cookie
			}
		});
	}
}

export const yApi = new YApi(yapiConfig);
