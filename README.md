<span align="center">

<a href="https://github.com/homebridge/verified/blob/master/verified-plugins.json"><img alt="homebridge-verified" src="https://raw.githubusercontent.com/homebridge-plugins/homebridge-noip/latest/branding/Homebridge_x_No-IP.svg?sanitize=true" width="350px"></a>

# Homebridge No-IP

<a href="https://www.npmjs.com/package/homebridge-noip"><img title="npm version" src="https://badgen.net/npm/v/homebridge-noip?icon=npm&label" ></a>
<a href="https://www.npmjs.com/package/homebridge-noip"><img title="npm downloads" src="https://badgen.net/npm/dt/homebridge-noip?label=downloads" ></a>
<a href="https://discord.gg/8fpZA4S"><img title="discord-noip" src="https://badgen.net/discord/online-members/8fpZA4S?icon=discord&label=discord" ></a>
<a href="https://paypal.me/donavanbecker"><img title="donate" src="https://badgen.net/badge/donate/paypal/yellow" ></a>

<p>The Homebridge <a href="https://noip.com">No-IP</a> 
plugin allows you update your <a href="https://noip.com">No-IP</a> hostnames from the IP that your 
  <a href="https://homebridge.io">Homebridge</a> instance is on. 
</p>

</span>

## Installation

1. Search for "No-IP" on the plugin screen of [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x).
2. Click **Install**.

## Configuration

1. Login / create an account at https://noip.com/
   - If you haven't already you can also create your No-IP hostname here as well.

<p align="center">

<img src="https://user-images.githubusercontent.com/9875439/133934622-05a9c19e-c5ba-46ee-b0db-0748420813d7.png" width="450px">

</p>

2. Type in your NoIP Username, Password, and Hostname into the Plugin Setting UI
3. Click Save
4. Restart Homebridge

## Supported No-IP Features

- IPv4 Update.
- IPv6 Update.

## Contributing

This project uses GitHub Copilot to help manage contributions. Before submitting issues or requesting features, please follow these guidelines:

### Issue Guidelines

1. **Label Requirements**: All issues must have one semantic versioning label before assignment to Copilot:
   - `patch`: Bug fixes (backward compatible)
   - `minor`: New features (backward compatible) 
   - `major`: Breaking changes

2. **Branch Strategy**: All pull requests must target beta branches first:
   - `beta-X.Y.Z` for specific version releases
   - `beta` as a fallback if no version-specific branch exists
   - Only after beta testing should changes be merged to `latest`

3. **Automatic Branch Creation**: When issues are assigned to Copilot with proper labels, the appropriate beta branch will be automatically created if it doesn't exist.

### Workflow

1. Create an issue using the provided templates
2. The issue will automatically be labeled based on the version impact you select
3. Assign the issue to `@copilot` 
4. Copilot will create the appropriate beta branch if needed
5. Copilot will create a pull request targeting the beta branch
6. After review and testing, changes will be merged to the beta branch
7. Once ready, beta changes will be promoted to the `latest` branch for release
