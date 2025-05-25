# myTelemetry_Api_Node.JS
I leave it open source so people can see that I don't collect extra data. If you want to make a pull, do it!

---
Just add the `Telemetry.cs` class and initialize it, set your IP and you're done.

Initialize like this
```cs
    // Yep
    private int serverPort;

        // Initialize
        serverPort = TShock.Config.Settings.ServerPort;
        Telemetry.Start(this);
```

To report, you must always see in which process you run it asynchronous or synchronous, you can lock your server
```cs
// Report
Telemetry.Report(ex);
```

---

> In the `Telemetry.cs` class you must make some changes, but mainly you must establish the IP of the server where you run your node.js, which will receive Initialize and reports

- The Server that opens the plugin sends a lot of data via HTTP, so check that any proxy or input limiter could cause problems
- If you want to contribute I would greatly appreciate it.

> [!NOTE]
> The website is in progress, it doesn't work yet, there I want to show data and things about the plugins, latest errors and total list, graphs etc, but I need help with that ;)

---

# Examples:

Initialize:
```bash
──────────────────────[ 8:09:34 PM ]──────────────────────  # Adjustable Time Zone
           INICIALIZACIÓN DE PLUGIN TELEMETRÍA              # Sorry, my primary language is Spanish, This will have languages ​​in the future, HELP ME!          
──────────────────────────────────────────────────────────
PLUGIN          : Example
VERSION         : 1.0.0
AUTHOR          : FrankV22
PORT            : 1234
VALIDATED       : NOT_VALIDATED / VALIDATED                 # This is whether you want the plugin to have a validation or something, it's up to you.
SERVER          : configName_worldName
PUBLIC IP       : 1.2.3.4
PLAYERS         : N/A / N/A
──────────────────────────────────────────────────────────
DESCRIPTION     : N/A                                        # All this is filled in, I'm too lazy to give examples
UA              : N/A
LOCAL IP        : N/A
BUILD DATE      : N_A
TSHOCK          : N/A
TERRARIA        : N/A
OS              : N/A
MACHINE         : N/A
ARCH            : N/A
USER            : N/A
DOTNET          : N/A
WORLD FILE      : N/A
WORLD SEED      : N/A
WORLD SIZE      : N/A
WORLD ID        : N/A
──────────────────────────────────────────────────────────
```

Report:

```json
{
  "plugin": "ItemDecoration",
  "pluginVersion": "3.1.1",
  "pluginAuthor": "FrankV22, Soofa, ???",
  "pluginDescription": "Show Item Decoration and More!!!",
  "pluginBuildDate": "2025-05-23T17:22:1####",
  "pluginLocation": "C:\\tshock\\plugins\\ItemDecoration.dll",
  "port": 7777,
  "serverName": "TestServer",
  "world": "MyWorld",
  "worldSeed": "superseed",
  "worldSize": "8401x2401",
  "worldId": 42,
  "tshockVersion": "5.2.0.0",
  "terrariaVersion": "v1.4.4.9",
  "publicIp": "190.92#####",
  "localIp": "192.168#####",
  "serverOs": "Windows Server 2022",
  "machineName": "test-machine",
  "processArch": "X64",
  "processUser": "tshock",
  "dotnetVersion": ".NET 6.0.36",
  "nameParameter": "TestServer_MyWorld",
  "maxPlayers": 8,
  "currPlayers": 2,
  "osPlatform": "Windows",
  "osDescription": "Microsoft Windows NT 10.0.22621.0",
  "sysUptime": "01.12:45:23",
  "userDomain": "MYDOMAIN",
  "userSid": "S-1-5-21-00000000-00000000-0000#########",
  "currentDir": "C:\\tshock",
  "envPath": "C:\\Windows\\System32;C:\\Windows",
  "userGroups": "tshock,Administrators",
  "message": "Simulated NullReferenceException: Object reference not set to an instance of an object.",
  "stackTrace": "at ItemDecoration.Plugin.OnPlayerChat(PlayerChatEventArgs args)`nat TShockAPI.Hooks.PlayerHooks.InvokePlayerChat(...)",
  "time": "2025-05-24T13:####",
  "userAgent": "tshock-plugin/3.1.1 (Windows NT ##.0####.0; x##)"
}
```
