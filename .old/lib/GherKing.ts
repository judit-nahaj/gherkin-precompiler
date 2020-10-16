'use strict';
import {
    Background,
    DataTable,
    DocString,
    Document,
    Examples,
    Feature,
    GherkinDocument,
    Rule,
    Scenario,
    ScenarioOutline,
    Step,
    TableRow,
    Tag
} from 'gherkin-ast';
import {PreCompiler} from "./PreCompiler";

type PreCompilerMethod = keyof PreCompiler;
interface EventMethods {
    [name: string]: PreCompilerMethod;
}
interface FilterMethods {
    [name: string]: {
        PRE: PreCompilerMethod;
        POST: PreCompilerMethod;
    };
}
const EVENT_METHODS: EventMethods = {
    FEATURE: 'onFeature',
    SCENARIO: 'onScenario',
    BACKGROUND: 'onBackground',
    SCENARIO_OUTLINE: 'onScenarioOutline',
    STEP: 'onStep',
    TAG: 'onTag',
    DOC_STRING: 'onDocString',
    DATA_TABLE: 'onDataTable',
    EXAMPLES: 'onExamples',
    EXAMPLE_HEADER: 'onExampleHeader',
    EXAMPLE_ROW: 'onExampleRow',
    RULE: 'onRule'
};
const FILTER_METHODS: FilterMethods = {
    TAG: {
        PRE: 'preFilterTag',
        POST: 'postFilterTag'
    },
    SCENARIO: {
        PRE: 'preFilterScenario',
        POST: 'postFilterScenario'
    },
    STEP: {
        PRE: 'preFilterStep',
        POST: 'postFilterStep'
    },
    ROW: {
        PRE: 'preFilterRow',
        POST: 'postFilterRow'
    },
    EXAMPLES: {
        PRE: 'preFilterExamples',
        POST: 'postFilterExamples'
    },
    RULE: {
        PRE: "preFilterRule",
        POST: "postFilterRule"
    }
};
/**
 * Gherkin feature file pre-compilers.
 * @class
 */
export class GherKing {
    /** Config of the precompiler */
    private preCompiler: Partial<PreCompiler>;

    constructor(preCompiler: Partial<PreCompiler>) {
        this.preCompiler = preCompiler || {};
    }

    /**
     * Applies the pre-compiler to the given AST.
     *
     * @param {Document} ast
     * @returns {Document}
     */
    public applyToAST(ast: Document): Document {
        const result: Document = ast.clone();
        this.applyToFeature(result.feature, result);
        return result;
    }

    private filter<L,P>(list: L[], parent: P, method: PreCompilerMethod): L[] {
        if (!this.preCompiler[method]) {
            return list;
        }
        return list.filter((item, i) => this.preCompiler[method](item, parent, i) !== false);
    }

    private handleEvent<P>(parent: P, key: keyof P, method: PreCompilerMethod): void {
        if (this.preCompiler[method]) {
            const result = this.preCompiler[method](parent[key], parent);
            if (result !== undefined) {
                parent[key] = result;
            }
        }
    }

    private handleListEvent<L,P>(list: L[], parent: P, i: number, method: PreCompilerMethod): void {
        if (this.preCompiler[method]) {
            const result = this.preCompiler[method](list[i], parent, i);
            if (result === null) {
                list.splice(i, 1);
            } else if (Array.isArray(result)) {
                list.splice.apply(list, [i, 1].concat(result));
            } else if (result !== undefined) {
                list[i] = result;
            }
        }
    }

    private applyToTags(tags: Tag[], parent: Feature | Scenario | ScenarioOutline | Background | Examples): void {
        for (let i = 0; i < tags.length; ++i) {
            this.handleListEvent<Tag, Feature | Scenario | ScenarioOutline | Background | Examples>(tags, parent, i, EVENT_METHODS.TAG);
        }
    }

    /**
     * Applies the process events to Feature.
     *
     * @param {Feature} feature
     * @param {GherkinDocument} doc
     * @private
     */
    private applyToFeature(feature: Feature, doc: Document): void {
        this.handleEvent(doc, 'feature', EVENT_METHODS.FEATURE);

        feature.tags = this.filter(feature.tags, feature, FILTER_METHODS.TAG.PRE);
        this.applyToTags(feature.tags, feature);
        feature.tags = this.filter(feature.tags, feature, FILTER_METHODS.TAG.POST);
        let containsRule = false;
        for (let i = 0; i < feature.elements.length; ++i) {
            if (feature.elements[i] instanceof Rule) {
                containsRule = true;
                break;
            }
        }
        if (containsRule) {
            feature.elements = this.filter(feature.elements, feature, FILTER_METHODS.RULE.PRE);
            for (let i = 0; i < feature.elements.length; ++i) {
                this.applyToRule(<Rule>feature.elements[i], feature, i)
            }
            feature.elements = this.filter(feature.elements, feature, FILTER_METHODS.RULE.PRE);
        }
        else {
            feature.elements = this.filter(feature.elements, feature, FILTER_METHODS.SCENARIO.PRE);
            for (let i = 0; i < feature.elements.length; ++i) {
                const element: Scenario | ScenarioOutline | Background | Rule = feature.elements[i];
                if (element instanceof Scenario) {
                    this.applyToScenario(element, feature, i);
                } else if (element instanceof ScenarioOutline) {
                    this.applyToScenarioOutline(element, feature, i);
                } else if (element instanceof Background) {
                    this.applyToBackground(element, feature, i);
                }
            }
            feature.elements = this.filter(feature.elements, feature, FILTER_METHODS.SCENARIO.POST);
        }
    }

    private applyToRule(rule: Rule, feature: Feature, i: number): void {
        this.handleListEvent(feature.elements, feature, i, EVENT_METHODS.RULE);

        rule.elements = this.filter(rule.elements, rule, FILTER_METHODS.SCENARIO.PRE);
        for (let i = 0; i < rule.elements.length; ++i) {
            const element: Scenario | Background = rule.elements[i];
            if (element instanceof Scenario) {
                this.applyToScenario(element, rule, i);
            } else if (element instanceof Background) {
                this.applyToBackground(element, rule, i);
            }
        }
        rule.elements = this.filter(rule.elements, rule, FILTER_METHODS.SCENARIO.POST);
    }

    private applyToScenario(scenario: Scenario, parent: Feature | Rule, i: number): void {
        this.handleListEvent(parent.elements, parent, i, 'onScenario');

        scenario.tags = this.filter(scenario.tags, scenario, FILTER_METHODS.TAG.PRE);
        this.applyToTags(scenario.tags, scenario);
        scenario.tags = this.filter(scenario.tags, scenario, FILTER_METHODS.TAG.POST);

        scenario.steps = this.filter(scenario.steps, scenario, FILTER_METHODS.STEP.PRE);
        for (let i = 0; i < scenario.steps.length; ++i) {
            this.applyToStep(scenario.steps[i], scenario, i);
        }
        scenario.steps = this.filter(scenario.steps, scenario, FILTER_METHODS.STEP.POST);
    }

    private applyToScenarioOutline(scenarioOutline: ScenarioOutline, feature: Feature, i: number): void {
        this.handleListEvent(feature.elements, feature, i, EVENT_METHODS.SCENARIO_OUTLINE);

        scenarioOutline.tags = this.filter(scenarioOutline.tags, scenarioOutline, FILTER_METHODS.TAG.PRE);
        this.applyToTags(scenarioOutline.tags, scenarioOutline);
        scenarioOutline.tags = this.filter(scenarioOutline.tags, scenarioOutline, FILTER_METHODS.TAG.POST);

        scenarioOutline.steps = this.filter(scenarioOutline.steps, scenarioOutline, FILTER_METHODS.STEP.PRE);
        for (let i = 0; i < scenarioOutline.steps.length; ++i) {
            this.applyToStep(scenarioOutline.steps[i], scenarioOutline, i);
        }
        scenarioOutline.steps = this.filter(scenarioOutline.steps, scenarioOutline, FILTER_METHODS.STEP.POST);

        scenarioOutline.examples = this.filter(scenarioOutline.examples, scenarioOutline, FILTER_METHODS.EXAMPLES.PRE);
        for (let i = 0; i < scenarioOutline.examples.length; ++i) {
            this.applyToExamples(scenarioOutline.examples[i], scenarioOutline, i);
        }
        scenarioOutline.examples = this.filter(scenarioOutline.examples, scenarioOutline, FILTER_METHODS.EXAMPLES.POST);
    }

    private applyToBackground(background: Background, parent: Feature | Rule, i: number): void {
        this.handleListEvent(parent.elements, parent, i, EVENT_METHODS.BACKGROUND);

        background.steps = this.filter(background.steps, background, FILTER_METHODS.STEP.PRE);
        for (let i = 0; i < background.steps.length; ++i) {
            this.applyToStep(background.steps[i], background, i);
        }
        background.steps = this.filter(background.steps, background, FILTER_METHODS.STEP.POST);
    }

    /**
     * Applies the process events to Step.
     *
     * @param {Step} step
     * @param {Background|Scenario|ScenarioOutline} parent
     * @param {number} i
     * @private
     */
    private applyToStep(step: Step, parent: Background | Scenario | ScenarioOutline, i: number): void {
        this.handleListEvent(parent.steps, parent, i, EVENT_METHODS.STEP);
        if (step.docString) {
            this.handleEvent(step, 'argument', EVENT_METHODS.DOC_STRING);
        } else if (step.dataTable) {
            step.dataTable.rows = this.filter(step.dataTable.rows, step.dataTable, FILTER_METHODS.ROW.PRE);
            this.handleEvent(step, 'argument', EVENT_METHODS.DATA_TABLE);
            step.dataTable.rows = this.filter(step.dataTable.rows, step.dataTable, FILTER_METHODS.ROW.POST);
        }
    }

    private applyToExamples(examples: Examples, scenarioOutline: ScenarioOutline, i: number): void {
        this.handleListEvent(scenarioOutline.examples, scenarioOutline, i, EVENT_METHODS.EXAMPLES);
        this.handleEvent(examples, 'header', EVENT_METHODS.EXAMPLE_HEADER);

        examples.tags = this.filter(examples.tags, examples, FILTER_METHODS.TAG.PRE);
        this.applyToTags(examples.tags, examples);
        examples.tags = this.filter(examples.tags, examples, FILTER_METHODS.TAG.POST);

        examples.body = this.filter(examples.body, examples, FILTER_METHODS.ROW.PRE);
        for (let i = 0; i < examples.body.length; ++i) {
            this.handleListEvent(examples.body, examples, i, EVENT_METHODS.EXAMPLE_ROW);
        }
        examples.body = this.filter(examples.body, examples, FILTER_METHODS.ROW.POST);
    }
}