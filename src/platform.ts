/* Copyright(C) 2021-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * platform.ts: homebridge-noip.
 */
import type { API, DynamicPlatformPlugin, HAP, Logging, PlatformAccessory } from 'homebridge'

import type { devicesConfig, NoIPPlatformConfig, options } from './settings.js'

import { readFileSync } from 'node:fs'
import { argv } from 'node:process'

import { request } from 'undici'
import validator from 'validator'

import { ContactSensor } from './devices/contactsensor.js'
import { getmyip_v4, getmyip_v6, ipapi_v4, ipapi_v6, ipify_v4, ipify_v6, ipinfo_v4, ipinfo_v6, myip_v4, myip_v6, PLATFORM_NAME, PLUGIN_NAME } from './settings.js'

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class NoIPPlatform implements DynamicPlatformPlugin {
  public accessories: PlatformAccessory[]
  public readonly api: API
  public readonly log: Logging
  protected readonly hap: HAP
  public config!: NoIPPlatformConfig

  platformConfig!: NoIPPlatformConfig
  platformLogging!: options['logging']
  platformRefreshRate!: options['refreshRate']
  platformPushRate!: options['pushRate']
  platformUpdateRate!: options['updateRate']
  debugMode!: boolean
  version!: string

  constructor(
    log: Logging,
    config: NoIPPlatformConfig,
    api: API,
  ) {
    this.accessories = []
    this.api = api
    this.hap = this.api.hap
    this.log = log
    // only load if configured
    if (!config) {
      return
    }

    // Plugin options into our config variables.
    this.config = {
      platform: 'NoIP',
      name: config.name,
      devices: config.devices as devicesConfig[],
      options: config.options as options,
    }

    // Plugin Configuration
    this.getPlatformLogSettings()
    this.getPlatformRateSettings()
    this.getPlatformConfigSettings()
    this.getVersion()

    // Finish initializing the platform
    this.debugLog(`Finished initializing platform: ${config.name}`);

    // verify the config
    (async () => {
      try {
        await this.verifyConfig()
        await this.debugLog('Config OK')
      } catch (e: any) {
        await this.errorLog(`Verify Config, Error Message: ${e.message ?? e}, Submit Bugs Here: https://bit.ly/homebridge-noip-bug-report`)
      }
    })()

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', async () => {
      log.debug('Executed didFinishLaunching callback')
      // run the method to discover / register your devices as accessories
      try {
        await this.discoverDevices()
      } catch (e: any) {
        await this.errorLog(`Failed to Discover Devices ${JSON.stringify(e.message ?? e)}`)
      }
    })
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  async configureAccessory(accessory: PlatformAccessory) {
    await this.infoLog(`Loading accessory from cache: ${accessory.displayName}`)

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory)
  }

  /**
   * Verify the config passed to the plugin is valid
   */
  async verifyConfig() {
    /**
     * Hidden Device Discovery Option
     * This will disable adding any device and will just output info.
     */
    this.config.logging = this.config.logging || 'standard'

    // Old Config
    if (this.config.hostname || this.config.username || this.config.password) {
      const oldConfig = {
        hostname: this.config.hostname,
        username: this.config.username,
        password: this.config.password,
      }
      await this.errorLog(`You still have old config that will be ignored, Old Config: ${JSON.stringify(oldConfig)}`)
    }
    // Device Config
    if (this.config.devices) {
      for (const deviceConfig of this.config.devices) {
        if (!deviceConfig.hostname) {
          await this.errorLog('Missing Domain, Need Domain that will be updated.')
        }
        if (!deviceConfig.username) {
          await this.errorLog('Missing Your No-IP Username(E-mail)')
        } else if (!this.validateEmail(deviceConfig.username)) {
          await this.errorLog('Provide a valid Email')
        }
        if (!deviceConfig.password) {
          await this.errorLog('Missing your No-IP Password')
        }
      }
    } else {
      await this.errorLog('verifyConfig, No Device Config')
    }
  }

  /**
   * This method is used to discover the your location and devices.
   * Accessories are registered by either their DeviceClass, DeviceModel, or DeviceID
   */
  async discoverDevices() {
    try {
      for (const device of this.config.devices!) {
        await this.infoLog(`Discovered ${device.hostname}`)
        this.createContactSensor(device)
      }
    } catch {
      await this.errorLog('discoverDevices, No Device Config')
    }
  }

  public async createContactSensor(device: any) {
    const uuid = this.api.hap.uuid.generate(device.hostname)

    // see if an accessory with the same uuid has already been registered and restored from
    // the cached devices we stored in the `configureAccessory` method above
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid)

    if (existingAccessory) {
      // the accessory already exists
      if (!device.delete) {
        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        const hostname = device.hostname.split('.')[0]
        existingAccessory.context = existingAccessory.context || {} // Ensure context is initialized
        existingAccessory.context.device = device
        existingAccessory.displayName = device.configDeviceName
          ? await this.validateAndCleanDisplayName(device.configDeviceName, 'configDeviceName', device.userDefinedDeviceName)
          : await this.validateAndCleanDisplayName(hostname, 'hostname', hostname)

        // Ensure displayName is not empty
        if (!existingAccessory.displayName) {
          existingAccessory.displayName = 'Unnamed Accessory'
        }

        existingAccessory.context.serialNumber = device.ipv4or6 === 'ipv6' ? await this.publicIPv6(device) : await this.publicIPv4(device)
        existingAccessory.context.model = 'DUC'
        existingAccessory.context.version = await this.getVersion()
        this.api.updatePlatformAccessories([existingAccessory])
        // Restore accessory
        await this.infoLog(`Restoring existing accessory from cache: ${existingAccessory.displayName}`)
        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        new ContactSensor(this, existingAccessory, device)
        await this.debugLog(`uuid: ${device.hostname}`)
      } else {
        this.unregisterPlatformAccessories(existingAccessory)
      }
    } else if (!device.delete) {
      // create a new accessory
      const accessory = new this.api.platformAccessory(device.hostname, uuid)

      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      const hostname = device.hostname.split('.')[0]
      accessory.context = accessory.context || {} // Ensure context is initialized
      accessory.context.device = device
      accessory.displayName = device.configDeviceName
        ? await this.validateAndCleanDisplayName(device.configDeviceName, 'configDeviceName', device.userDefinedDeviceName)
        : await this.validateAndCleanDisplayName(hostname, 'hostname', hostname)

      // Ensure displayName is not empty
      if (!accessory.displayName) {
        accessory.displayName = 'Unnamed Accessory'
      }

      accessory.context.serialNumber = device.ipv4or6 === 'ipv6' ? await this.publicIPv6(device) : await this.publicIPv4(device)
      accessory.context.model = 'DUC'
      accessory.context.version = await this.getVersion()
      // the accessory does not yet exist, so we need to create it
      await this.infoLog(`Adding new accessory: ${device.hostname}`)
      // create the accessory handler for the newly create accessory
      // this is imported from `platformAccessory.ts`
      new ContactSensor(this, accessory, device)
      await this.debugLog(`${device.hostname} uuid: ${device.hostname}`)

      // link the accessory to your platform
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
      this.accessories.push(accessory)
    } else {
      this.debugErrorLog(`Unable to Register new device: ${JSON.stringify(device.hostname)}`)
    }
  }

  public async unregisterPlatformAccessories(existingAccessory: PlatformAccessory) {
    // remove platform accessories when no longer present
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory])
    await this.warnLog(`Removing existing accessory from cache: ${existingAccessory.displayName}`)
  }

  async publicIPv4(device: devicesConfig) {
    try {
      const { body, statusCode } = await request(device.ipProvider === 'ipify' ? ipify_v4 : device.ipProvider === 'getmyip' ? getmyip_v4 : device.ipProvider === 'ipapi' ? ipapi_v4 : device.ipProvider === 'myip' ? myip_v4 : ipinfo_v4, {
        method: 'GET',
      })
      const pubIp: any = await body.json()
      this.debugSuccessLog(`IPv4 Address: ${JSON.stringify(pubIp.ip)}`)
      this.debugSuccessLog(`Status Code: ${JSON.stringify(statusCode)}`)
      const IPv4 = pubIp.ip
      return IPv4
    } catch {
      await this.errorLog('Not Able To Retreive IPv4 Address')
    }
  }

  async publicIPv6(device: devicesConfig) {
    try {
      const { body, statusCode } = await request(device.ipProvider === 'ipify' ? ipify_v6 : device.ipProvider === 'getmyip' ? getmyip_v6 : device.ipProvider === 'ipapi' ? ipapi_v6 : device.ipProvider === 'myip' ? myip_v6 : ipinfo_v6, {
        method: 'GET',
      })
      const pubIp: any = await body.json()
      this.debugSuccessLog(`IPv6 Address: ${JSON.stringify(pubIp.ip)}`)
      this.debugSuccessLog(`Status Code: ${JSON.stringify(statusCode)}`)
      const IPv6 = pubIp.ip
      return IPv6
    } catch {
      await this.errorLog('Not Able To Retreive IPv6 Address')
    }
  }

  validateEmail(email: string | undefined) {
    if (!email) {
      return false
    } else {
      return validator.isEmail(email)
    }
  }

  async getPlatformLogSettings() {
    this.debugMode = argv.includes('-D') ?? argv.includes('--debug')
    this.platformLogging = (this.config.options?.logging === 'debug' || this.config.options?.logging === 'standard'
      || this.config.options?.logging === 'none')
      ? this.config.options.logging
      : this.debugMode ? 'debugMode' : 'standard'
    const logging = this.config.options?.logging ? 'Platform Config' : this.debugMode ? 'debugMode' : 'Default'
    await this.debugLog(`Using ${logging} Logging: ${this.platformLogging}`)
  }

  async getPlatformRateSettings() {
    // RefreshRate
    this.platformRefreshRate = this.config.options?.refreshRate ? this.config.options.refreshRate : undefined
    const refreshRate = this.config.options?.refreshRate ? 'Using Platform Config refreshRate' : 'Platform Config refreshRate Not Set'
    await this.debugLog(`${refreshRate}: ${this.platformRefreshRate}`)
    // UpdateRate
    this.platformUpdateRate = this.config.options?.updateRate ? this.config.options.updateRate : undefined
    const updateRate = this.config.options?.updateRate ? 'Using Platform Config updateRate' : 'Platform Config updateRate Not Set'
    await this.debugLog(`${updateRate}: ${this.platformUpdateRate}`)
    // PushRate
    this.platformPushRate = this.config.options?.pushRate ? this.config.options.pushRate : undefined
    const pushRate = this.config.options?.pushRate ? 'Using Platform Config pushRate' : 'Platform Config pushRate Not Set'
    await this.debugLog(`${pushRate}: ${this.platformPushRate}`)
  }

  async getPlatformConfigSettings() {
    if (this.config.options) {
      const platformConfig: NoIPPlatformConfig = {
        platform: 'NoIP',
      }
      platformConfig.logging = this.config.options.logging ? this.config.options.logging : undefined
      platformConfig.refreshRate = this.config.options.refreshRate ? this.config.options.refreshRate : undefined
      platformConfig.updateRate = this.config.options.updateRate ? this.config.options.updateRate : undefined
      platformConfig.pushRate = this.config.options.pushRate ? this.config.options.pushRate : undefined
      if (Object.entries(platformConfig).length !== 0) {
        await this.debugLog(`Platform Config: ${JSON.stringify(platformConfig)}`)
      }
      this.platformConfig = platformConfig
    }
  }

  /**
   * Asynchronously retrieves the version of the plugin from the package.json file.
   *
   * This method reads the package.json file located in the parent directory,
   * parses its content to extract the version, and logs the version using the debug logger.
   * The extracted version is then assigned to the `version` property of the class.
   *
   * @returns {Promise<void>} A promise that resolves when the version has been retrieved and logged.
   */
  async getVersion(): Promise<void> {
    const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'))
    this.debugLog(`Plugin Version: ${version}`)
    this.version = version
  }

  /**
   * Validate and clean a string value for a Name Characteristic.
   * @param displayName - The display name of the accessory.
   * @param name - The name of the characteristic.
   * @param value - The value to be validated and cleaned.
   * @returns The cleaned string value.
   */
  async validateAndCleanDisplayName(displayName: string, name: string, value: string): Promise<string> {
    if (this.config.options?.allowInvalidCharacters) {
      return value
    } else {
      const validPattern = /^[\p{L}\p{N}][\p{L}\p{N} ']*[\p{L}\p{N}]$/u
      const invalidCharsPattern = /[^\p{L}\p{N} ']/gu
      const invalidStartEndPattern = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu

      if (typeof value === 'string' && !validPattern.test(value)) {
        this.warnLog(`WARNING: The accessory '${displayName}' has an invalid '${name}' characteristic ('${value}'). Please use only alphanumeric, space, and apostrophe characters. Ensure it starts and ends with an alphabetic or numeric character, and avoid emojis. This may prevent the accessory from being added in the Home App or cause unresponsiveness.`)

        // Remove invalid characters
        if (invalidCharsPattern.test(value)) {
          const before = value
          this.warnLog(`Removing invalid characters from '${name}' characteristic, if you feel this is incorrect,  please enable \'allowInvalidCharacter\' in the config to allow all characters`)
          value = value.replace(invalidCharsPattern, '')
          this.warnLog(`${name} Before: '${before}' After: '${value}'`)
        }

        // Ensure it starts and ends with an alphanumeric character
        if (invalidStartEndPattern.test(value)) {
          const before = value
          this.warnLog(`Removing invalid starting or ending characters from '${name}' characteristic, if you feel this is incorrect, please enable \'allowInvalidCharacter\' in the config to allow all characters`)
          value = value.replace(invalidStartEndPattern, '')
          this.warnLog(`${name} Before: '${before}' After: '${value}'`)
        }
      }

      return value
    }
  }

  /**
   * If device level logging is turned on, log to log.warn
   * Otherwise send debug logs to log.debug
   */
  async infoLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      this.log.info(String(...log))
    }
  }

  async successLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      this.log.success(String(...log))
    }
  }

  async debugSuccessLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      if (await this.loggingIsDebug()) {
        this.log.success('[DEBUG]', String(...log))
      }
    }
  }

  async warnLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      this.log.warn(String(...log))
    }
  }

  async debugWarnLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      if (await this.loggingIsDebug()) {
        this.log.warn('[DEBUG]', String(...log))
      }
    }
  }

  async errorLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      this.log.error(String(...log))
    }
  }

  async debugErrorLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      if (await this.loggingIsDebug()) {
        this.log.error('[DEBUG]', String(...log))
      }
    }
  }

  async debugLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      if (this.platformLogging === 'debugMode') {
        this.log.debug(String(...log))
      } else if (this.platformLogging === 'debug') {
        this.log.info('[DEBUG]', String(...log))
      }
    }
  }

  async loggingIsDebug(): Promise<boolean> {
    return this.platformLogging === 'debugMode' || this.platformLogging === 'debug'
  }

  async enablingPlatformLogging(): Promise<boolean> {
    return this.platformLogging === 'debugMode' || this.platformLogging === 'debug' || this.platformLogging === 'standard'
  }
}
