import { MultiControlType, PreCompiler, SingleControlType } from "./PreCompiler";
import { getDebugger } from "./debug";

const processorDebug = getDebugger("Processor")
const listProcessorDebug = getDebugger("ListProcessor");

export abstract class ProcessorBase {
    protected preCompiler: Partial<PreCompiler>;

    constructor(preCompiler?: Partial<PreCompiler>) {
        this.preCompiler = preCompiler || {};
    }
}

export abstract class PartialProcessor<T, P, R = T | null> extends ProcessorBase {
    /* eslint-disable no-unused-vars */
    protected abstract preFilter(e: T, p: P): boolean;
    protected abstract postFilter(e: T, p: P): boolean;
    protected abstract process(e: T, p: P): SingleControlType<R>;
}

export abstract class Processor<T, P, R = T | null> extends PartialProcessor<T, P, R> {
    public execute(e: T, p: P): R {
        /* istanbul ignore next */
        processorDebug("execute(e: %s, p: %s)", e?.constructor.name, p?.constructor.name);
        if (!e) {
            processorDebug("...!e");
            return null;
        }
        const preFilterResult = this.preFilter(e, p);
        if (!preFilterResult) {
            processorDebug("...!preFilterResult");
            return null;
        }
        let result = this.process(e, p);
        if (result === null) {
            processorDebug("...!result");
            return null;
        }
        if(Array.isArray(result)){
            processorDebug("...!array");
            // @ts-ignore
            result = result.filter(r => this.postFilter(r as T, p));
            // @ts-ignore
            if (!result.length) {
                processorDebug("...!postFilterResult");
                return null;
            }
        } else {
            const postFilterResult = this.postFilter((result || e) as T, p);
            if (!postFilterResult) {
                processorDebug("...!postFilterResult");
                return null;
            }
        }
        processorDebug("...result: %o", result || e);
        return (result || e) as R;
    }
}

export abstract class PartialListProcessor<T, P> extends ProcessorBase {
    /* eslint-disable no-unused-vars */
    protected abstract preFilter(e: T, p: P, i: number): boolean;
    protected abstract postFilter(e: T, p: P, i: number): boolean;
    protected abstract process(e: T, p: P, i: number): MultiControlType<T>;
}

export abstract class ListProcessor<T, P> extends PartialListProcessor<T, P> {
    public execute(items: T[], p: P): T[] {
        /* istanbul ignore next */
        listProcessorDebug("execute(e: %s, p: %s)", items?.constructor.name, p?.constructor.name);
        if (!Array.isArray(items) || !items.length) {
            listProcessorDebug("...!Array");
            return [];
        }
        const preFiltered = items.filter((e: T, i: number) => this.preFilter(e, p, i));
        listProcessorDebug("...preFilter: %d -> %d", items.length, preFiltered.length);
        for (let i = 0; i < preFiltered.length; ++i) {
            listProcessorDebug("...processing #%d", i);
            const result = this.process(preFiltered[i], p, i);
            if (result === null) {
                listProcessorDebug("......!result");
                preFiltered.splice(i, 1);
                i--;
            } else if (Array.isArray(result)) {
                listProcessorDebug("......Array: %d", result.length);
                preFiltered.splice(i, 1, ...result);
                i += result.length-1;
            } else if (result) {
                listProcessorDebug("......replace: %o", result);
                preFiltered[i] = result;
            } else {
                listProcessorDebug("......noop");
            }
        }
        const postFiltered = preFiltered.filter((e: T, i: number) => this.postFilter(e, p, i));
        listProcessorDebug("...postFilter: %d -> %d", preFiltered.length, postFiltered.length);
        return postFiltered;
    }
}