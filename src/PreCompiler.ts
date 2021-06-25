/* eslint-disable no-unused-vars */
import {
    Background,
    DataTable,
    DocString,
    Document,
    Examples,
    Feature,
    Rule,
    Scenario,
    ScenarioOutline,
    Step,
    TableRow,
    Tag
} from "gherkin-ast";
export type SingleControlType<T> = void | null | undefined | T;
export type MultiControlType<T> = void | null | undefined | T | T[];
export type SingleEventHandler<T,P> = (e: T, p?: P) => SingleControlType<T>;
export type MultiEventHandler<T,P> = (e: T, p?: P, i?: number) => MultiControlType<T>;
export type FilterEventHandler<T,P> = (e: T, p?: P, i?: number) => boolean;

export interface PreCompiler {
    onFeature?: MultiEventHandler<Feature, Document>;
    onRule?: MultiEventHandler<Rule, Feature>;
    onScenario?: MultiEventHandler<Scenario, Feature | Rule>;
    onScenarioOutline?: MultiEventHandler<ScenarioOutline, Feature | Rule>;
    onBackground?: SingleEventHandler<Background, Feature | Rule>;
    onExamples?: MultiEventHandler<Examples, ScenarioOutline>;
    onStep?: MultiEventHandler<Step, ScenarioOutline | Scenario | Background>;
    onTag?: MultiEventHandler<Tag, Feature | Scenario | ScenarioOutline | Examples>;
    onDocString?: SingleEventHandler<DocString, Step>;
    onDataTable?: SingleEventHandler<DataTable, Step>;
    onTableRow?: MultiEventHandler<TableRow, DataTable | Examples>;

    preFeature?: FilterEventHandler<Feature, Document>;
    postFeature?: FilterEventHandler<Feature, Document>;
    preRule?: FilterEventHandler<Rule, Feature>;
    postRule?: FilterEventHandler<Rule, Feature>;
    preScenario?: FilterEventHandler<Scenario, Rule | Feature>;
    postScenario?: FilterEventHandler<Scenario, Rule | Feature>;
    preScenarioOutline?: FilterEventHandler<ScenarioOutline, Rule | Feature>;
    postScenarioOutline?: FilterEventHandler<ScenarioOutline, Rule | Feature>;
    preBackground?: FilterEventHandler<Background, Rule | Feature>;
    postBackground?: FilterEventHandler<Background, Rule | Feature>;
    preExamples?: FilterEventHandler<Examples, ScenarioOutline>;
    postExamples?: FilterEventHandler<Examples, ScenarioOutline>;
    preStep?: FilterEventHandler<Step, Background | Scenario | ScenarioOutline>;
    postStep?: FilterEventHandler<Step, Background | Scenario | ScenarioOutline>;
    preTag?: FilterEventHandler<Tag, Feature | Scenario | ScenarioOutline | Examples>;
    postTag?: FilterEventHandler<Tag, Feature | Scenario | ScenarioOutline | Examples>;
    preDocString?: FilterEventHandler<DocString, Step>;
    postDocString?: FilterEventHandler<DocString, Step>;
    preDataTable?: FilterEventHandler<DataTable, Step>;
    postDataTable?: FilterEventHandler<DataTable, Step>;
    preTableRow?: FilterEventHandler<TableRow, DataTable | Examples>;
    postTableRow?: FilterEventHandler<TableRow, DataTable | Examples>;
}