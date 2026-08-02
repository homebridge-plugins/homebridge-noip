<p align="center">
   <a href="https://github.com/homebridge-plugins/homebridge-noip"><img alt="homebridge-noip" src="https://raw.githubusercontent.com/homebridge-plugins/homebridge-noip/latest/branding/Homebridge_x_No-IP.png" width="600px"></a>
</p>
<span align="center">

## homebridge-noip

Homebridge plugin to keep your No-IP hostnames updated with your current IP address

[![npm](https://img.shields.io/npm/v/@homebridge-plugins/homebridge-noip/latest?label=latest)](https://www.npmjs.com/package/@homebridge-plugins/homebridge-noip)
[![npm](https://img.shields.io/npm/v/@homebridge-plugins/homebridge-noip/beta?label=beta)](https://github.com/homebridge/homebridge/wiki/How-to-Install-Alternate-Plugin-Versions)<br>
[![verified-by-homebridge](https://img.shields.io/badge/homebridge-verified-blueviolet?color=%23491F59&style=flat)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)<br>
[![npm](https://img.shields.io/npm/dt/@homebridge-plugins/homebridge-noip)](https://www.npmjs.com/package/@homebridge-plugins/homebridge-noip)
[![Discord](https://img.shields.io/discord/432663330281226270?color=728ED5&logo=discord&label=hb-discord)](https://discord.gg/bHjKNkN)

</span>

### Plugin Information

- This plugin keeps your [No-IP](https://noip.com) hostnames updated with the IP address of the machine your Homebridge instance runs on. The plugin:
  - requires your No-IP account credentials and hostname to work
  - supports both IPv4 and IPv6 updates
  - creates a HomeKit contact sensor that shows whether your hostname is in sync

### Prerequisites

- To use this plugin, you will need to already have:
  - [Node](https://nodejs.org): latest version of `v22` or `v24` - any other major version is not supported.
  - [Homebridge](https://homebridge.io): `v2` - refer to link for more information and installation instructions.

### Setup

- [Installation](https://github.com/homebridge-plugins/homebridge-noip/wiki/Installation)
- [Configuration](https://github.com/homebridge-plugins/homebridge-noip/wiki/Configuration)
- [Beta Version](https://github.com/homebridge-plugins/homebridge-noip/wiki/Beta-Version)
- [Node Version](https://github.com/homebridge-plugins/homebridge-noip/wiki/Node-Version)

### Features

- **Matter** support is available when running Homebridge v2.0+ with Matter enabled:
  - The plugin chooses Matter or HAP automatically at runtime based on your Homebridge environment and the `enableMatter`/`preferMatter` config options.
  - If Matter is unavailable or disabled, the plugin falls back to standard HAP registration automatically.

### Help/About

- [Common Errors](https://github.com/homebridge-plugins/homebridge-noip/wiki/Common-Errors)
- [Support Request](https://github.com/homebridge-plugins/homebridge-noip/issues/new/choose)
- [Changelog](https://github.com/homebridge-plugins/homebridge-noip/blob/latest/CHANGELOG.md)

### Credits

- To [@donavanbecker](https://github.com/donavanbecker): the original creator and maintainer of this plugin.
- To the creators/contributors of [Homebridge](https://homebridge.io) who make this plugin possible.

### Disclaimer

- I am in no way affiliated with No-IP and this plugin is a personal project that I maintain in my free time.
- Use this plugin entirely at your own risk - please see licence for more information.
