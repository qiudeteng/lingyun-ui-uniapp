/**
 * 对接齐成云 API 的客户端配置。
 * 地址、appid、密钥放在 .env.development / .env.production，见 .env.example。
 */
function envText(name: 'VITE_API_URL' | 'VITE_APPID' | 'VITE_SECRET_KEY'): string {
  const value = import.meta.env[name]
  if (!value) {
    console.error(`[config] 缺少环境变量 ${name}，请按 .env.example 配置`)
  }
  return value || ''
}

export const appConfig = {
  apiUrl: envText('VITE_API_URL'),
  appid: Number(envText('VITE_APPID')) || 0,
  secretKey: envText('VITE_SECRET_KEY'),
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
