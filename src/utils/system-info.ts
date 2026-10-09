/**
 * 微信已废弃 wx.getSystemInfoSync。路由安装时会读 uni.getSystemInfoSync 判断平台，
 * 这里在启动前换成 getWindowInfo / getDeviceInfo / getAppBaseInfo / getSystemSetting。
 */
type SystemInfoLike = UniApp.GetSystemInfoResult & {
  theme?: string
  osTheme?: string
  hostTheme?: string
}

export function installSystemInfoSyncCompat(): void {
  if (
    typeof uni.getWindowInfo !== 'function' ||
    typeof uni.getDeviceInfo !== 'function' ||
    typeof uni.getAppBaseInfo !== 'function'
  ) {
    return
  }

  const read = (): SystemInfoLike => {
    const windowInfo = uni.getWindowInfo()
    const deviceInfo = uni.getDeviceInfo() as UniApp.GetDeviceInfoResult & { osName?: string }
    const appInfo = uni.getAppBaseInfo() as UniApp.GetAppBaseInfoResult & {
      uniPlatform?: string
      theme?: string
      hostTheme?: string
    }
    const setting = typeof uni.getSystemSetting === 'function' ? uni.getSystemSetting() : {}
    const theme = appInfo.theme || appInfo.hostTheme
    const osName = deviceInfo.osName || deviceInfo.platform || ''
    let uniPlatform = appInfo.uniPlatform || ''
    // #ifdef MP-WEIXIN
    if (!uniPlatform) uniPlatform = 'mp-weixin'
    // #endif
    return {
      ...windowInfo,
      ...deviceInfo,
      ...appInfo,
      ...setting,
      uniPlatform,
      osName,
      platform: deviceInfo.platform || osName,
      theme,
      osTheme: theme,
      hostTheme: appInfo.hostTheme || theme,
    } as unknown as SystemInfoLike
  }

  try {
    uni.getSystemInfoSync = read
  } catch {
    /* 只读导出时保留原实现 */
  }
}
