'use strict';

/**
 * The StepGroups precompiler is responsible
 * for setting the correct keywords for steps to make scenarios readable
 * @class
 * @extends DefaultConfig
 */

class StepGroups {
    onScenario(scenario) {
        scenario.useReadableStepKeywords();
    }

    onScenarioOutline(scenarioOutline) {
        scenarioOutline.useReadableStepKeywords();
    }

    onBackground(background) {
        background.useReadableStepKeywords();
    }
}

module.exports = StepGroups;