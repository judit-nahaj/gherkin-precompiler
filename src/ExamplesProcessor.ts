import { Examples, ScenarioOutline } from "gherkin-ast";
import { MultiControlType, PreCompiler } from "./PreCompiler";
import { ListProcessor } from "./Processor";
import { TableRowProcessor } from "./TableRowProcessor";
import { TagProcessor } from "./TagProcessor";
import { getDebugger } from "./debug";

const debug = getDebugger("ExamplesProcessor");

export class ExamplesProcessor extends ListProcessor<Examples, ScenarioOutline> {
    private tagsProcessor: TagProcessor<Examples>;
    private tableRowProcessor: TableRowProcessor<Examples>;

    constructor(preCompiler?: Partial<PreCompiler>) {
        debug("constructor(%o)", preCompiler);
        super(preCompiler);
        this.tagsProcessor = new TagProcessor<Examples>(preCompiler);
        this.tableRowProcessor = new TableRowProcessor<Examples>(preCompiler);
    }

    protected preFilter(e: Examples, p: ScenarioOutline, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "preFilter(hasPreExamples: %s, e: %s, p: %s, i: %d)",
            !!this.preCompiler.preExamples, e?.constructor.name, p?.constructor.name, i
        );
        return !this.preCompiler.preExamples || this.preCompiler.preExamples(e, p, i);
    }
    protected postFilter(e: Examples, p: ScenarioOutline, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "postFilter(hasPostExamples: %s, e: %s, p: %s, i: %d)",
            !!this.preCompiler.postExamples, e?.constructor.name, p?.constructor.name, i
        );
        return !this.preCompiler.postExamples || this.preCompiler.postExamples(e, p, i);
    }
    protected process(e: Examples, p: ScenarioOutline, i: number): MultiControlType<Examples> {
        /* istanbul ignore next */
        debug(
            "process(hasOnExamples: %s, e: %s, p: %s, i: %d)",
            !!this.preCompiler.onExamples, e?.constructor.name, p?.constructor.name, i
        );
        let examples: MultiControlType<Examples> = e;
        if (this.preCompiler.onExamples) {
            const result = this.preCompiler.onExamples(e, p, i);
            if (typeof result !== "undefined") {
                examples = result;
            }
        }
        if (examples) {
            if (Array.isArray(examples)) {
                debug("...Array: %d", examples.length);
                examples = examples.map(this.postProcess.bind(this));
            } else {
                debug("...replace");
                examples = this.postProcess(examples);
            }
        }
        return examples;
    }

    private postProcess(e: Examples): Examples {
        debug("postProcess(tags: %s, body: %s)", Array.isArray(e.tags), Array.isArray(e.body));
        e.tags = this.tagsProcessor.execute(e.tags, e);
        e.body = this.tableRowProcessor.execute(e.body, e);
        return e;
    }
}