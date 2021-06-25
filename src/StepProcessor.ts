import { Background, Scenario, ScenarioOutline, Step } from "gherkin-ast";
import { DataTableProcessor } from "./DataTableProcessor";
import { getDebugger } from "./debug";
import { DocStringProcessor } from "./DocStringProcessor";
import { MultiControlType, PreCompiler } from "./PreCompiler";
import { ListProcessor } from "./Processor";

const debug = getDebugger("StepProcessor");

export class StepProcessor<P extends Background | Scenario | ScenarioOutline> extends ListProcessor<Step, P> {
    private docStringProcessor: DocStringProcessor;
    private dataTableProcessor: DataTableProcessor;

    constructor(preCompiler?: Partial<PreCompiler>) {
        debug("constructor(%o)", preCompiler);
        super(preCompiler);
        this.docStringProcessor = new DocStringProcessor(preCompiler);
        this.dataTableProcessor = new DataTableProcessor(preCompiler);
    }

    protected preFilter(e: Step, p: P, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "preFilter(hasPreStep: %s, e: %s, p: %s, i: %d)",
            !!this.preCompiler.preStep, e?.constructor.name, p?.constructor.name, i
        );
        return !this.preCompiler.preStep || this.preCompiler.preStep(e, p, i);
    }
    protected postFilter(e: Step, p: P, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "postFilter(hasPostStep: %s, e: %s, p: %s, i: %d)",
            !!this.preCompiler.postStep, e?.constructor.name, p?.constructor.name, i
        );
        return !this.preCompiler.postStep || this.preCompiler.postStep(e, p, i);
    }
    protected process(e: Step, p: P, i: number): MultiControlType<Step> {
        /* istanbul ignore next */
        debug(
            "process(hasOnStep: %s, e: %s, p: %s, i: %d)", 
            !!this.preCompiler.onStep, e?.constructor.name, p?.constructor.name, i
        );
        let step: MultiControlType<Step> = e;
        if (this.preCompiler.onStep) {
            const result = this.preCompiler.onStep(e, p, i);
            if (typeof result !== "undefined") {
                step = result;
            }
        }
        if (step) {
            if (Array.isArray(step)) {
                debug("...Array: %d", step.length);
                step = step.map(this.postProcess.bind(this));
            } else {
                debug("...replace");
                step = this.postProcess(step);
            }
        }
        return step;
    }

    private postProcess(e: Step): Step {
        debug("postProcess(docString: %s, dataTable: %s)", !!e.docString, !!e.dataTable);
        if (e.docString) {
            debug("...docString")
            e.docString = this.docStringProcessor.execute(e.docString, e);
        }
        if (e.dataTable) {
            debug("...dataTable")
            e.dataTable = this.dataTableProcessor.execute(e.dataTable, e);
        }
        return e;
    }
}
