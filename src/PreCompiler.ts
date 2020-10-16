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
export type SingleEventHandler<T,P> = (e:T, p?:P) => SingleControlType<T>;
export type MultiEventHandler<T,P> = (e:T, p?:P, i?:number) => MultiControlType<T>;
export type FilterEventHandler<T,P> = (e:T, p?:P, i?:number) => boolean;

export interface PreCompiler {
    onFeature: SingleEventHandler<Feature, Document>;
    onRule: MultiEventHandler<Rule, Feature>;
    onScenario: MultiEventHandler<Scenario, Feature | Rule>;
    onBackground: MultiEventHandler<Background, Feature | Rule>;
    onScenarioOutline: MultiEventHandler<ScenarioOutline, Feature>;
    onStep: MultiEventHandler<Step, ScenarioOutline | Scenario | Background>;
    onTag: MultiEventHandler<Tag, Feature | Scenario | ScenarioOutline | Examples>;
    onDocString: SingleEventHandler<DocString, Step>;
    onDataTable: SingleEventHandler<DataTable, Step>;
    onExamples: MultiEventHandler<Examples, ScenarioOutline>;
    onExampleHeader: SingleEventHandler<TableRow, Examples>;
    onExampleRow: MultiEventHandler<TableRow, Examples>;
    preFilterRule: FilterEventHandler<Rule, Feature>;
    postFilterRule: FilterEventHandler<Rule, Feature>;
    preFilterScenario: FilterEventHandler<ScenarioOutline | Scenario, Rule | Feature>;
    postFilterScenario: FilterEventHandler<ScenarioOutline | Scenario, Rule | Feature>;
    preFilterTag: FilterEventHandler<Tag, Feature | Scenario | ScenarioOutline | Examples>;
    postFilterTag: FilterEventHandler<Tag, Feature | Scenario | ScenarioOutline | Examples>;
    preFilterStep: FilterEventHandler<Step, Background | Scenario | ScenarioOutline>;
    postFilterStep: FilterEventHandler<Step, Background | Scenario | ScenarioOutline>;
    preFilterRow: FilterEventHandler<TableRow, DataTable | Examples>;
    postFilterRow: FilterEventHandler<TableRow, DataTable | Examples>;
    preFilterExamples: FilterEventHandler<Examples, ScenarioOutline>;
    postFilterExamples: FilterEventHandler<Examples, ScenarioOutline>;
}