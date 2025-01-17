import type { API, Logging } from 'homebridge'

import type { devicesConfig, NoIPPlatformConfig, options } from './settings'

import { PlatformAccessory } from 'homebridge'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NoIPPlatform } from './platform.js'

describe('noIPPlatform', () => {
  let log: Logging
  let config: NoIPPlatformConfig
  let api: API

  beforeEach(() => {
    log = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      success: vi.fn(),
    } as unknown as Logging

    config = {
      platform: 'NoIP',
      name: 'Test Platform',
      devices: [
        {
          hostname: 'test.noip.com',
          username: 'test@example.com',
          password: 'password',
          ipProvider: 'ipify',
          ipv4or6: 'ipv4',
        },
      ] as devicesConfig[],
      options: {
        logging: 'standard',
        refreshRate: 60,
        updateRate: 60,
        pushRate: 60,
      } as options,
    }

    api = {
      hap: {
        uuid: {
          generate: vi.fn().mockReturnValue('uuid'),
        },
      },
      platformAccessory: vi.fn(),
      registerPlatformAccessories: vi.fn(),
      unregisterPlatformAccessories: vi.fn(),
      on: vi.fn(),
    } as unknown as API
  })

  it('should initialize the platform', () => {
    const platform = new NoIPPlatform(log, config, api)
    expect(platform).toBeDefined()
    expect(platform.config).toEqual(config)
    expect(platform.accessories).toEqual([])
  })

  it('should not initialize if config is not provided', () => {
    const platform = new NoIPPlatform(log, undefined as unknown as NoIPPlatformConfig, api)
    expect(platform.config).toBeUndefined()
  })

  it('should verify config', async () => {
    const platform = new NoIPPlatform(log, config, api)
    await platform.verifyConfig()
    expect(log.error).not.toHaveBeenCalled()
  })

  it('should log error for invalid config', async () => {
    config.devices = [
      {
        hostname: '',
        username: '',
        password: '',
        ipProvider: 'ipify',
        ipv4or6: 'ipv4',
      },
    ] as devicesConfig[]
    const platform = new NoIPPlatform(log, config, api)
    await platform.verifyConfig()
    expect(log.error).toHaveBeenCalled()
  })

  it('should discover devices', async () => {
    const platform = new NoIPPlatform(log, config, api)
    await platform.discoverDevices()
    expect(log.info).toHaveBeenCalledWith('Discovered test.noip.com')
  })

  it('should create a new contact sensor', async () => {
    const platform = new NoIPPlatform(log, config, api)
    if (config.devices && config.devices.length > 0) {
      await platform.createContactSensor(config.devices[0])
    }
    expect(api.platformAccessory).toHaveBeenCalled()
    expect(api.registerPlatformAccessories).toHaveBeenCalled()
  })

  it('should validate email', () => {
    const platform = new NoIPPlatform(log, config, api)
    expect(platform.validateEmail('test@example.com')).toBe(true)
    expect(platform.validateEmail('invalid-email')).toBe(false)
  })

  it('should get platform log settings', async () => {
    const platform = new NoIPPlatform(log, config, api)
    await platform.getPlatformLogSettings()
    expect(platform.platformLogging).toBe('standard')
  })

  it('should get platform rate settings', async () => {
    const platform = new NoIPPlatform(log, config, api)
    await platform.getPlatformRateSettings()
    expect(platform.platformRefreshRate).toBe(60)
    expect(platform.platformUpdateRate).toBe(60)
    expect(platform.platformPushRate).toBe(60)
  })

  it('should get platform config settings', async () => {
    const platform = new NoIPPlatform(log, config, api)
    await platform.getPlatformConfigSettings()
    expect(platform.platformConfig).toEqual({
      platform: 'NoIP',
      logging: 'standard',
      refreshRate: 60,
      updateRate: 60,
      pushRate: 60,
    })
  })

  it('should get version', async () => {
    const platform = new NoIPPlatform(log, config, api)
    vi.spyOn(platform, 'getVersion').mockResolvedValue()
    await platform.getVersion()
    expect(log.debug).toHaveBeenCalled()
  })

  it('should validate and clean display name', async () => {
    const platform = new NoIPPlatform(log, config, api)
    const cleanedName = await platform.validateAndCleanDisplayName('Test Device', 'name', 'Test Device')
    expect(cleanedName).toBe('Test Device')
  })
})
