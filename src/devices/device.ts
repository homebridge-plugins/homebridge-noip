import type { API, CharacteristicValue, HAP, Logging, PlatformAccessory, Service } from 'homebridge'

/* Copyright(C) 2021-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * device.ts: homebridge-noip.
 */
import type { NoIPPlatform } from '../platform.js'
import type { devicesConfig, NoIPPlatformConfig } from '../settings.js'

export abstract class deviceBase {
  public readonly api: API
  public readonly log: Logging
  public readonly config!: NoIPPlatformConfig
  protected readonly hap: HAP

  // Config
  protected deviceLogging!: string
  protected deviceRefreshRate!: number
  protected deviceUpdateRate!: number
  protected devicePushRate!: number
  protected deviceFirmwareVersion!: string

  constructor(
    protected readonly platform: NoIPPlatform,
    protected accessory: PlatformAccessory,
    protected device: devicesConfig,
  ) {
    this.api = this.platform.api
    this.log = this.platform.log
    this.config = this.platform.config
    this.hap = this.api.hap

    this.getDeviceLogSettings(device)
    this.getDeviceRateSettings(device)
    this.getDeviceConfigSettings(device)
    this.getDeviceContext(accessory, device)

    // Set accessory information
    accessory
      .getService(this.hap.Service.AccessoryInformation)!
      .setCharacteristic(this.hap.Characteristic.Manufacturer, 'No-IP')
      .setCharacteristic(this.hap.Characteristic.Name, device.hostname.split('.')[0])
      .setCharacteristic(this.hap.Characteristic.ConfiguredName, device.hostname.split('.')[0])
      .setCharacteristic(this.hap.Characteristic.Model, accessory.context.model)
      .setCharacteristic(this.hap.Characteristic.SerialNumber, accessory.context.serialNumber)
      .setCharacteristic(this.hap.Characteristic.FirmwareRevision, this.deviceFirmwareVersion)
      .getCharacteristic(this.hap.Characteristic.FirmwareRevision)
      .updateValue(this.deviceFirmwareVersion)
  }

  async getDeviceLogSettings(device: devicesConfig): Promise<void> {
    this.deviceLogging = this.platform.debugMode ? 'debugMode' : device.logging ?? this.platform.platformLogging ?? 'standard'
    const logging = this.platform.debugMode ? 'Debug Mode' : device.logging ? 'Device Config' : this.platform.platformLogging ? 'Platform Config' : 'Default'
    await this.debugLog(`Using ${logging} Logging: ${this.deviceLogging}`)
  }

  async getDeviceRateSettings(device: devicesConfig): Promise<void> {
    // refreshRate
    this.deviceRefreshRate = device.refreshRate ?? this.platform.platformRefreshRate ?? 1800
    const refreshRate = device.refreshRate ? 'Device Config' : this.platform.platformRefreshRate ? 'Platform Config' : 'Default'
    await this.debugLog(`Using ${refreshRate} refreshRate: ${this.deviceRefreshRate}`)
    // updateRate
    this.deviceUpdateRate = device.updateRate ?? this.platform.platformUpdateRate ?? 5
    const updateRate = device.updateRate ? 'Device Config' : this.platform.platformUpdateRate ? 'Platform Config' : 'Default'
    await this.debugLog(`Using ${updateRate} updateRate: ${this.deviceUpdateRate}`)
    // pushRate
    this.devicePushRate = device.pushRate ?? this.platform.platformPushRate ?? 1
    const pushRate = device.pushRate ? 'Device Config' : this.platform.platformPushRate ? 'Platform Config' : 'Default'
    await this.debugLog(`Using ${pushRate} pushRate: ${this.devicePushRate}`)
  }

  async getDeviceConfigSettings(device: devicesConfig): Promise<void> {
    const deviceConfig = {}
    const properties = [
      'logging',
      'refreshRate',
      'updateRate',
      'pushRate',
      'external',
      'showRainSensor',
      'showValveSensor',
      'showProgramASwitch',
      'showProgramBSwitch',
      'showProgramCSwitch',
      'showProgramDSwitch',
      'showDelayIrrigationSwitch',
      'showStopIrrigationSwitch',
      'minValueRemainingDuration',
      'maxValueRemainingDuration',
      'syncTime',
      'showRequestResponse',
      'showZoneValve',
      'includeZones',
      'irrigationDelay',
    ]
    properties.forEach((prop) => {
      if (device[prop] !== undefined) {
        deviceConfig[prop] = device[prop]
      }
    })
    if (Object.keys(deviceConfig).length !== 0) {
      this.infoLog(`Config: ${JSON.stringify(deviceConfig)}`)
    }
  }

  async getDeviceContext(accessory: PlatformAccessory, device: devicesConfig): Promise<void> {
    const deviceFirmwareVersion = device.firmware ?? this.platform.version ?? '0.0.0'
    const version = deviceFirmwareVersion.toString()
    this.debugLog(`Firmware Version: ${version.replace(/^V|-.*$/g, '')}`)
    if (version?.includes('.') === false) {
      const replace = version?.replace(/^V|-.*$/g, '')
      const match = replace?.match(/./g)
      const validVersion = match?.join('.')
      this.deviceFirmwareVersion = validVersion ?? '0.0.0'
    } else {
      this.deviceFirmwareVersion = version.replace(/^V|-.*$/g, '') ?? '0.0.0'
    }
    accessory
      .getService(this.hap.Service.AccessoryInformation)!
      .setCharacteristic(this.hap.Characteristic.HardwareRevision, this.deviceFirmwareVersion)
      .setCharacteristic(this.hap.Characteristic.SoftwareRevision, this.deviceFirmwareVersion)
      .setCharacteristic(this.hap.Characteristic.FirmwareRevision, this.deviceFirmwareVersion)
      .getCharacteristic(this.hap.Characteristic.FirmwareRevision)
      .updateValue(this.deviceFirmwareVersion)
    this.debugSuccessLog(`deviceFirmwareVersion: ${this.deviceFirmwareVersion}`)
  }

  /**
   * Update the characteristic value and log the change.
   *
   * @param Service Service
   * @param Characteristic Characteristic
   * @param CharacteristicValue CharacteristicValue | undefined
   * @param CharacteristicName string
   * @return: void
   *
   */
  async updateCharacteristic(Service: Service, Characteristic: any, CharacteristicValue: CharacteristicValue | undefined, CharacteristicName: string): Promise<void> {
    if (CharacteristicValue === undefined) {
      this.debugLog(`${CharacteristicName}: ${CharacteristicValue}`)
    } else {
      Service.updateCharacteristic(Characteristic, CharacteristicValue)
      this.debugLog(`updateCharacteristic ${CharacteristicName}: ${CharacteristicValue}`)
      this.debugWarnLog(`${CharacteristicName} context before: ${this.accessory.context[CharacteristicName]}`)
      this.accessory.context[CharacteristicName] = CharacteristicValue
      this.debugWarnLog(`${CharacteristicName} context after: ${this.accessory.context[CharacteristicName]}`)
    }
  }

  /**
   * Logging for Device
   */
  async infoLog(...log: any[]): Promise<void> {
    if (await this.enablingDeviceLogging()) {
      this.log.info(`Contact Sensor: ${this.accessory.displayName} `, String(...log))
    }
  }

  async successLog(...log: any[]): Promise<void> {
    if (await this.enablingDeviceLogging()) {
      this.log.success(`Contact Sensor: ${this.accessory.displayName} `, String(...log))
    }
  }

  async debugSuccessLog(...log: any[]): Promise<void> {
    if (await this.enablingDeviceLogging()) {
      if (await this.loggingIsDebug()) {
        this.log.success(`[DEBUG] Contact Sensor: ${this.accessory.displayName} `, String(...log))
      }
    }
  }

  async warnLog(...log: any[]): Promise<void> {
    if (await this.enablingDeviceLogging()) {
      this.log.warn(`Contact Sensor: ${this.accessory.displayName} `, String(...log))
    }
  }

  async debugWarnLog(...log: any[]): Promise<void> {
    if (await this.enablingDeviceLogging()) {
      if (await this.loggingIsDebug()) {
        this.log.warn(`[DEBUG] Contact Sensor: ${this.accessory.displayName} `, String(...log))
      }
    }
  }

  async errorLog(...log: any[]): Promise<void> {
    if (await this.enablingDeviceLogging()) {
      this.log.error(`Contact Sensor: ${this.accessory.displayName} `, String(...log))
    }
  }

  async debugErrorLog(...log: any[]): Promise<void> {
    if (await this.enablingDeviceLogging()) {
      if (await this.loggingIsDebug()) {
        this.log.error(`[DEBUG] Contact Sensor: ${this.accessory.displayName} `, String(...log))
      }
    }
  }

  async debugLog(...log: any[]): Promise<void> {
    if (await this.enablingDeviceLogging()) {
      if (this.deviceLogging === 'debug') {
        this.log.info(`[DEBUG] Contact Sensor: ${this.accessory.displayName} `, String(...log))
      } else if (this.deviceLogging === 'debugMode') {
        this.log.debug(`Contact Sensor: ${this.accessory.displayName} `, String(...log))
      }
    }
  }

  async loggingIsDebug(): Promise<boolean> {
    return this.deviceLogging === 'debugMode' || this.deviceLogging === 'debug'
  }

  async enablingDeviceLogging(): Promise<boolean> {
    return this.deviceLogging === 'debugMode' || this.deviceLogging === 'debug' || this.deviceLogging === 'standard'
  }
}
