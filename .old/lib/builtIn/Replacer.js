'use strict';

const DefaultConfig = require('../DefaultConfig');

/**
 * Replacer to change keywords in the input feature file.
 * @class
 * @extends DefaultConfig
 */
class Replacer extends DefaultConfig {
    /**
     * @constructor
     * @param {Object} config A json file containing the keys to be changed and the values to change them for.
     */
    constructor(config) {
        super();
        if (typeof config !== 'object') {
            throw new TypeError('Configuration is not an object: ' + config);
        }
        this.config = config;
    }

    /**
     * @param {Object} obj The config json
     * @param {...string} keys The content of the json (containing the words to replace and the words to replace them with)
     * @private
     */
    _replaceAll(obj, ...keys) {
        keys.forEach(key => {
            if (obj[key]) {
                Object.keys(this.config).forEach(toReplace => {
                    const replaceWith = this.config[toReplace];
                    obj[key] = obj[key].replace(new RegExp('\\$\\{' + toReplace + '\\}', 'gi'), replaceWith);
                });
            }
        });
    }

    /**
     * @param {TableRow} row A row of an Examples table
     * @private
     */
    _replaceInTableRow(row) {
        row.cells.forEach(cell => {
            this._replaceAll(cell, 'value');
        });
    }

    onFeature(feature) {
        this._replaceAll(feature, 'name', 'description');
    }

    onBackground(background) {
        this._replaceAll(background, 'name', 'description');
    }

    onScenarioOutline(scenarioOutline) {
        this._replaceAll(scenarioOutline, 'name', 'description');
    }

    onScenario(scenario) {
        this._replaceAll(scenario, 'name', 'description');
    }

    onStep(step) {
        this._replaceAll(step, 'text');
    }

    onTag(tag) {
        this._replaceAll(tag, 'name');
    }

    onExamples(examples) {
        this._replaceAll(examples, 'name');
    }

    onDocString(docString) {
        this._replaceAll(docString, 'content');
    }

    onDataTable(dataTable) {
        dataTable.rows.forEach(row => {
            this._replaceInTableRow(row);
        })
    }

    onExampleRow(exampleRow) {
        this._replaceInTableRow(exampleRow);
    }

    onExampleHeader(exampleHeader) {
        this._replaceInTableRow(exampleHeader);
    }
}

module.exports = Replacer;