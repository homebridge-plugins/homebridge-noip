/* Copyright(C) 2021-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * settings.ts: @homebridge-plugins/homebridge-noip.
 */
import type { PlatformConfig } from 'homebridge'

/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = 'NoIP'

/**
 * This must match the name of your plugin as defined the package.json
 */
export const PLUGIN_NAME = '@homebridge-plugins/homebridge-noip'

// API URLs
export const ipinfo_v4 = 'https://ipinfo.io/json'
export const getmyip_v4 = 'https://ipv4.getmyip.dev'
export const ipify_v4 = 'https://api.ipify.org?format=json'
export const ipapi_v4 = 'https://ipapi.co/json'
export const myip_v4 = 'https://api4.my-ip.io/v2/ip.json'
export const ipinfo_v6 = 'https://v6.ipinfo.io/json'
export const getmyip_v6 = 'https://ipv6.getmyip.dev'
export const ipify_v6 = 'https://api64.ipify.org?format=json'
export const ipapi_v6 = 'https://ip6api.co/json'
export const myip_v6 = 'https://api6.my-ip.io/v2/ip.txt'
export const noip = 'https://dynupdate.no-ip.com/nic/update'

// Config
export interface NoIPPlatformConfig extends PlatformConfig {
  name?: string
  devices?: devicesConfig[]
  options?: options
}

export interface devicesConfig {
  configDeviceName?: string
  hostname: string
  username?: string
  password?: string
  ipv4or6?: string
  ipProvider?: string
  firmware: string
  refreshRate?: number
  updateRate?: number
  pushRate?: number
  logging?: string
  delete?: boolean
}

export interface options {
  refreshRate?: number
  updateRate?: number
  pushRate?: number
  logging?: string
  allowInvalidCharacters?: boolean
}
