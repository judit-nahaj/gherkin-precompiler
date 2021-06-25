import { Examples, Feature, Scenario, ScenarioOutline, Tag } from "gherkin-ast";
import { getDebugger } from "./debug";
import { MultiControlType } from "./PreCompiler";
import { ListProcessor } from "./Processor";

const debug = getDebugger("TagProcessor");

export class TagProcessor<P extends Feature | Scenario | ScenarioOutline | Examples> extends ListProcessor<Tag, P> {
    protected preFilter(e: Tag, p: P, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "preFilter(hasPreTag: %s, e: %s, p: %s, i: %d)", 
            !!this.preCompiler.preTag, e?.constructor.name, p?.constructor.name, i
        );
        return !this.preCompiler.preTag || this.preCompiler.preTag(e, p, i);
    }
    protected postFilter(e: Tag, p: P, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "postFilter(hasPostTag: %s, e: %s, p: %s, i: %d)", 
            !!this.preCompiler.postTag, e?.constructor.name, p?.constructor.name, i
        );
        return !this.preCompiler.postTag || this.preCompiler.postTag(e, p, i);
    }
    protected process(e: Tag, p: P, i: number): MultiControlType<Tag> {
        /* istanbul ignore next */
        debug(
            "process(hasOnTag: %s, e: %s, p: %s, i: %d)", 
            !!this.preCompiler.onTag, e?.constructor.name, p?.constructor.name, i
        );
        if (this.preCompiler.onTag) {
            return this.preCompiler.onTag(e, p, i);
        }
    }
}