import { Feature, Rule, ScenarioOutline } from "gherkin-ast";
import { ExamplesProcessor } from "./ExamplesProcessor";
import { MultiControlType, PreCompiler } from "./PreCompiler";
import { PartialListProcessor } from "./Processor";
import { StepProcessor } from "./StepProcessor";
import { TagProcessor } from "./TagProcessor";
import { getDebugger } from "./debug";

const debug = getDebugger("ScenarioOutlineProcessor");

export class ScenarioOutlineProcessor<P extends Feature | Rule> extends PartialListProcessor<ScenarioOutline, P> {
    private stepProcessor: StepProcessor<ScenarioOutline>;
    private tagProcessor: TagProcessor<ScenarioOutline>;
    private examplesProcessor: ExamplesProcessor;

    constructor(preCompiler?: Partial<PreCompiler>) {
        debug("constructor(%o)", preCompiler);
        super(preCompiler);
        this.stepProcessor = new StepProcessor<ScenarioOutline>(preCompiler);
        this.tagProcessor = new TagProcessor<ScenarioOutline>(preCompiler);
        this.examplesProcessor = new ExamplesProcessor(preCompiler);
    }

    public preFilter(e: ScenarioOutline, p: P, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "postFilter(hasPostScenarioOutline: %s, e: %s, p: %s, i: %d)", 
            !!this.preCompiler.postDataTable, e?.constructor.name, p?.constructor.name, i
        );
        return !this.preCompiler.preScenarioOutline || this.preCompiler.preScenarioOutline(e, p, i);
    }
    public postFilter(e: ScenarioOutline, p: P, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "postFilter(hasPostScenarioOutline: %s, e: %s, p: %s, i: %d)", 
            !!this.preCompiler.postScenarioOutline, e?.constructor.name, p?.constructor.name, i
        );
        return !this.preCompiler.postScenarioOutline || this.preCompiler.postScenarioOutline(e, p, i);
    }
    public process(e: ScenarioOutline, p: P, i: number): MultiControlType<ScenarioOutline> {
        /* istanbul ignore next */
        debug(
            "process(hasOnScenarioOutline: %s, e: %s, p: %s, i: %d)", 
            !!this.preCompiler.onScenarioOutline, e?.constructor.name, p?.constructor.name, i
        );
        let scenarioOutlines: MultiControlType<ScenarioOutline> = e;
        if (this.preCompiler.onScenarioOutline) {
            const result = this.preCompiler.onScenarioOutline(e, p, i);
            if (typeof result !== "undefined") {
                scenarioOutlines = result;
            }
        }
        if (scenarioOutlines) {
            if (Array.isArray(scenarioOutlines)) {
                debug("...Array: %d", scenarioOutlines.length);
                scenarioOutlines = scenarioOutlines.map(this.postProcess.bind(this));
            } else {
                debug("...replace");
                scenarioOutlines = this.postProcess(scenarioOutlines);
            }
        }
        return scenarioOutlines;
    }

    private postProcess(e: ScenarioOutline): ScenarioOutline {
        debug(
            "postProcess(tags: %s, steps: %s, examples: %s)", 
            Array.isArray(e.tags), Array.isArray(e.steps), Array.isArray(e.examples),
        );
        e.tags = this.tagProcessor.execute(e.tags, e);
        e.steps = this.stepProcessor.execute(e.steps, e);
        if (e.examples) {
            e.examples = this.examplesProcessor.execute(e.examples, e);
        }
        return e;
    }
}