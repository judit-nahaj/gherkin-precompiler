import { getDebugger } from "./debug";
import { Background, Feature, Rule, Scenario, Element, ScenarioOutline } from "gherkin-ast";
import { BackgroundProcessor } from "./BackgroundProcessor";
import { MultiControlType, PreCompiler } from "./PreCompiler";
import { ListProcessor } from "./Processor";
import { ScenarioProcessor } from "./ScenarioProcessor";
import { ScenarioOutlineProcessor } from "./ScenarioOutlineProcessor";

const debug = getDebugger("ElementProcessor");

export class ElementProcessor<P extends Feature | Rule> extends ListProcessor<Element, P> {
    private backgroundProcessor: BackgroundProcessor<P>;
    private scenarioProcessor: ScenarioProcessor<P>;
    private scenarioOutlineProcessor: ScenarioOutlineProcessor<P>;

    constructor(preCompiler?: Partial<PreCompiler>) {
        super(preCompiler);
        this.backgroundProcessor = new BackgroundProcessor<P>(preCompiler);
        this.scenarioProcessor = new ScenarioProcessor<P>(preCompiler);
        this.scenarioOutlineProcessor = new ScenarioOutlineProcessor<P>(preCompiler);
    }

    protected preFilter(e: Element, p: P, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "preFilter(e: %s, p: %s, i: %d)", 
            e?.constructor.name, p?.constructor.name, i
        );
        if (e instanceof Background) {
            debug("preFilter -> Background");
            return this.backgroundProcessor.preFilter(e, p);
        }
        if (e instanceof Scenario) {
            debug("preFilter -> Scenario");
            return this.scenarioProcessor.preFilter(e, p, i);
        }
        /* istanbul ignore else */
        if (e instanceof ScenarioOutline) {
            debug("preFilter -> ScenarioOutline");
            return this.scenarioOutlineProcessor.preFilter(e, p, i);
        }
    }
    protected postFilter(e: Element, p: P, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "postFilter(e: %s, p: %s, i: %d)", 
            e?.constructor.name, p?.constructor.name, i
        );
        if (e instanceof Background) {
            debug("postFilter -> Background");
            return this.backgroundProcessor.preFilter(e, p);
        }
        if (e instanceof Scenario) {
            debug("postFilter -> Scenario");
            return this.scenarioProcessor.postFilter(e, p, i);
        }
        /* istanbul ignore else */
        if (e instanceof ScenarioOutline) {
            debug("postFilter -> ScenarioOutline");
            return this.scenarioOutlineProcessor.postFilter(e, p, i);
        }
    }
    protected process(e: Element, p: P, i: number): MultiControlType<Element> {
        /* istanbul ignore next */
        debug(
            "process(e: %s, p: %s, i: %d)", 
            e?.constructor.name, p?.constructor.name, i
        );
        if (e instanceof Background) {
            debug("process -> Background");
            return this.backgroundProcessor.process(e, p);
        }
        if (e instanceof Scenario) {
            debug("process -> Scenario");
            return this.scenarioProcessor.process(e, p, i);
        }
        /* istanbul ignore else */
        if (e instanceof ScenarioOutline) {
            debug("process -> ScenarioOutline");
            return this.scenarioOutlineProcessor.process(e, p, i);
        }
    }
}