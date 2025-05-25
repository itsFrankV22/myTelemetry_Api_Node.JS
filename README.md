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
