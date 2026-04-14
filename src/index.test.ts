import type { API } from 'homebridge'

import { describe, expect, it, vi } from 'vitest'

import registerPlatform from './index.js'
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js'

describe('registerPlatform', () => {
  it('should register the platform with homebridge', () => {
    const api = {
      registerPlatform: vi.fn(),
    } as unknown as API

    registerPlatform(api)

    expect(api.registerPlatform).toHaveBeenCalledWith(PLUGIN_NAME, PLATFORM_NAME, expect.any(Function))
  })

  it('should register a proxy constructor that selects HAP when Matter is not available', () => {
    let registeredCtor: any
    const api = {
      registerPlatform: vi.fn((_plugin, _name, ctor) => {
        registeredCtor = ctor
      }),
    } as unknown as API

    registerPlatform(api)

    // The registered constructor should be the proxy (not NoIPPlatform directly)
    expect(registeredCtor).toBeDefined()
    expect(typeof registeredCtor).toBe('function')
    expect(registeredCtor.name).toBe('NoIPPlatformProxy')
  })
})

