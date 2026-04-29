/* Copyright(C) 2021-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * NoIPMatterPlatform.ts: @homebridge-plugins/homebridge-noip.
 */
import type { devicesConfig } from './settings.js'

import { ContactSensor } from './devices/contactsensor.js'
import { NoIPPlatform } from './platform.js'
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js'

/**
 * NoIPMatterPlatform
 * Matter-aware platform that extends NoIPPlatform.  When the Homebridge Matter
 * API is available the devices are registered through it; otherwise it falls
 * back to the standard HAP accessory registration so the plugin always works.
 */
export class NoIPMatterPlatform extends NoIPPlatform {
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
   * Registers a single NoIP device as a Matter accessory.
   * Called only when the Matter API is available; HAP fallback is handled by
   * {@link discoverDevices} when Matter support is unavailable.
   *
   * @param device - The device configuration entry.
   * @param matterApi - The Homebridge Matter API handle.
   */
  async createMatterContactSensor(device: devicesConfig, matterApi: any): Promise<void> {
    // Use the same UUID generator as the HAP path so that accessories cached
    // by configureAccessory (which uses api.hap.uuid) are correctly matched.
    const uuid = this.api.hap.uuid.generate(device.hostname)
    const hostname = device.hostname.split('.')[0]

    const existingAccessory = this.accessories.find(a => a.UUID === uuid)

    if (existingAccessory) {
      if (!device.delete) {
        existingAccessory.context = existingAccessory.context || {}
        existingAccessory.context.device = device
        existingAccessory.displayName = device.configDeviceName
          ? await this.validateAndCleanDisplayName(device.configDeviceName, 'configDeviceName', device.configDeviceName)
          : await this.validateAndCleanDisplayName(hostname, 'hostname', hostname)

        if (!existingAccessory.displayName) {
          existingAccessory.displayName = 'Unnamed Accessory'
        }

        existingAccessory.context.serialNumber = device.ipv4or6 === 'ipv6' ? await this.publicIPv6(device) : await this.publicIPv4(device)
        existingAccessory.context.model = 'DUC'
        existingAccessory.context.version = await this.getVersion()
        matterApi.updatePlatformAccessories([existingAccessory])
        await this.infoLog(`Restoring existing Matter accessory from cache: ${existingAccessory.displayName}`)
        new ContactSensor(this, existingAccessory, device)
      } else {
        matterApi.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory])
        await this.warnLog(`Removing existing Matter accessory from cache: ${existingAccessory.displayName}`)
      }
    } else if (!device.delete) {
      const accessory = new this.api.platformAccessory(device.hostname, uuid)

      accessory.context = accessory.context || {}
      accessory.context.device = device
      accessory.displayName = device.configDeviceName
        ? await this.validateAndCleanDisplayName(device.configDeviceName, 'configDeviceName', device.configDeviceName)
        : await this.validateAndCleanDisplayName(hostname, 'hostname', hostname)

      if (!accessory.displayName) {
        accessory.displayName = 'Unnamed Accessory'
      }

      accessory.context.serialNumber = device.ipv4or6 === 'ipv6' ? await this.publicIPv6(device) : await this.publicIPv4(device)
      accessory.context.model = 'DUC'
      accessory.context.version = await this.getVersion()
      await this.infoLog(`Adding new Matter accessory: ${device.hostname}`)
      new ContactSensor(this, accessory, device)
      await this.debugLog(`${device.hostname} uuid: ${uuid}`)

      matterApi.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
      this.accessories.push(accessory)
    } else {
      this.debugErrorLog(`Unable to Register new Matter device: ${JSON.stringify(device.hostname)}`)
    }
  }
}
