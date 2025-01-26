import { describe, expect, it } from 'vitest'

import { getmyip_v4, getmyip_v6, ipapi_v4, ipapi_v6, ipify_v4, ipify_v6, ipinfo_v4, ipinfo_v6, myip_v4, myip_v6, noip, PLATFORM_NAME, PLUGIN_NAME } from './settings.js'

describe('settings', () => {
  it('should have correct PLATFORM_NAME', () => {
    expect(PLATFORM_NAME).toBe('NoIP')
  })

  it('should have correct PLUGIN_NAME', () => {
    expect(PLUGIN_NAME).toBe('@homebridge-plugins/homebridge-noip')
  })

  it('should have correct API URLs', () => {
    expect(ipinfo_v4).toBe('https://ipinfo.io/json')
    expect(getmyip_v4).toBe('https://ipv4.getmyip.dev')
    expect(ipify_v4).toBe('https://api.ipify.org?format=json')
    expect(ipapi_v4).toBe('https://ipapi.co/json')
    expect(myip_v4).toBe('https://api4.my-ip.io/v2/ip.json')
    expect(ipinfo_v6).toBe('https://v6.ipinfo.io/json')
    expect(getmyip_v6).toBe('https://ipv6.getmyip.dev')
    expect(ipify_v6).toBe('https://api64.ipify.org?format=json')
    expect(ipapi_v6).toBe('https://ip6api.co/json')
    expect(myip_v6).toBe('https://api6.my-ip.io/v2/ip.txt')
    expect(noip).toBe('https://dynupdate.no-ip.com/nic/update')
  })
})
