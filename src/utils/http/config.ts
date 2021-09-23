import { AxiosRequestConfig } from "axios";
import { excludeProps } from "./utils";
/**
 * 默认配置
 */
export const defaultConfig: AxiosRequestConfig = {
  SRCURL: "http://manager-file.aiyoukit.com",//http://47.106.86.150:8083
  apiURL:"http://manager-api.aiyoukit.com",//http://47.106.86.150:8082/
  timeout: 10000, //10秒超时
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  }
};

export function genConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
  if (!config) {
    return defaultConfig;
  }

  const { headers } = config;
  if (headers && typeof headers === "object") {
    defaultConfig.headers = {
      ...defaultConfig.headers,
      ...headers
    };
  }
  return { ...excludeProps(config!, "headers"), ...defaultConfig };
}

export const METHODS = ["post", "get", "put", "delete", "option", "patch"];
