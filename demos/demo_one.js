

const INIParser = require("../index")


// --- USAGE EXAMPLE ---
var sampleINI = '\n' +
'# This is a sample INI file\n' +
'; Comment line\n' +
'\n' +
'[Database]\n' +
'host = 127.0.0.1\n' +
'port = 5432\n' +
'user = admin\n' +
'\n' +
'[Features]\n' +
'logging_enabled = true\n' +
'max_retries = 5\n';

var parser = new INIParser();

// 1. READ: Parse the INI string
console.log("--- 1. Initial Parsing ---");
parser.parse(sampleINI);
console.log("JSON Object after parsing:", JSON.stringify(parser.toJSON(), null, 2));

// 2. READ: Get a specific value
console.log("\n--- 2. Get Value (Read) ---");
var currentHost = parser.get('Database', 'host');
console.log("Current Database Host: " + currentHost);

// 3. UPDATE: Change an existing value
console.log("\n--- 3. Update Value ---");
parser.set('Database', 'host', 'db.prod.internal');
console.log("New Host: " + parser.get('Database', 'host'));

// 4. WRITE: Add a new key-value pair to an existing section
console.log("\n--- 4. Add New Key ---");
parser.set('Database', 'timeout_seconds', 30);

// 5. WRITE: Add a completely new section
console.log("\n--- 5. Add New Section ---");
parser.set('AppConfig', 'api_key', 'XYZ123');

// 6. DELETE: Delete a specific key
console.log("\n--- 6. Delete Key ---");
parser.delete('Features', 'max_retries');
console.log('Features section after deletion:', JSON.stringify(parser.toJSON().Features));

// 7. DELETE: Delete an entire section
console.log("\n--- 7. Delete Section ---");
parser.delete('AppConfig');
console.log('AppConfig exists?', !!parser.toJSON().AppConfig);

// 8. STRINGIFY: Convert the modified object back to INI format
console.log("\n--- 8. Final INI Output (Stringify) ---");
var finalINI = parser.stringify();
console.log(finalINI);
