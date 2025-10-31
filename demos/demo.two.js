// --- Main Demonstration Logic ---
const {
    stringifyIni,
    parseIni
} = require("../index.js")
// --- 1. Define the Initial INI String ---

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

console.log('--- Initial INI String ---');
console.log(initialIniString);

// --- 2. Convert INI String to JSON Object (Parsing) ---
// Using the custom parseIni function
const configJson = parseIni(initialIniString);

console.log('\n--- Converted JSON Object (Parsed) ---');
console.log(JSON.stringify(configJson, null, 2));


// --- 3. Modify the JSON Object ---
console.log('\n--- Modifying JSON Object... ---');

// Change values
configJson.Database.port = 5432;
configJson.Settings.debug_mode = false;
configJson.Settings.log_level = 'info';

// Add a brand new section
configJson.Features = {
    caching_enabled: true,
    cache_ttl: 3600
};

console.log('Changes made: Database.port = 5432, Settings.debug_mode = false, New Feature section added.');


// --- 4. Convert Modified JSON Object back to INI String (Stringifying) ---
// Using the custom stringifyIni function
const newIniString = stringifyIni(configJson);

console.log('\n--- New INI String (Stringified) ---');
console.log(newIniString);

// Verify the changes in the new INI string
if (newIniString.includes('port = 5432') && newIniString.includes('debug_mode = false')) {
    console.log('\n✅ Success! The JSON object was modified and converted back to INI format with changes applied.');
} else {
    console.log('\n❌ Error: Changes were not reflected in the final INI string.');
}

const fs = require("fs");
const data = fs.readFileSync('./demos/demo.ini', 'utf8');

console.log(parseIni(data), "from\n", data)

