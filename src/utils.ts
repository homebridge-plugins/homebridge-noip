/* Copyright(C) 2021-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * utils.ts: @homebridge-plugins/homebridge-noip.
 */
import type { PlatformConfig } from 'homebridge'

/**
 * The largest delay a Node timer can hold, because it is stored in a signed
 * 32-bit integer. Roughly 24.85 days.
 */
export const MAX_TIMER_MS = 2147483647

/**
 * Keep a computed delay inside the range a Node timer can represent.
 *
 * Going over the limit does not throw. Node prints a TimeoutOverflowWarning and
 * quietly sets the delay to 1 ms, so a timer meant to fire in weeks fires a
 * thousand times a second instead. The renewal timer hit this with its own
 * default: 25 days is 2,160,000,000 ms, just past the limit, so auto-renewal
 * hammered the No-IP endpoint rather than running once a month.
 *
 * Clamping means a delay longer than 24.85 days simply fires at 24.85 days,
 * which for every setting here is early rather than wrong.
 */
export function safeTimerMs(ms: number): number {
  if (!Number.isFinite(ms) || ms <= 0) {
    return 1
  }
  return Math.min(Math.floor(ms), MAX_TIMER_MS)
}

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
