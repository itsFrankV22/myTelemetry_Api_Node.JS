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
