import { PreCompiler } from "./PreCompiler";
import { read, write, FormatOptions } from "gherkin-io";
import { Document } from "gherkin-ast";
import { DocumentProcessor } from "./DocumentProcessor";
import { getDebugger } from "./debug";

const debug = getDebugger("main");

export * from "./PreCompiler";
export * from "gherkin-ast";
export { FormatOptions } from "gherkin-io";

export const load = (pattern: string): Promise<Document[]> => {
    debug("load(pattern: %s)", pattern);
    // @ts-ignore
    return read(pattern) as Document[];
}

export const process = (ast: Document, ...preCompilers: PreCompiler[]): Document[] => {
    /* istanbul ignore next */
    debug("process(ast: %s, preCompilers: %d)", ast?.constructor.name, preCompilers.length);
    const documents = [ast];
    for (const preCompiler of preCompilers) {
        debug("...preCompiler: %s", preCompiler?.constructor.name);
        const processor = new DocumentProcessor(preCompiler);
        for (let i = 0; i < documents.length; ++i) {
            debug("......document: %d", i);
            const newDocuments = processor.execute(documents[i]);
            debug("......new documents: %d", newDocuments.length);
            documents.splice(i, 1, ...newDocuments);
            i += newDocuments.length - 1;
        }
    }
    return documents;
}

export type PathGenerator = (document: Document, i?: number) => string;
export async function save(path: string, ast: Document, options?: FormatOptions): Promise<void>;
export async function save(path: string | PathGenerator, ast: Document[], options?: FormatOptions): Promise<void>;
export async function save(path: string | PathGenerator, ast: Document | Document[], options?: FormatOptions): Promise<void> {
    /* istanbul ignore next */
    debug("save(path: %s, ast: %s, options: %o)", path, ast?.constructor.name, options);
    if (!path) {
        throw new TypeError("path parameter must be set, either as a string or a PathGenerator");
    }
    if (Array.isArray(ast)) {
        debug("...Array: %d", ast.length);
        let pathGenerator = path as PathGenerator;
        if (typeof path === "string") {
            if (!/\.feature$/.test(path)) {
                debug("......adding extension");
                path += ".feature";
            }
            pathGenerator = (_1: Document, i: number) => {
                const newPath = String(path).replace(/\.feature$/, `${i}.feature`);
                debug("pathGenerator(%d) -> %s", i, newPath);
                return newPath;
            };
        }
        for (let i = 0; i < ast.length; ++i) {
            let filePath = pathGenerator(ast[i], i);
            if (!/\.feature$/.test(filePath)) {
                debug("......adding extension");
                filePath += ".feature";
            }
            debug("...process(path: %s, i: %d)", filePath, i);
            await write(filePath, ast[i], options);
        }
    } else {
        if (typeof path === "function") {
            path = path(ast);
            debug("...path: %s", path);
        }
        if (!/\.feature$/.test(path)) {
            debug("......adding extension");
            path += ".feature";
        }
        await write(path, ast, options);
    }
}