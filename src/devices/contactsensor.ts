/* Copyright(C) 2021-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * contactsensor.ts: homebridge-noip.
 */

import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge'

import type { NoIPPlatform } from '../platform.js'

import { Buffer } from 'node:buffer'

import { interval, throwError } from 'rxjs'
import { skipWhile, timeout } from 'rxjs/operators'
import { request } from 'undici'

import { type devicesConfig, noip } from '../settings.js'
import { deviceBase } from './device.js'

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ContactSensor extends deviceBase {
  // Service
  private ContactSensor!: {
    Service: Service
    ContactSensorState: CharacteristicValue
  }

  // Others
  interval: any

  // Updates
  SensorUpdateInProgress!: boolean

  constructor(
    readonly platform: NoIPPlatform,
    accessory: PlatformAccessory,
    device: devicesConfig,
  ) {
    super(platform, accessory, device)

    // Contact Sensor Service
    this.debugLog('Configure Contact Sensor Service')
    this.ContactSensor = {
      Service: this.accessory.getService(this.hap.Service.ContactSensor) ?? this.accessory.addService(this.hap.Service.ContactSensor),
      ContactSensorState: this.hap.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED,
    }

    // Add Contact Sensor Service's Characteristics
    this.ContactSensor.Service
      .setCharacteristic(this.hap.Characteristic.Name, device.hostname.split('.')[0])

    // this is subject we use to track when we need to POST changes to the NoIP API
    this.SensorUpdateInProgress = false

    // Retrieve initial values and updateHomekit
    this.refreshStatus()
    this.updateHomeKitCharacteristics()

    // Start an update interval
    interval(this.deviceRefreshRate * 1000)
      .pipe(skipWhile(() => this.SensorUpdateInProgress))
      .subscribe(async () => {
        await this.refreshStatus()
      })
  }

  /**
   * Parse the device status from the noip api
   */
  async parseStatus(response: string | string[]) {
    if (response.includes('nochg')) {
      this.ContactSensor.ContactSensorState = this.hap.Characteristic.ContactSensorState.CONTACT_DETECTED
    } else {
      this.ContactSensor.ContactSensorState = this.hap.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    }
    await this.debugLog(`ContactSensorState: ${this.ContactSensor.ContactSensorState}`)
  }

  /**
   * Asks the NoIP API for the latest device information
   */
  async refreshStatus() {
    try {
      const ip = this.device.ipv4or6 === 'ipv6' ? await this.platform.publicIPv6(this.device) : await this.platform.publicIPv4(this.device)
      const ipv4or6 = this.device.ipv4or6 === 'ipv6' ? 'IPv6' : 'IPv4'
      const ipProvider = this.device.ipProvider === 'ipify' ? 'ipify.org' : this.device.ipProvider === 'getmyip' ? 'getmyip.dev' : 'ipinfo.io'
      const { body, statusCode } = await request(noip, {
        method: 'GET',
        query: {
          hostname: this.device.hostname,
          myip: ip,
        },
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.device.username}:${this.device.password}`).toString('base64')}`,
          'User-Agent': `Homebridge-NoIP/v${this.device.firmware}`,
        },
      })
      const response = await body.text()
      await this.debugWarnLog(`statusCode: ${JSON.stringify(statusCode)}`)
      await this.debugLog(`${ipProvider} ${ipv4or6} respsonse: ${JSON.stringify(response)}`)
      const data = response.trim()
      const f = data.match(/good|nochg/g)
      if (f) {
        await this.debugLog(`data: ${f[0]}`)
        this.status(f, data)
      } else {
        await this.errorLog(`error: ${data}`)
      }
      await this.parseStatus(response)
      await this.updateHomeKitCharacteristics()
    } catch (e: any) {
      await this.errorLog(`failed to update status, Error: ${JSON.stringify(e.message ?? e)}`)
      await this.apiError(e)
    }
  }

  async status(f: any, data: any): Promise<void> {
    switch (f[0]) {
      case 'nochg':
        await this.debugLog(`IP Address has not updated, IP Address: ${data.split(' ')[1]}`)
        break
      case 'good':
        await this.warnLog(`IP Address has been updated, IP Address: ${data.split(' ')[1]}`)
        break
      case 'nohost':
        await this.errorLog('Hostname supplied does not exist under specified account, client exit and require user to enter new login credentials before performing an additional request.')
        await this.timeout()
        break
      case 'badauth':
        await this.errorLog('Invalid username password combination.')
        await this.timeout()
        break
      case 'badagent':
        await this.errorLog('Client disabled. Client should exit and not perform any more updates without user intervention. ')
        await this.timeout()
        break
      case '!donator':
        await this.errorLog('An update request was sent, ' + 'including a feature that is not available to that particular user such as offline options.')
        await this.timeout()
        break
      case 'abuse':
        await this.errorLog('Username is blocked due to abuse. Either for not following our update specifications or disabled due to violation of the No-IP terms of service. Our terms of service can be viewed [here](https://www.noip.com/legal/tos). Client should stop sending updates.')
        await this.timeout()
        break
      case '911':
        await this.errorLog('A fatal error on our side such as a database outage. Retry the update no sooner than 30 minutes. ')
        await this.timeout()
        break
      default:
        await this.debugLog(data)
    }
  }

  private async timeout(): Promise<void> {
    this.interval.pipe(timeout({ each: 1000, with: () => throwError(() => new Error('nohost')) })).subscribe({ error: this.errorLog })
  }

  /**
   * Updates the status for each of the HomeKit Characteristics
   */
  async updateHomeKitCharacteristics(): Promise<void> {
    // ContactSensorState
    await this.updateCharacteristic(this.ContactSensor.Service, this.hap.Characteristic.ContactSensorState, this.ContactSensor.ContactSensorState, 'ContactSensorState')
  }

  public async apiError(e: any): Promise<void> {
    this.ContactSensor.Service.updateCharacteristic(this.hap.Characteristic.ContactSensorState, e)
  }
}
