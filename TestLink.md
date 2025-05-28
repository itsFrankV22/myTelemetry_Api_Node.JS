# Validate TEST
```http://localhost:3000/validate/aaaa-bbbb-cccc-dddd-eeee-ffff-gggg-hhhh/TEST?port=7777&name=YourPlugin&ip=123.45.67.89```

# Initialize TEST
```http://localhost:3000/initialize/TEST?port=7777&validated=VALIDATED&name=TLW-Server&version=1.0.2&author=FrankV22&description=Herramienta%20de%20inicio%20de%20servidor&buildDate=2025-05-28&tshockVersion=5.7.0&terrariaVersion=1.4.4.9&serverOs=Linux&machineName=TLW-Machine&processArch=x64&processUser=admin&dotnetVersion=8.0.0&publicIp=1.2.3.4&localIp=192.168.0.100&worldFile=TerraLatam.wld&worldSeed=123456789&worldSize=Large&worldId=ABCD1234&maxPlayers=100&currPlayers=18```


# Report TEST
```powershell

curl -X POST http://localhost:3000/report `
 -H "Content-Type: application/json" `
 -d "{
  \"plugin\": \"TEST\",
  \"pluginVersion\": \"1.0.0\",
  \"pluginAuthor\": \"Frank\",
  \"port\": 7777,
  \"serverName\": \"TestServer\",
  \"publicIp\": \"123.45.67.89\",
  \"world\": \"ExampleWorld\",
  \"currPlayers\": 5,
  \"maxPlayers\": 20,
  \"tshockVersion\": \"4.5.1\",
  \"terrariaVersion\": \"1.4.4.9\",
  \"serverOs\": \"Linux\",
  \"machineName\": \"Server01\",
  \"processArch\": \"x64\",
  \"processUser\": \"root\",
  \"dotnetVersion\": \"6.0\",
  \"worldSeed\": \"123456789\",
  \"worldSize\": \"Large\",
  \"worldId\": \"1\",
  \"localIp\": \"192.168.1.100\",
  \"pluginDescription\": \"Ejemplo de plugin\",
  \"pluginBuildDate\": \"2025-05-28T12:00:00Z\",
  \"userAgent\": \"TestAgent/1.0\",
  \"message\": \"Error de ejemplo\",
  \"stackTrace\": \"Error: Algo salió mal\n   at Función()\"
}"

```
