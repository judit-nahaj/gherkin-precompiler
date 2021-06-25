'use strict';

const DefaultConfig = require('../DefaultConfig');
const {Tag} = require('gherkin-ast/index');
const ObjectSet = require('object-set-type');

/**
 * @typedef {Object} RemoveDuplicatesConfiguration
 * @property {boolean} processTags
 * @property {boolean} processRows
 * @property {boolean} verbose
 */
const DEFAULT_CONFIG = {
    processTags: true,
    processRows: false,
    verbose: true
};

const removeDuplicates = array => Array.from(new Set(array));

/**
 * Precompiler which removes duplicate tags and/or data table rows.
 * @class
 * @extends DefaultConfig
 */
class RemoveDuplicates extends DefaultConfig {
    /**
     * @constructor
     * @param {RemoveDuplicatesConfiguration} config 
     */
    constructor(config) {
        super();
        /** @member {RemoveDuplicatesConfiguration} */
        this.config = Object.assign({}, DEFAULT_CONFIG, config || {});

        /** @member {Function} */
        this.logTag = this._getLogger(this.config.processTags);
        /** @member {Function} */
        this.logRow = this._getLogger(this.config.processRows);
    }

    /**
     * Creates an appropriate logger, based on configuration.
     * @private
     * @param {boolean} enabled 
     * @returns {Function}
     */
    _getLogger(enabled) {
        return this.config.verbose ? (...args) => console[enabled ? 'log' : 'warn'].apply(console, args) : () => null;
    }

    /**
     * Checkes whether the given object has a tag with given name.
     * @private
     * @param {Scenario|ScenarioOutline|Examples|Feature} element 
     * @param {string} tagName 
     * @returns {boolean}
     */
    _hasTag(element, tagName) {
        if (!element.tags || !element.tags.length) {
            return false;
        }
        return element.tags.some(tag => tag.name === tagName);
    }

    /**
     * Removes duplicated tags from the given object.
     * It removes:
     *  - tags which exists on parent too
     *  - duplicate tags
     * @private
     * @param {Scenario|ScenarioOutline|Examples|Feature} element
     * @param {Feature} [parent]
     */
    _filterTags(element, parent) {
        if (element.tags && element.tags.length) {
            const ownTags = element.tags.filter(tag => {
                if (this._hasTag(parent, tag.name)) {
                    this.logTag(`The ${tag.name} presents on feature too on "${element.keyword} ${element.name}" in "${parent.keyword} ${parent.name}"`);
                    return false;
                }
                return true;
            });
            const tagNames = ownTags.map(tag => tag.name);
            const uniqueTagNames = removeDuplicates(tagNames);
            if (tagNames.length !== uniqueTagNames) {
                uniqueTagNames.filter(tag => {
                    return tagNames.reduce((n, name) => n + (name === tag ? 1 : 0), 0) > 1;
                }).forEach(tag => {
                    this.logTag(`The ${tag} presents multiple times on "${element.keyword} ${element.name}" in "${parent.keyword} ${parent.name}"`);
                });
            }
            if (this.config.processTags) {
                element.tags = uniqueTagNames.map(tag => new Tag(tag));
            }
        }
    }

    /**
     * Removes duplicate rows from the body of the examples.
     * @private
     * @param {Examples} examples 
     * @param {ScenarioOutline} scenario 
     * @param {Feature} parent 
     */
    _filterRows(examples, scenario, parent) {
        if (examples.body && examples.body.length) {
            const rowSet = new ObjectSet();
            let prevSize = 0;
            examples.body.forEach(row => {
                rowSet.add(row);
                if (rowSet.size === prevSize) {
                    this.logRow(`The [${row.cells.map(cell => cell.value).join('|')}] presents multiple times on "${scenario.keyword} ${scenario.name}" in "${parent.keyword} ${parent.name}"`);
                }
                prevSize = rowSet.size;
            });
            if (this.config.processRows && rowSet.size !== examples.body.length) {
                examples.body = Array.from(rowSet);
            }
        }
    }

    /**
     * Event handler for feature event.
     * @param {Feature} feature 
     */
    onFeature(feature) {
        this._filterTags(feature);
    }

    /**
     * Event handler for scenario event.
     * @param {Scenario} scenario 
     * @param {Feature} parent 
     */
    onScenario(scenario, parent) {
        this._filterTags(scenario, parent);
    }

    /**
     * Event handler for scenarioOutline event.
     * @param {ScenarioOutline} scenarioOutline 
     * @param {Feature} parent 
     */
    onScenarioOutline(scenarioOutline, parent) {
        this._filterTags(scenarioOutline, parent);
        if (scenarioOutline.examples) {
            scenarioOutline.examples.forEach(examples => {
                this._filterTags(examples, parent);
                this._filterRows(examples, scenarioOutline, parent);
            });
        }
    }
}

module.exports = RemoveDuplicates;