import type { API } from 'homebridge'

import { describe, expect, it, vi } from 'vitest'

import registerPlatform from './index.js'
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js'
import { createPlatformProxy } from './utils.js'

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

describe('createPlatformProxy', () => {
  class StubHAP {
    static instances: StubHAP[] = []
    constructor(..._args: any[]) { StubHAP.instances.push(this) }
  }

  class StubMatter {
    static instances: StubMatter[] = []
    constructor(..._args: any[]) { StubMatter.instances.push(this) }
  }

  function makeApi(matterAvailable: boolean, matterEnabled: boolean) {
    return {
      isMatterAvailable: vi.fn(() => matterAvailable),
      isMatterEnabled: vi.fn(() => matterEnabled),
    }
  }

  it('selects HAP when Matter is not available', () => {
    StubHAP.instances = []
    StubMatter.instances = []
    const Proxy = createPlatformProxy(StubHAP, StubMatter)
    const api = makeApi(false, false)
    const instance = new Proxy({}, { platform: 'NoIP', name: 'test' }, api)

    expect(instance).toBeInstanceOf(StubHAP)
    expect(StubMatter.instances).toHaveLength(0)
  })

  it('selects HAP when isMatterAvailable is false but isMatterEnabled is true', () => {
    StubHAP.instances = []
    StubMatter.instances = []
    const Proxy = createPlatformProxy(StubHAP, StubMatter)
    const api = makeApi(false, true)
    const config = { platform: 'NoIP', name: 'test', options: { preferMatter: true, enableMatter: true } }
    const instance = new Proxy({}, config, api)

    expect(instance).toBeInstanceOf(StubHAP)
    expect(StubMatter.instances).toHaveLength(0)
  })

  it('selects Matter when Matter is available and enabled via config', () => {
    StubHAP.instances = []
    StubMatter.instances = []
    const Proxy = createPlatformProxy(StubHAP, StubMatter)
    const api = makeApi(true, true)
    const config = { platform: 'NoIP', name: 'test', options: { preferMatter: true, enableMatter: true } }
    const instance = new Proxy({}, config, api)

    expect(instance).toBeInstanceOf(StubMatter)
    expect(StubHAP.instances).toHaveLength(0)
  })

  it('selects HAP when enableMatter is false in config', () => {
    StubHAP.instances = []
    StubMatter.instances = []
    const Proxy = createPlatformProxy(StubHAP, StubMatter)
    const api = makeApi(true, true)
    const config = { platform: 'NoIP', name: 'test', options: { preferMatter: true, enableMatter: false } }
    const instance = new Proxy({}, config, api)

    expect(instance).toBeInstanceOf(StubHAP)
    expect(StubMatter.instances).toHaveLength(0)
  })

  it('selects HAP when preferMatter is false in config', () => {
    StubHAP.instances = []
    StubMatter.instances = []
    const Proxy = createPlatformProxy(StubHAP, StubMatter)
    const api = makeApi(true, true)
    const config = { platform: 'NoIP', name: 'test', options: { preferMatter: false, enableMatter: true } }
    const instance = new Proxy({}, config, api)

    expect(instance).toBeInstanceOf(StubHAP)
    expect(StubMatter.instances).toHaveLength(0)
  })

  it('defaults to Matter when no options are specified and Matter is available', () => {
    StubHAP.instances = []
    StubMatter.instances = []
    const Proxy = createPlatformProxy(StubHAP, StubMatter)
    const api = makeApi(true, true)
    const instance = new Proxy({}, { platform: 'NoIP', name: 'test' }, api)

    expect(instance).toBeInstanceOf(StubMatter)
    expect(StubHAP.instances).toHaveLength(0)
  })
})

