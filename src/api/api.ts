import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';

export default class Api {
  api: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.api = axios.create(config);

    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (err) => {
        return Promise.reject(err.response.data);
      }
    );
  }

  protected get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.get(url, config);
  }

  protected post<T, B>(url: string, data?: B, config?: AxiosRequestConfig): Promise<T> {
    return this.api.post(url, data, config);
  }

  protected put<T, B>(url: string, data?: B, config?: AxiosRequestConfig): Promise<T> {
    return this.api.put(url, data, config);
  }

  protected delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.delete(url, config);
  }
}
