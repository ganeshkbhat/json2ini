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


module.exports = {
    stringifyIni,
    parseIni
}