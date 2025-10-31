# parse ini
ini to json and json to ini parser


#### INIParser
the demo for the latest version is in the demos folder 

#### parseIni
parse ini and convert to json

```
const { parseIni, stringifyIni }
```

```
parseIni(inistring)
```

#### stringifyIni
parse ini and convert to json

```
stringifyIni(inistring)
```

```
const initialIniString = `
; This is a comment
[Database]
host = localhost
port = 3306
user = app_user
password = S3cr3tP@ssw0rd

[Settings]
debug_mode = true
max_connections = 50
timeout_seconds = 30
`;

const configJson = parseIni(initialIniString);

// Change values
configJson.Database.port = 5432;
configJson.Settings.debug_mode = false;
configJson.Settings.log_level = 'info';

// Add a brand new section
configJson.Features = {
    caching_enabled: true,
    cache_ttl: 3600
};

const newIniString = stringifyIni(configJson);
console.log(newIniString);

```
