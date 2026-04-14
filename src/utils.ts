/* Copyright(C) 2021-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * utils.ts: @homebridge-plugins/homebridge-noip.
 */
import type { PlatformConfig } from 'homebridge'

/**
 * Factory function that returns a proxy constructor which selects between the
 * HAP and Matter platform implementations based on the plugin config and
 * whether the Homebridge Matter API is available.
 *
 * @param HAPPlatform  - The standard HAP platform class.
 * @param MatterPlatform - The Matter platform class.
 * @returns A constructor that instantiates the correct platform.
 */
export function createPlatformProxy(HAPPlatform: any, MatterPlatform: any): any {
  return class NoIPPlatformProxy {
    /** The instantiated platform implementation (HAP or Matter) */
    private impl: any

    constructor(log: any, config: PlatformConfig, api: any) {
      const preferMatter = (config?.options as any)?.preferMatter ?? true
      const enableMatter = (config?.options as any)?.enableMatter ?? true
      const matterAvailable = !!(api?.isMatterAvailable?.() && api?.isMatterEnabled?.())

      if (enableMatter && preferMatter && MatterPlatform && matterAvailable) {
        this.impl = new MatterPlatform(log, config, api)
        return this.impl
      }

      // Fallback to HAP
      this.impl = new HAPPlatform(log, config, api)
      return this.impl
    }
  }
}
