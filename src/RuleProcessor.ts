import { Feature, Rule } from "gherkin-ast";
import { ElementProcessor } from "./ElementProcessor";
import { MultiControlType, PreCompiler } from "./PreCompiler";
import { ListProcessor } from "./Processor";
import { getDebugger } from "./debug";

const debug = getDebugger("RuleProcessor");

export class RuleProcessor extends ListProcessor<Rule, Feature> {
    private elementProcessor: ElementProcessor<Rule>;

    constructor(preCompiler?: Partial<PreCompiler>) {
        debug("constructor(%o)", preCompiler);
        super(preCompiler);
        this.elementProcessor = new ElementProcessor<Rule>(preCompiler);
    }

    protected preFilter(e: Rule, p: Feature, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "preFilter(hasPreRule: %s, e: %s, p: %s, i: %d)",
            !!this.preCompiler.preRule, e?.constructor.name, p?.constructor.name, i
        );
        return !this.preCompiler.preRule || this.preCompiler.preRule(e, p, i);
    }
    protected postFilter(e: Rule, p: Feature, i: number): boolean {
        /* istanbul ignore next */
        debug(
            "postFilter(hasPostRule: %s, e: %s, p: %s, i: %d)", 
            !!this.preCompiler.postRule, e?.constructor.name, p?.constructor.name, i
        );
        return !this.preCompiler.postRule || this.preCompiler.postRule(e, p, i);
    }
    protected process(e: Rule, p: Feature, i: number): MultiControlType<Rule> {
        /* istanbul ignore next */
        debug(
            "process(hasOnRule: %s, e: %s, p: %s, i: %d)", 
            !!this.preCompiler.onRule, e?.constructor.name, p?.constructor.name, i
        );
        let rule: MultiControlType<Rule> = e;
        if (this.preCompiler.onRule) {
            const result = this.preCompiler.onRule(e, p, i);
            if (typeof result !== "undefined") {
                rule = result;
            }
        }
        if (rule) {
            if (Array.isArray(rule)) {
                debug("...Array: %d", rule.length);
                rule = rule.map(this.postProcess.bind(this));
            } else {
                debug("...replace");
                rule = this.postProcess(rule);
            }
        }
        return rule;
    }

    private postProcess(e: Rule): Rule {
        debug("postProcess(elements: %s)", Array.isArray(e.elements));
        e.elements = this.elementProcessor.execute(e.elements, e);
        return e;
    }
}