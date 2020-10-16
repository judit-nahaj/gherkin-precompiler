'use strict';

const DefaultConfig = require('../DefaultConfig');
const MACROSTEP = /^macro (.*) ?is executed$/;
const {Step} = require('gherkin-ast/index');

/**
 * Macro to create a Cucumber step by combining a block of steps, simplifying often recurring steps.
 * @class
 * @extends DefaultConfig
 */
class Macro extends DefaultConfig {

    constructor() {
        super();
        this.macros = {};
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
    preFilterScenario(scenario, parent, i) {
        if (!scenario.tags) {
            return;
        }
        const macroTag = scenario.tags.find(tag => /^@macro\(.*\)/.test(tag.name));

        if (macroTag) {
            const name = macroTag.name.substring(7, macroTag.name.length - 1);

            if (name.length === 0) {
                throw new Error(`Name is not provided for macro for scenario ${scenario.name}.`);
            }

            if (name in this.macros) {
                throw new Error(`Name ${name} already used in scenario ${this.macros[name].name}.`);
            }

            if (scenario.steps.length === 0) {
                throw new Error(`Macro ${name} does not contain any steps.`);
            }

            if (MACROSTEP.test(scenario.steps.map(step => step.text).join('\n'))) {
                throw new Error(`Macro ${name} contains a macro step.`);
            }
            this.macros[name] = scenario;
            return false;
        }
    }

    onStep(step) {
        if (MACROSTEP.test(step.text)) {
            const name = step.text.match(MACROSTEP)[1].trim();
            if (name.length === 0) {
                throw new Error('Macro name is not provided for macro scenario.');
            }

            if (!(name in this.macros)) {
                throw new Error(`Macro ${name} does not exist.`);
            }

            return this.macros[name].steps;
        }
    }

    /**
     * Creates macro step
     * @static
     * @param {String} macro
     * @returns {Step}
     */
    static createStep(macro) {
        return new Step('When', `macro ${macro} is executed`);
    }
}

module.exports = Macro;