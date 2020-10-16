'use strict';

const DefaultConfig = require('../DefaultConfig');


/**
 * @typedef {Object} ForLoopConfiguration
 * @property {number} maxValue
 * @property {string} tagName
 * @property {string} format
 */
const DEFAULT_CONFIG = {
    maxValue: 10,
    tagName: 'loop',
    format: '${name} (${i})'
};

/**
 * ForLoop to repeat a scenario for a given number of times.
 * @class
 * @extends DefaultConfig
 */
class ForLoop extends DefaultConfig {
    /**
     * @constructor
     * @param {ForLoopConfiguration|Object} config
     */
    constructor(config) {
        super();
        this.config = Object.assign({}, DEFAULT_CONFIG, config || {});
        this._looptag = new RegExp('^@' + this.config.tagName + '\\((\\d+)\\)');
    }

    /**
     *
     * @param scenario Scenario that is checked
     * @returns {number} The number of iterations the scenario will be repeated, or 0 if no repeat is necessary
     */
    getIterationNumber(scenario) {
        const iteratorMatch = scenario.tags.map(tag => tag.name.match(this._looptag)).find(Boolean);
        if (!iteratorMatch) {
            return 0;
        }
        const iterator = +iteratorMatch[1];

        if (iterator > this.config.maxValue) {
            throw new Error(`Iterator ${iterator} exceeds maximum value of ${this.config.maIterator}.`)
        }
        return iterator;
    }

    looper(scenario) {
        const n = this.getIterationNumber(scenario);
        if (n > 0) {
            scenario.tags = scenario.tags.filter(tag => this.preFilterTag(tag));
            const loopedScenarios = [];
            for (let i = 1; i <= n; i++) {
                const actualScenario = scenario.clone();
                actualScenario.name = this.config.format
                    .replace(/\${i}/g, i)
                    .replace(/\${name}/g, actualScenario.name);
                loopedScenarios.push(actualScenario);
            }
            return loopedScenarios;
        }
    }

    /**
     * Function to filter out scenarios of a feature (scenario, scenario outline)
     * before they are processed.
     * Return FALSE if the given element should be filtered out. Otherwise it won't be.
     *
     * @param {Scenario|ScenarioOutline} scenario The scenario to be tested.
     * @param {Feature} parent The parent feature of the scenario.
     * @param {number} i The index of the current element.
     * @returns {boolean|*} FALSE if the given element should be filtered out.
     */
    onScenario(scenario) {
        return this.looper(scenario);
    }

    onScenarioOutline(scenarioOutline) {
        return this.looper(scenarioOutline);
    }

    preFilterTag(tag) {
        return !this._looptag.test(tag.name);
    }
}

module.exports = ForLoop;