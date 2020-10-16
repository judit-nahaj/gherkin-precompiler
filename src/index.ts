'use strict';
import * as fs from "fs-extra";
import assembler from "gherkin-assembler";
import {Parser} from "gherkin";
import {Document, GherkinDocument} from 'gherkin-ast';
import {PreCompiler} from "./PreCompiler";
import {GherKing} from "./GherKing";

export class API {

    /**
     * Loads the given feature file to a GherkinDocument.
     *
     * @param {string} pathToFile Path to feature file.
     * @returns {GherkinDocument}
     */
    load = (pathToFile:string): GherkinDocument => {
        const parser = new Parser();
        const document = parser.parse(fs.readFileSync(pathToFile, 'utf8'));
        return assembler.objectToAST(document);
    };

    /**
     * Applies the given pre-compilers to the given AST.
     *
     * @param {GherkinDocument} ast
     * @param {...PreCompiler|Object} configs
     * @returns {GherkinDocument}
     */
    process = (ast:Document, ...configs:(PreCompiler | Object)[]): Document => {
        configs.forEach(config => {
            const compiler = new GherKing(config);
            ast = compiler.applyToAST(ast);
        });
        return ast;
    };

    /**
     * Saves the given AST to a file.
     *
     * @param {string} pathToFile
     * @param {GherkinDocument} ast
     * @param {Object} [options]
     */
    save = (pathToFile:string, ast:GherkinDocument, options:Object): void => {
        fs.writeFileSync(pathToFile, this.format(ast, options), 'utf8');
    };

    /**
     * Formats the given Gherkin Document to text.
     *
     * @param {GherkinDocument|Array<GherkinDocument>} document
     * @param {AssemblerConfig|Object} [options]
     * @returns {string|Array<string>}
     */
    format = assembler.format;
}
