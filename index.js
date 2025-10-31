/**
 * Node.js script to demonstrate reading an INI string, converting it to JSON,
 * modifying the JSON object, and converting it back to a new INI string.
 *
 * This version uses ONLY native JavaScript/Node.js features (no external 'ini' package).
 */

// --- Custom INI Parsing Function ---
function parseIni(iniString) {
    const config = {};
    let currentSection = config;

    // Split by line and iterate
    iniString.split('\n').forEach(line => {
        line = line.trim();

        // 1. Skip blank lines and comments (starting with ; or #)
        if (line === '' || line.startsWith(';') || line.startsWith('#')) {
            return;
        }

        // 2. Check for Section Header: [SectionName]
        let match = line.match(/^\s*\[([^\]]*)\]\s*$/);
        if (match) {
            const sectionName = match[1].trim();
            currentSection = config[sectionName] = {};
            return;
        }

        // 3. Check for Key-Value Pair: key = value
        match = line.match(/^\s*([^=]+?)\s*=\s*(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();

            // Simple type coercion (convert strings "true"/"false" and numbers)
            if (value.toLowerCase() === 'true') {
                value = true;
            } else if (value.toLowerCase() === 'false') {
                value = false;
            } else if (!isNaN(Number(value)) && value.trim() !== '') {
                value = Number(value);
            }

            currentSection[key] = value;
        }
    });

    return config;
}

// --- Custom INI Stringification Function ---
function stringifyIni(jsonObject) {
    let output = '';

    for (const sectionName in jsonObject) {
        if (Object.hasOwnProperty.call(jsonObject, sectionName)) {
            const section = jsonObject[sectionName];

            // Add the section header
            output += `[${sectionName}]\n`;

            // Add key-value pairs for the section
            for (const key in section) {
                if (Object.hasOwnProperty.call(section, key)) {
                    let value = section[key];
                    // Ensure boolean values are stringified correctly
                    if (typeof value === 'boolean') {
                        value = value ? 'true' : 'false';
                    } else if (value === null || value === undefined) {
                        value = '';
                    } else {
                        value = String(value);
                    }
                    output += `${key} = ${value}\n`;
                }
            }
            // Add a blank line after each section for readability
            output += '\n';
        }
    }
    return output.trim(); // Trim final whitespace
}


// --- Main Demonstration Logic ---

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