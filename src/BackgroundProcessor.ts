import { Background, Feature, Rule } from "gherkin-ast";
import { PreCompiler, SingleControlType } from "./PreCompiler";
import { PartialProcessor } from "./Processor";
import { StepProcessor } from "./StepProcessor";
import { getDebugger } from "./debug";

const debug = getDebugger("BackgroundProcessor");

export class BackgroundProcessor<P extends Feature | Rule> extends PartialProcessor<Background, P> {
    private stepProcessor: StepProcessor<Background>;

    constructor(preCompiler?: Partial<PreCompiler>) {
        debug("constructor(%o)", preCompiler);
        super(preCompiler);
        this.stepProcessor = new StepProcessor(preCompiler);
    }

    public preFilter(e: Background, p: P): boolean {
        /* istanbul ignore next */
        debug(
            "preFilter(hasPreBackground: %s, e: %s, p: %s)",
            !!this.preCompiler.preBackground, e?.constructor.name, p?.constructor.name
        );
        return !this.preCompiler.preBackground || this.preCompiler.preBackground(e, p);
    }
    public postFilter(e: Background, p: P): boolean {
        /* istanbul ignore next */
        debug(
            "postFilter(hasPostBackground: %s, e: %s, p: %s)", 
            !!this.preCompiler.postBackground, e?.constructor.name, p?.constructor.name
        );
        return !this.preCompiler.postBackground || this.preCompiler.postBackground(e, p);
    }
    public process(e: Background, p: P): SingleControlType<Background> {
        /* istanbul ignore next */
        debug(
            "process(hasOnBackground: %s, e: %s, p: %s)", 
            !!this.preCompiler.onBackground, e?.constructor.name, p?.constructor.name
        );
        let background: SingleControlType<Background> = e;
        if (this.preCompiler.onBackground) {
            const result = this.preCompiler.onBackground(e, p);
            if (typeof result !== "undefined") {
                background = result;
            }
        }
        if (background) {
            debug("...step %s", Array.isArray(background.steps));
            background.steps = this.stepProcessor.execute(background.steps, background);
        }
        return background;
    }
}