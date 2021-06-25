import { DocString, Step } from "gherkin-ast";
import { SingleControlType } from "./PreCompiler";
import { Processor } from "./Processor";
import { getDebugger } from "./debug";

const debug = getDebugger("DocStringProcessor");

export class DocStringProcessor extends Processor<DocString, Step> {
    protected preFilter(e: DocString, p: Step): boolean {
        /* istanbul ignore next */
        debug(
            "preFilter(hasPreDocString: %s, e: %s, p: %s)",
            !!this.preCompiler.preDocString, e?.constructor.name, p?.constructor.name
        );
        return !this.preCompiler.preDocString || this.preCompiler.preDocString(e, p);
    }
    protected postFilter(e: DocString, p: Step): boolean {
        /* istanbul ignore next */
        debug(
            "postFilter(hasPostDocString: %s, e: %s, p: %s)",
            !!this.preCompiler.postDocString, e?.constructor.name, p?.constructor.name
        );
        return !this.preCompiler.postDocString || this.preCompiler.postDocString(e, p);
    }
    protected process(e: DocString, p: Step): SingleControlType<DocString> {
        /* istanbul ignore next */
        debug(
            "process(hasOnDocString: %s, e: %s, p: %s)",
            !!this.preCompiler.onDocString, e?.constructor.name, p?.constructor.name
        );
        if (this.preCompiler.onDocString) {
            return this.preCompiler.onDocString(e, p);
        }
    }
}