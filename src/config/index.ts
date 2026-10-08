/**
 * 对接齐成云 API 的客户端配置（对齐 ../mobile/config）
 *
 * 开发走测试环境，正式打包走生产环境。`VITE_API_URL` 可覆盖接口地址。
 */
const prodApi = {
  apiUrl: 'https://api.gkwxhxcj.com',
  appid: 1003,
  secretKey: '1C0116971CE89E8222FD86F7DEE51821',
}

const testApi = {
  apiUrl: 'https://api217.baxidangao.com',
  appid: 100,
  secretKey: 'rtyuiqoweqwe',
}

const api = import.meta.env.PROD ? prodApi : testApi

export const appConfig = {
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) || api.apiUrl,
  appid: api.appid,
  secretKey: api.secretKey,
  sourceId: 8,
  zip: 1,
  clientType: 'QichengCloudEnterpriseApp',
  loginPath: '/pages/login/login',
  homePath: '/pages/index/index',
  /** 这些接口不自动带 Authorization */
  notAuthUrls: [
    '/open/Enterprise/getInfo',
    '/open/Login/codeLogin',
    '/open/Login/userLogin',
    '/open/Login/refreshToken',
  ],
}

export default appConfig
