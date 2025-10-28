/**
 * INIParser Test Suite
 *
 * NOTE: This file assumes the INIParser function from 'ini_parser.js' is loaded
 * into the global scope and that the Mocha (describe, it) and Chai (assert)
 * libraries are also available.
 */

// Define or assume the presence of the necessary testing libraries and the parser.
// For a standalone execution, these variables would be loaded externally.
/*
var assert = chai.assert;
var describe = function(name, fn) { ... };
var it = function(name, fn) { ... };
*/

const INIParser = require("../index")

describe('INIParser', function() {
    // A fresh parser instance for each test
    var parser;

    // Standard setup: runs before each test
    beforeEach(function() {
        // We assume INIParser is globally defined by the user's file
        parser = new INIParser();
    });

    // --- Parsing (Read) Tests ---

    describe('#parse()', function() {
        it('should correctly parse a standard INI string with sections', function() {
            var ini = "[Section1]\nkey1=value1\nkey2=value2\n[Section2]\nkeyA=valueA";
            var result = parser.parse(ini);
            
            assert.deepEqual(result, {
                'Section1': { 'key1': 'value1', 'key2': 'value2' },
                'Section2': { 'keyA': 'valueA' }
            }, "Standard INI structure failed to parse");
        });

        it('should handle keys defined before the first section as implicit "default"', function() {
            var ini = "global_key=global_value\n[Section]\nkey=value";
            var result = parser.parse(ini);
            
            assert.isUndefined(result.default, "Should not create an empty 'default' section if keys exist");
            assert.equal(result.global_key, "global_value", "Global key before section failed to parse");
        });
        
        it('should correctly handle various whitespace around keys, values, and sections', function() {
            var ini = "[ \t WhitespaceSection \t ]\n key \t = \t value \t \n";
            var result = parser.parse(ini);

            assert.deepEqual(result, {
                'WhitespaceSection': { 'key': 'value' }
            }, "Whitespace handling failed");
        });

        it('should ignore comment lines starting with semicolon (;) or hash (#)', function() {
            var ini = "# Global comment\nkey1=value1\n; Another comment\n[Section]\nkey2=value2";
            var result = parser.parse(ini);

            assert.deepEqual(result, {
                'key1': 'value1',
                'Section': { 'key2': 'value2' }
            }, "Comments were not ignored");
        });
        
        it('should handle empty or only whitespace INI strings correctly', function() {
            var ini = "\n\n  \t \n";
            var result = parser.parse(ini);

            assert.deepEqual(result, {}, "Empty INI string should result in an empty object");
        });
    });

    // --- CRUD Operations Tests ---

    describe('CRUD Operations', function() {
        beforeEach(function() {
            // Setup with base data
            parser.data = {
                'App': { 'name': 'App X', 'version': '1.0' },
                'User': { 'id': '101' }
            };
        });

        // Test READ
        describe('#get()', function() {
            it('should retrieve an existing value', function() {
                assert.equal(parser.get('App', 'name'), 'App X', "Failed to get existing value");
            });

            it('should return undefined for a non-existent key', function() {
                assert.isUndefined(parser.get('App', 'non_existent_key'), "Did not return undefined for missing key");
            });

            it('should return undefined for a non-existent section', function() {
                assert.isUndefined(parser.get('MissingSection', 'key'), "Did not return undefined for missing section");
            });
        });

        // Test WRITE/UPDATE
        describe('#set()', function() {
            it('should update an existing key in an existing section', function() {
                parser.set('App', 'version', '2.0');
                assert.equal(parser.data.App.version, '2.0', "Failed to update existing key");
            });

            it('should add a new key to an existing section', function() {
                parser.set('App', 'maintainer', 'Bob');
                assert.equal(parser.data.App.maintainer, 'Bob', "Failed to add new key");
            });

            it('should create a new section if it does not exist', function() {
                parser.set('NewSection', 'test_key', 123);
                assert.deepEqual(parser.data.NewSection, { 'test_key': '123' }, "Failed to create new section");
            });
            
            it('should convert non-string values to strings', function() {
                parser.set('App', 'is_active', true);
                parser.set('App', 'count', 500);
                assert.strictEqual(parser.data.App.is_active, 'true', "Boolean value not converted to string");
                assert.strictEqual(parser.data.App.count, '500', "Numeric value not converted to string");
            });
        });

        // Test DELETE
        describe('#delete()', function() {
            it('should delete a specific key and return true', function() {
                var result = parser.delete('App', 'version');
                assert.isTrue(result, "Delete key did not return true");
                assert.isUndefined(parser.data.App.version, "Key was not deleted");
            });

            it('should delete an entire section if no key is provided and return true', function() {
                var result = parser.delete('User');
                assert.isTrue(result, "Delete section did not return true");
                assert.isUndefined(parser.data.User, "Section was not deleted");
            });

            it('should return false if the section does not exist', function() {
                assert.isFalse(parser.delete('NonExistent'), "Returned true for non-existent section");
            });

            it('should return false if the key does not exist', function() {
                assert.isFalse(parser.delete('App', 'fake_key'), "Returned true for non-existent key");
            });

            it('should delete an empty section after deleting its last key', function() {
                parser.data.EmptyTest = { 'temp': '1' };
                parser.delete('EmptyTest', 'temp');
                assert.isUndefined(parser.data.EmptyTest, "Empty section was not cleaned up");
            });
        });
    });
    
    // --- Output Conversion Tests ---

    describe('#stringify() and #toJSON()', function() {
        it('should return the internal data object via toJSON()', function() {
            parser.data = { 'Test': { 'key': 'value' } };
            var json = parser.toJSON();
            assert.deepEqual(json, { 'Test': { 'key': 'value' } }, "toJSON did not return internal data");
            assert.notStrictEqual(json, parser.data, "Should ideally return a copy, but checking structure is primary.");
        });

        it('should convert the internal object back to a valid INI string', function() {
            parser.data = {
                'DB': { 'host': 'localhost', 'port': '8080' },
                'Settings': { 'mode': 'prod' }
            };
            var iniString = parser.stringify();
            
            var expected = "[DB]\n" +
                           "host = localhost\n" +
                           "port = 8080\n" +
                           "\n" +
                           "[Settings]\n" +
                           "mode = prod";
                           
            // Normalize line endings and trim whitespace for robust comparison
            var normalizedOutput = iniString.replace(/\r/g, '').trim();
            var normalizedExpected = expected.replace(/\r/g, '').trim();

            assert.strictEqual(normalizedOutput, normalizedExpected, "Stringify output does not match expected INI format");
        });
        
        it('should not include empty sections in the stringified output', function() {
            parser.data = {
                'Valid': { 'key': 'value' },
                'Empty': {} // Empty section
            };
            var iniString = parser.stringify();
            
            assert.isTrue(iniString.indexOf('Valid') > -1, "Valid section is missing");
            assert.isFalse(iniString.indexOf('Empty') > -1, "Empty section was included");
        });
    });
});
