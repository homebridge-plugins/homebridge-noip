/* Copyright(C) 2021-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * NoIPMatterPlatform.ts: @homebridge-plugins/homebridge-noip.
 */
import type { Subscription } from 'rxjs'

import type { devicesConfig } from './settings.js'

import { Buffer } from 'node:buffer'

import { interval } from 'rxjs'
import { request } from 'undici'

import { NoIPPlatform } from './platform.js'
import { noip, PLATFORM_NAME, PLUGIN_NAME } from './settings.js'

/**
 * NoIPMatterPlatform
 * Matter-aware platform that extends NoIPPlatform.  When the Homebridge Matter
 * API is available the devices are registered through it; otherwise it falls
 * back to the standard HAP accessory registration so the plugin always works.
 */
export class NoIPMatterPlatform extends NoIPPlatform {
  protected override shutdownDevices(): void {
    super.shutdownDevices()
    this.matterPollers.forEach(poller => poller.unsubscribe())
    this.matterPollers.clear()
  }

  // Track cached Matter accessories (keyed by UUID)
  public readonly matterAccessories: Map<string, any> = new Map()

  // Track the polling subscription for each Matter accessory (keyed by UUID)
  private readonly matterPollers: Map<string, Subscription> = new Map()

  /**
   * Called when Homebridge restores cached Matter accessories from disk at startup.
   */
  configureMatterAccessory(accessory: any): void {
    this.log.debug(`Loading cached Matter accessory: ${accessory.displayName}`)
    this.matterAccessories.set(accessory.UUID, accessory)
  }

  /**
   * Matter's BridgedDeviceBasicInformation.NodeLabel is constrained to 32 characters.
   * Homebridge sets the nodeLabel from the accessory displayName, so longer names make
   * the whole endpoint fail to register with "Behaviors have errors".
   */
  private clampMatterDisplayName(displayName: string): string {
    if (displayName.length <= 32) {
      return displayName
    }
    const clamped = displayName.slice(0, 32).trim()
    this.debugLog(`Display name "${displayName}" exceeds Matter's 32 character limit, using "${clamped}"`)
    return clamped
  }

  /**
   * Discovers devices and registers them.
   * Uses the Matter API when available, otherwise delegates to the HAP path
   * supplied by the parent class.
   */
  override async discoverDevices(): Promise<void> {
    const matterApi = (this.api as any)?.matter

    if (!matterApi || typeof matterApi.registerPlatformAccessories !== 'function') {
      // Matter API not available – fall back to normal HAP registration
      await this.debugLog('Matter API not available, falling back to HAP registration')
      return super.discoverDevices()
    }

    // Matter mode is active, so any HAP accessories restored from cache are stale
    // leftovers from a previous HAP run and would show up as duplicates in HomeKit
    if (this.accessories.length) {
      await this.infoLog(`Removing ${this.accessories.length} stale cached HAP accessories as Matter mode is active`)
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, this.accessories)
      this.accessories.splice(0)
    }

    try {
      for (const device of this.config.devices!) {
        await this.infoLog(`Discovered (Matter) ${device.hostname}`)
        await this.createMatterContactSensor(device, matterApi)
      }
    } catch {
      await this.errorLog('discoverDevices (Matter), No Device Config')
    }
  }

  /**
   * Registers a single NoIP device as a Matter contact sensor.
   * Called only when the Matter API is available; HAP fallback is handled by
   * {@link discoverDevices} when Matter support is unavailable.
   *
   * @param device - The device configuration entry.
   * @param matterApi - The Homebridge Matter API handle.
   */
  async createMatterContactSensor(device: devicesConfig, matterApi: any): Promise<void> {
    const uuid = matterApi.uuid.generate(device.hostname)
    const hostname = device.hostname.split('.')[0]

    const existingAccessory = this.matterAccessories.get(uuid)

    if (device.delete) {
      if (existingAccessory) {
        matterApi.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory])
        this.matterAccessories.delete(uuid)
        await this.warnLog(`Removing existing Matter accessory from cache: ${existingAccessory.displayName}`)
      } else {
        await this.debugErrorLog(`Unable to Register new Matter device: ${JSON.stringify(device.hostname)}`)
      }
      return
    }

    const displayName = this.clampMatterDisplayName(device.configDeviceName
      ? await this.validateAndCleanDisplayName(device.configDeviceName, 'configDeviceName', device.configDeviceName)
      : await this.validateAndCleanDisplayName(hostname, 'hostname', hostname)) || 'Unnamed Accessory'
    const serialNumber = device.ipv4or6 === 'ipv6' ? await this.publicIPv6(device) : await this.publicIPv4(device)
    const version = await this.getVersion()

    if (existingAccessory) {
      existingAccessory.displayName = displayName
      existingAccessory.context = existingAccessory.context || {}
      existingAccessory.context.device = device
      existingAccessory.context.serialNumber = serialNumber
      existingAccessory.context.model = 'DUC'
      existingAccessory.context.version = version
      await matterApi.updatePlatformAccessories([existingAccessory])
      await this.infoLog(`Restoring existing Matter accessory from cache: ${existingAccessory.displayName}`)
    } else {
      const accessory = {
        UUID: uuid,
        displayName,
        deviceType: matterApi.deviceTypes.ContactSensor,
        serialNumber: serialNumber || device.hostname,
        manufacturer: 'No-IP',
        model: 'DUC',
        firmwareRevision: version,
        context: {
          device,
          serialNumber,
          model: 'DUC',
          version,
        },
        clusters: {
          booleanState: {
            stateValue: true,
          },
        },
      }

      this.matterAccessories.set(uuid, accessory)
      await matterApi.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
      await this.infoLog(`Adding new Matter accessory: ${device.hostname}`)
      await this.debugLog(`${device.hostname} uuid: ${uuid}`)
    }

    this.startMatterPolling(device, matterApi, uuid)
  }

  /**
   * Poll the No-IP update endpoint on the configured refresh rate and push the
   * hostname sync status into the Matter boolean state cluster.
   * stateValue true (contact detected) means the hostname is in sync.
   */
  private startMatterPolling(device: devicesConfig, matterApi: any, uuid: string): void {
    this.matterPollers.get(uuid)?.unsubscribe()

    const refreshRate = (device.refreshRate ?? this.platformRefreshRate ?? 1800) as number

    const refresh = async (): Promise<void> => {
      try {
        const inSync = await this.checkHostnameSync(device)
        await matterApi.updateAccessoryState(uuid, 'booleanState', { stateValue: inSync })
      } catch (e: any) {
        await this.debugLog(`Matter status refresh failed for ${device.hostname}: ${e.message}`)
      }
    }

    refresh()
    this.matterPollers.set(uuid, interval(refreshRate * 1000).subscribe(() => refresh()))
  }

  /**
   * Asks the No-IP update endpoint whether the hostname already points at the
   * current public IP. A 'nochg' response means the hostname is in sync,
   * mirroring the HAP contact sensor behaviour.
   */
  private async checkHostnameSync(device: devicesConfig): Promise<boolean> {
    const currentIP = device.ipv4or6 === 'ipv6' ? await this.publicIPv6(device) : await this.publicIPv4(device)
    const { body, statusCode } = await request(noip, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${device.username}:${device.password}`).toString('base64')}`,
        'User-Agent': `Homebridge-NoIP/v${await this.getVersion()}`,
      },
      query: {
        hostname: device.hostname,
        myip: currentIP,
      },
    })
    const response = await body.text()
    await this.debugLog(`${device.hostname} statusCode: ${statusCode}, response: ${response}`)
    return response.includes('nochg')
  }
}
