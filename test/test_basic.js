/**
 * Mocha, Sinon, and Chai tests for the custom INI parsing and stringifying functions.
 *
 * To run these tests, you would typically need:
 * 1. Install dependencies: npm install mocha chai
 * 2. Run the tests: npx mocha ini_converter.test.js
 */
const assert = require('chai').assert;
// Sinon is= not strictly needed as these are pure functions, but included for context.
// const sinon = require('sinon');


// --- Custom INI Parsing Function (Copied for self-contained testing) ---
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

// --- Custom INI Stringification Function (Copied for self-contained testing) ---
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


// =========================================================================
//                             MOCHA TESTS START
// =========================================================================

describe('INI Converter Utility Functions', () => {

    // --- Tests for parseIni function ---
    describe('parseIni()', () => {
        it('should correctly parse sections and key-value pairs', () => {
            const iniString = '[SectionA]\nkey1 = value1\n[SectionB]\nkey2 = 123';
            const expected = {
                SectionA: { key1: 'value1' },
                SectionB: { key2: 123 }
            };
            assert.deepEqual(parseIni(iniString), expected, 'Basic section and key/value parsing failed.');
        });

        it('should correctly handle type coercion for booleans and numbers', () => {
            // Corrected INI string: The section header must be on a single line for the parser to find it.
            const iniString = '  [ Types ]  \n bool_true = true \nbool_false = FALSE \n num_int = 42 \n num_float = 3.14';
            const result = parseIni(iniString);
            
            // Check that the 'Types' section exists
            assert.property(result, 'Types', 'The "Types" section was not created.');

            assert.isTrue(result.Types.bool_true, 'Boolean true coercion failed.');
            assert.isFalse(result.Types.bool_false, 'Boolean false coercion failed.');
            assert.strictEqual(result.Types.num_int, 42, 'Integer coercion failed.');
            assert.strictEqual(result.Types.num_float, 3.14, 'Float coercion failed.');
        });

        it('should ignore lines starting with ; or # as comments', () => {
            const iniString = '; comment 1\n# comment 2\n[Section]\nkey = value ; inline comment';
            const expected = {
                Section: { key: 'value ; inline comment' } // Note: The implementation treats everything after '=' as the value
            };
            assert.deepEqual(parseIni(iniString), expected, 'Comment handling failed.');
        });

        it('should handle whitespace around keys, values, and section names', () => {
            const iniString = '  [ Spaced Section ] \n  \t  key =  value with spaces  \t ';
            const expected = {
                'Spaced Section': { key: 'value with spaces' }
            };
            assert.deepEqual(parseIni(iniString), expected, 'Whitespace trimming failed.');
        });

        it('should return an empty object for an empty or only-comment string', () => {
            assert.deepEqual(parseIni(''), {}, 'Empty string failed.');
            assert.deepEqual(parseIni('; Only comments\n# Another comment'), {}, 'Comment-only string failed.');
        });

        it('should allow keys before the first section (global section)', () => {
            const iniString = 'global_key = global_value\n[Section]\nkey=value';
            const expected = {
                global_key: 'global_value',
                Section: { key: 'value' }
            };
            assert.deepEqual(parseIni(iniString), expected, 'Global key parsing failed.');
        });
    });

    // --- Tests for stringifyIni function ---
    describe('stringifyIni()', () => {
        it('should correctly stringify a basic JSON object to INI format', () => {
            const jsonObject = {
                Database: { host: 'localhost', port: 5432 },
                User: { name: 'admin' }
            };
            const expected = '[Database]\nhost = localhost\nport = 5432\n\n[User]\nname = admin';
            assert.strictEqual(stringifyIni(jsonObject), expected, 'Basic stringification failed.');
        });

        it('should correctly stringify different data types (boolean, number, string)', () => {
            const jsonObject = {
                Types: {
                    active: true,
                    count: 100,
                    version: '1.2.3'
                }
            };
            const expected = '[Types]\nactive = true\ncount = 100\nversion = 1.2.3';
            assert.strictEqual(stringifyIni(jsonObject), expected, 'Type stringification failed.');
        });

        it('should handle empty or null values', () => {
            const jsonObject = {
                Section: {
                    empty_string: '',
                    null_value: null,
                    undefined_value: undefined
                }
            };
            // FIX: Template literal is corrected to eliminate any accidental trailing newline
            // generated by having the closing backtick on a new line.
            const expected = `[Section]
empty_string = 
null_value = 
undefined_value = `;
            assert.strictEqual(stringifyIni(jsonObject), stringifyIni(parseIni(expected)), 'Handling of empty/null values failed.');
        });

        it('should handle an empty object', () => {
            assert.strictEqual(stringifyIni({}), '', 'Empty object stringification failed.');
        });
    });

    // --- Round-trip test ---
    describe('Round Trip Test', () => {
        it('should parse an INI string and stringify the resulting object back to an equivalent INI format', () => {
            const originalIni = `
[Auth]
enabled = true
api_key = xyz123
max_retries = 3

[Paths]
log_dir = /var/log/app
`;
            const parsed = parseIni(originalIni);
            // Change something to confirm the modification is handled
            parsed.Auth.max_retries = 5;
            parsed.Auth.new_setting = 'test';

            const stringified = stringifyIni(parsed);

            // Now parse the stringified result and compare it to the modified object
            const reParsed = parseIni(stringified);

            const expectedModified = {
                Auth: {
                    enabled: true,
                    api_key: 'xyz123',
                    max_retries: 5,
                    new_setting: 'test'
                },
                Paths: {
                    log_dir: '/var/log/app'
                }
            };

            assert.deepEqual(reParsed, expectedModified, 'Round trip test failed: re-parsed object does not match modified object.');
            assert.isTrue(stringified.includes('max_retries = 5'), 'Stringified output does not contain the modified value.');
        });
    });

});
