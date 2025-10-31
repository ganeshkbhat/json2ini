/**
 * INIParser Constructor Function
 * Manages reading, writing, updating, and deleting data within an INI configuration format,
 * while internally representing the data as a JavaScript object (JSON structure).
 */
function INIParser() {
    // Internal state stored as a simple JavaScript object (Section -> Key -> Value)
    this.data = {};
}

/**
 * Parses an INI string into the internal data object.
 * @param {string} iniString The raw INI configuration file content.
 */
INIParser.prototype.parse = function(iniString) {
    this.data = {};
    var currentSection = 'default'; // Use 'default' for keys before any section header

    // Split the string into lines and process each line
    var lines = iniString.split('\n');

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        // Trim leading/trailing whitespace
        var trimmedLine = line.trim();

        // Skip empty lines and lines starting with a comment character
        // Using indexOf(char) === 0 for compatibility
        if (!trimmedLine || trimmedLine.indexOf(';') === 0 || trimmedLine.indexOf('#') === 0) {
            continue;
        }

        // Check for a section header: [section_name]
        var sectionMatch = trimmedLine.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            // Set the current section (trimming any whitespace inside the brackets)
            currentSection = sectionMatch[1].trim();
            if (!this.data[currentSection]) {
                this.data[currentSection] = {};
            }
            continue;
        }

        // Check for a key-value pair: key = value
        var kvMatch = trimmedLine.match(/^([^=]+?)\s*=\s*(.*)$/);
        if (kvMatch) {
            var key = kvMatch[1].trim();
            var value = kvMatch[2].trim();

            // Ensure the current section exists
            if (!this.data[currentSection]) {
                this.data[currentSection] = {};
            }

            // Store the key-value pair
            this.data[currentSection][key] = value;
        }
    }

    // Remove 'default' section if it's empty
    if (this.data.default && Object.keys(this.data.default).length === 0) {
        delete this.data.default;
    }

    return this.data;
};

// --- CRUD OPERATIONS ---

/**
 * READ: Retrieves a value from a specific section and key.
 * @param {string} section The section name.
 * @param {string} key The key name.
 * @returns {string|undefined} The value, or undefined if not found.
 */
INIParser.prototype.get = function(section, key) {
    return (this.data[section] && this.data[section][key] !== undefined) ? this.data[section][key] : undefined;
};

/**
 * WRITE/UPDATE: Sets or updates a value for a specific section and key.
 * Creates the section if it does not exist.
 * @param {string} section The section name.
 * @param {string} key The key name.
 * @param {string} value The new value (will be converted to string).
 */
INIParser.prototype.set = function(section, key, value) {
    if (!this.data[section]) {
        this.data[section] = {};
    }
    this.data[section][key] = String(value);
};

/**
 * DELETE: Deletes a specific key-value pair, or an entire section.
 * @param {string} section The section name.
 * @param {string} [key] Optional: The key name to delete. If omitted, the entire section is deleted.
 * @returns {boolean} True if deletion occurred, false otherwise.
 */
INIParser.prototype.delete = function(section, key) {
    if (!this.data[section]) {
        return false;
    }

    if (key === undefined) {
        // Delete the entire section
        delete this.data[section];
        return true;
    } else if (this.data[section][key] !== undefined) {
        // Delete a specific key
        delete this.data[section][key];
        // Clean up empty section
        if (Object.keys(this.data[section]).length === 0) {
            delete this.data[section];
        }
        return true;
    }
    return false;
};

/**
 * Read All: Returns the entire internal data structure as a JSON-like object.
 * @returns {object} The parsed configuration data.
 */
INIParser.prototype.toJSON = function() {
    return this.data;
};

/**
 * Converts the internal data object back into a formatted INI string.
 * @returns {string} The generated INI file content.
 */
INIParser.prototype.stringify = function() {
    var iniOutput = '';
    var sections = Object.keys(this.data);

    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var keys = Object.keys(this.data[section]);

        if (keys.length === 0) {
            continue; // Skip empty sections
        }

        // Add the section header
        iniOutput += '[' + section + ']\n';

        // Add key-value pairs for the section
        for (var j = 0; j < keys.length; j++) {
            var key = keys[j];
            iniOutput += key + ' = ' + this.data[section][key] + '\n';
        }
        iniOutput += '\n'; // Add an extra newline for separation
    }

    // Trim the final trailing newline/whitespace using a robust regex for older JS
    return iniOutput.replace(/[\s\r\n]+$/g, '');
};

module.exports = INIParser
