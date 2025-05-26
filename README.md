# tShock Plugin Telemetry API (Node.js)

**Open Source Telemetry & Error Reporting Backend for tShock Plugins**  
*I leave it open source so people can see that I don't collect extra data. If you want to make a pull request, do it!*

---

### Images:
![Imagen de WhatsApp 2025-05-26 a las 15 47 00_b72ee1e8](https://github.com/user-attachments/assets/86fa6567-f5e5-40c6-a05f-f65d8f747cff) ![Imagen de WhatsApp 2025-05-26 a las 15 47 48_8e07e445](https://github.com/user-attachments/assets/716d3343-edc7-4dda-a757-b546c30fec14)

---

## Table of Contents

- [Project Status](#project-status)
- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Endpoints](#endpoints)
- [Usage](#usage)
  - [Plugin Integration](#plugin-integration)
  - [Initialization Example](#initialization-example)
  - [Error Reporting Example](#error-reporting-example)
  - [Validation Example](#validation-example)
- [Data Structure](#data-structure)
- [Console Commands](#console-commands)
- [Development & Contribution](#development--contribution)
- [Planned & In Progress](#planned--in-progress)
- [License](#license)

---

## Project Status

🚧 **This project is under active development.**  
- The backend API is functional for collecting plugin telemetry and error reports.
- The web frontend for visualizing data is **not implemented yet**.
- Multi-language support is planned.
- **Pull Requests are welcome!**  
  See [Development & Contribution](#development--contribution) for ideas.

---

## Overview

This Node.js service acts as a telemetry and error reporting backend for [tShock](https://tshock.co/) plugins.  
It receives information about plugin initialization, runtime environment, validation results, and error reports from plugins, and stores them in organized folders for later review or processing.

**Why?**  
- To help plugin authors debug their plugins in the wild.
- To provide transparency: No extra or sensitive data is collected.
- To allow server owners to see what telemetry is sent.

---

## Features

- **Telemetry Reception:**  
  Receives and stores plugin initialization data, including environment, server, and world info.

- **Error Reporting:**  
  Receives and archives error reports from plugins, including stack traces and contextual info.

- **Plugin Validation System:**  
  Supports single-use validation keys for plugins (key management is up to the user or another system).

- **Console Commands:**  
  Local management commands for keys and plugin registration.

- **Discord Integration:**  
  (If enabled) Sends notifications to Discord channels for important events (initialization, validation, errors).

- **Open & Transparent:**  
  All code and telemetry formats are public.

---

## How It Works

- Plugins (usually in C#) integrate a small client (`Telemetry.cs`).
- On startup and on errors, plugins send HTTP requests to this API with detailed info.
- This API stores the reports in organized folders and can notify Discord if configured.

---

## Endpoints

All routes expect and return JSON (unless otherwise noted).

### `GET /initialize/:pluginName`

Registers a plugin initialization.

**Query parameters:**
- `port` (required)
- `validated` (required)
- `name` (required): Server or config name
- `version`, `author`, `description`, `buildDate`
- `tshockVersion`, `terrariaVersion`
- `serverOs`, `machineName`, `processArch`, `processUser`, `dotnetVersion`
- `publicIp`, `localIp`
- `worldFile`, `worldSeed`, `worldSize`, `worldId`
- `maxPlayers`, `currPlayers`

> **Note**: The plugin must set the correct API server IP in `Telemetry.cs`.

---

### `POST /report`

Receives an error report from a plugin.

**Body:**  
A JSON object containing:
- Plugin info (`plugin`, `pluginVersion`, `pluginAuthor`, `pluginDescription`, etc.)
- Server & world info
- Error message & stack trace
- Environment/context details

---

### `GET /validate/:key/:pluginName`

Validates a plugin key (for one-time plugin validation).

**Query parameters:**
- `port`, `name`, `ip` (all required)
- Any extra data

**Response:**  
- `{ valid: true|false, message: "...", extras: { ... } }`

---

## Usage

### Plugin Integration

1. **Integrate the C# client (`Telemetry.cs`) in your tShock plugin.**
2. Set the API server IP in your code.
3. On initialization, call the API's `/initialize` route.
4. On error, send a POST to `/report` with error details.

#### Initialization Example (C#)

```csharp
private int serverPort;

// Initialize
serverPort = TShock.Config.Settings.ServerPort;
Telemetry.Start(this);
```

#### Error Reporting Example (C#)

```csharp
// Report error
Telemetry.Report(ex);
```

#### Example Initialization Request

```http
GET http://localhost:8121/initialize/YourPlugin?port=7777&validated=true&name=MyServer&version=1.0.0&author=FrankV22
```

#### Example Error Report (POST /report)

```json
{
  "plugin": "ItemDecoration",
  "pluginVersion": "3.1.1",
  "pluginAuthor": "FrankV22, Soofa, ???",
  "pluginDescription": "Show Item Decoration and More!!!",
  "pluginBuildDate": "2025-05-23T17:22:10",
  "pluginLocation": "C:\\tshock\\plugins\\ItemDecoration.dll",
  "port": 7777,
  "serverName": "TestServer",
  "world": "MyWorld",
  "worldSeed": "superseed",
  "worldSize": "8401x2401",
  "worldId": 42,
  "publicIp": "190.92.103.45",
  "localIp": "192.168.1.100",
  "message": "Simulated NullReferenceException: Object reference not set to an instance of an object.",
  "stackTrace": "at ItemDecoration.Plugin.OnPlayerChat(PlayerChatEventArgs args)\nat TShockAPI.Hooks.PlayerHooks.InvokePlayerChat(...)",
  "time": "2025-05-24T13:00:00",
  "userAgent": "tshock-plugin/3.1.1 (Windows NT 10.0; x64)"
}
```

#### Validation Example

```http
GET http://localhost:8121/validate/ABC123456789/YourPlugin?port=7777&name=YourPlugin&ip=123.45.67.89
```

---

## Data Structure

Reports and initialization data are saved under `DataFiles/`:

- `DataFiles/ServerReports/`: Error reports organized by plugin & server.
- `DataFiles/Logs/`: Console logs.
- `DataFiles/keys.txt`: Validation key database.
- `DataFiles/PL.txt`: Registered plugins.

---

## Console Commands

The backend exposes a CLI for local management (run in your server terminal):

- `keygen`: Generate a new validation key.
- `keylist`: List all keys.
- `keyrm`: Remove a key.
- `keyrenew`: Renew a key.
- `pladd`: Register a plugin/tool.
- `pllist`: List registered plugins.

---

## Development & Contribution

### Local setup

1. Clone the repo.
2. `npm install`
3. `npm start`

### Contributing

- **PRs are welcome!**  
  Anything that improves documentation, adds features, or implements pending TODOs is appreciated.
- Please keep the project open, simple, and privacy-respecting.

### Ideas for PRs

- Implement the web frontend for browsing telemetry and error reports (`public/` is just a placeholder!).
- Multi-language support for console and web.
- More robust key management and UI.
- Improve Discord notifications (configurable, more details).
- Add tests and CI.

---

## Planned & In Progress

- **Web dashboard:** The frontend web interface for browsing plugin data and reports is not implemented yet.  
  _Want to help? See `public/index.html` and open a PR!_
- **Multi-language support:** Currently only English/Spanish in code and logs. Plans to allow users to select language.
- **Better plugin key validation:** Right now, one-time keys are supported but not managed via web.
- **More detailed documentation and examples.**

---

## License

MIT License

---

*If you have any questions, want to contribute, or have feature requests, open an issue or pull request!*
