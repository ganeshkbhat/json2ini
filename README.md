# parse ini
ini to json and json to ini parser

ini parser will have following functions

```
let sampleINI = '\n' +
'[Database]\n' +
'host = 127.0.0.1\n' +
'port = 5432\n' +
var ini = new INIParser();
```

#### ini.parse
parse ini and convert to json

```
parser.parse(sampleINI);
parser.toJSON()
```


#### ini.get
get the value of a specific ini key

```
parser.get('Database', 'host');
// value of Database.host
```


#### ini.set
set the Database.timeout_seconds to value 30

```
parser.set('Database', 'timeout_seconds', 30);
// new value of Database.timeout_seconds is 30
```


#### ini.delete

```
parser.delete('Features', 'max_retries');
deletes the key Features.max_retries;
```


#### ini.toJSON
converts value to a json value

```
parser.parse(sampleINI);
parser.toJSON()
```


#### ini.stringify
converts value to a string

```
var finalINI = parser.stringify();
// converts value to a string
```
