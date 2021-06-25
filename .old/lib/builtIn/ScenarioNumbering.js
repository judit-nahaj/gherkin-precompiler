'use strict';

const DefaultConfig = require('../DefaultConfig');
const {Background} =  require('gherkin-ast/index');

/**
 * @typedef {Object} ScenarioNumberConfiguration
 * @property {string} format
 */
const DEFAULT_CONFIG = {
    format: '${i}. ${name}'
};

/**
 * The ScenarioNumbering precompiler is responsible
 * to add an index to all scenario and scenario outlines
 * name.
 * @class
 * @extends DefaultConfig
 */
class ScenarioNumbering extends DefaultConfig {
    /**
     * @constructor
     * @param {ScenarioNumberingConfig|Object} config
     */
    constructor(config) {
        super();
        this.config = Object.assign({}, DEFAULT_CONFIG, config || {});
    }

    onFeature(feature) {
        let i = 0;
        feature.elements.forEach(element => {
            if (!(element instanceof Background)) {
                element.name = this.config.format
                    .replace(/\$\{i\}/g, ++i)
                    .replace(/\$\{name\}/g, element.name);
            }
        });
    }
}

module.exports = ScenarioNumbering;