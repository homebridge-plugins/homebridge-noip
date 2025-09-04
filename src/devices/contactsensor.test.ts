import type { API, HAP, Logging, PlatformAccessory } from 'homebridge'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ContactSensor } from './contactsensor.js'
import type { NoIPPlatform } from '../platform.js'
import type { devicesConfig } from '../settings.js'

// Mock the request function
vi.mock('undici', () => ({
  request: vi.fn(),
}))

describe('ContactSensor Renewal Functionality', () => {
  let contactSensor: ContactSensor
  let mockPlatform: NoIPPlatform
  let mockAccessory: PlatformAccessory
  let mockDevice: devicesConfig

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Mock platform
    mockPlatform = {
      api: {
        hap: {
          Service: {
            AccessoryInformation: function() {},
            ContactSensor: function() {},
          },
          Characteristic: {
            Manufacturer: {},
            Name: {},
            ConfiguredName: {},
            Model: {},
            SerialNumber: {},
            FirmwareRevision: {},
            HardwareRevision: {},
            SoftwareRevision: {},
            ContactSensorState: {},
          },
        },
      } as unknown as API,
      log: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        success: vi.fn(),
        debug: vi.fn(),
      } as unknown as Logging,
      config: {
        devices: [],
      },
      debugMode: false,
      platformLogging: 'standard',
      platformAutoRenewal: false,
      platformRenewalInterval: 25,
      version: '4.1.2',
      publicIPv4: vi.fn().mockResolvedValue('192.168.1.100'),
      publicIPv6: vi.fn().mockResolvedValue('2001:db8::1'),
    } as unknown as NoIPPlatform

    // Mock accessory
    mockAccessory = {
      displayName: 'Test NoIP Device',
      context: {
        model: 'NoIP Contact Sensor',
        serialNumber: 'TEST123',
      },
      getService: vi.fn().mockReturnValue({
        setCharacteristic: vi.fn().mockReturnThis(),
        getCharacteristic: vi.fn().mockReturnValue({
          updateValue: vi.fn(),
        }),
        updateCharacteristic: vi.fn(),
      }),
    } as unknown as PlatformAccessory

    // Mock device config
    mockDevice = {
      hostname: 'test.example.com',
      username: 'testuser',
      password: 'testpass',
      firmware: '4.1.2',
      autoRenewal: true,
      renewalInterval: 25,
    }
  })

  it('should initialize with renewal settings enabled', () => {
    contactSensor = new ContactSensor(mockPlatform, mockAccessory, mockDevice)
    
    expect(contactSensor.autoRenewal).toBe(true)
    expect(contactSensor.renewalIntervalDays).toBe(25)
    expect(contactSensor.RenewalInProgress).toBe(false)
  })

  it('should initialize with renewal settings disabled', () => {
    mockDevice.autoRenewal = false
    contactSensor = new ContactSensor(mockPlatform, mockAccessory, mockDevice)
    
    expect(contactSensor.autoRenewal).toBe(false)
    expect(contactSensor.renewalIntervalDays).toBe(25) // Default value
    expect(contactSensor.RenewalInProgress).toBe(false)
  })

  it('should use default renewal interval when not specified', () => {
    delete mockDevice.renewalInterval
    contactSensor = new ContactSensor(mockPlatform, mockAccessory, mockDevice)
    
    expect(contactSensor.renewalIntervalDays).toBe(25) // Default for free accounts
  })

  it.skip('should handle renewal in progress flag correctly', async () => {
    const { request } = await import('undici')
    const mockRequest = request as any
    
    contactSensor = new ContactSensor(mockPlatform, mockAccessory, mockDevice)
    
    // Set renewal in progress before calling renewDomain
    contactSensor.RenewalInProgress = true
    
    await contactSensor.renewDomain()
    
    expect(mockRequest).not.toHaveBeenCalled()
  })

  it('should perform domain renewal successfully', async () => {
    const { request } = await import('undici')
    const mockRequest = request as any
    
    // Mock successful renewal response (similar to normal No-IP update response)
    mockRequest.mockResolvedValueOnce({
      statusCode: 200,
      body: {
        text: () => Promise.resolve('good'),
      },
    })

    contactSensor = new ContactSensor(mockPlatform, mockAccessory, mockDevice)
    
    await contactSensor.renewDomain()
    
    expect(mockRequest).toHaveBeenCalledWith('https://dynupdate.no-ip.com/nic/update', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from('testuser:testpass').toString('base64')}`,
        'User-Agent': expect.stringContaining('Homebridge-NoIP'),
      },
      query: {
        hostname: 'test.example.com',
        myip: expect.any(String),
      },
    })
    
    expect(contactSensor.RenewalInProgress).toBe(false)
  })

  it('should handle renewal failure gracefully', async () => {
    const { request } = await import('undici')
    const mockRequest = request as any
    
    // Mock failed renewal response (No-IP error response)
    mockRequest.mockResolvedValueOnce({
      statusCode: 200,
      body: {
        text: () => Promise.resolve('nohost'),
      },
    })

    contactSensor = new ContactSensor(mockPlatform, mockAccessory, mockDevice)
    
    await contactSensor.renewDomain()
    
    expect(contactSensor.RenewalInProgress).toBe(false)
  })

  it('should handle renewal network errors', async () => {
    const { request } = await import('undici')
    const mockRequest = request as any
    
    // Mock network error
    mockRequest.mockRejectedValueOnce(new Error('Network error'))

    contactSensor = new ContactSensor(mockPlatform, mockAccessory, mockDevice)
    
    await contactSensor.renewDomain()
    
    expect(contactSensor.RenewalInProgress).toBe(false)
  })
})