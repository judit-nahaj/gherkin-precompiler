import {
    Background,
    DataTable,
    DocString,
    Examples,
    Feature,
    Rule,
    Scenario,
    ScenarioOutline,
    Step,
    TableRow,
    Tag
} from 'gherkin-ast';
//javadoc
export type SingleControlType<T> = null | undefined | T;
export type MultiControlType<T> = null | undefined | T | T[];

export interface PreCompiler {
    onFeature(feature: Feature): SingleControlType<Feature>;
    onRule(rule: Rule, parent?: Feature, i?: number): MultiControlType<Rule>;
    onScenario(scenario: Scenario, parent?: Feature | Rule, i?: number): MultiControlType<Scenario>;
    onBackground(background: Background, parent?: Feature | Rule, i?: number): MultiControlType<Background>;
    onScenarioOutline(scenarioOutline: ScenarioOutline, parent?: Feature, i?: number): MultiControlType<ScenarioOutline>;
    onStep(step: Step, parent?: Scenario | ScenarioOutline | Background, i?: number): MultiControlType<Step>;
    onTag(tag: Tag, parent?: Feature | Scenario | ScenarioOutline | Examples, i?: number): MultiControlType<Tag>;
    onDocString(docString: DocString, parent?: Step): SingleControlType<DocString>;
    onDataTable(dataTable: DataTable, parent?: Step): SingleControlType<DataTable>;
    onExamples(examples: Examples, parent?: ScenarioOutline, i?: number): MultiControlType<Examples>;
    onExampleHeader(header: TableRow, parent?: Examples): SingleControlType<TableRow>;
    onExampleRow(row: TableRow, parent?: Examples, i?: number): MultiControlType<TableRow>;
    preFilterRule(rule: Rule, parent?: Feature, i?: number): boolean;
    postFilterRule(rule: Rule, parent?: Feature, i?: number): boolean;
    preFilterScenario(scenario: Scenario | ScenarioOutline, parent?: Feature | Rule, i?: number): boolean;
    postFilterScenario(scenario: Scenario | ScenarioOutline, parent?: Feature | Rule, i?: number): boolean;
    preFilterTag(tag: Tag, parent?: Feature | Scenario | ScenarioOutline | Examples, i?: number): boolean;
    postFilterTag(tag: Tag, parent?: Feature | Scenario | ScenarioOutline | Examples, i?: number): boolean;
    preFilterStep(step: Step, parent?: Background | Scenario | ScenarioOutline, i?: number): boolean;
    postFilterStep(step: Step, parent?: Background | Scenario | ScenarioOutline, i?: number): boolean;
    preFilterRow(row: TableRow, parent?: DataTable | Examples, i?: number): boolean;
    postFilterRow(row: TableRow, parent?: DataTable | Examples, i?: number): boolean;
    preFilterExamples(examples: Examples, parent?: ScenarioOutline, i?: number): boolean;
    postFilterExamples(examples: Examples, parent?: ScenarioOutline, i?: number): boolean;
}