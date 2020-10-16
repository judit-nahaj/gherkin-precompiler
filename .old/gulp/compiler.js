'use strict';

const {Parser} = require('gherkin');
const assembler = require('gherkin-assembler');
const compiler = require('../lib');

class BufferCompiler {
    constructor(configs, formatOptions) {
        this.configs = configs;
        this.formatOptions = formatOptions;
    }

    _compile(s) {
        const parser = new Parser();
        const ast = assembler.objectToAST(parser.parse(s));
        const processedAST = compiler.process.apply(
            compiler, [ast].concat(this.configs)
        );
        return assembler.format(processedAST, this.formatOptions);
    }

    compileBuffer(buffer) {
        return new Buffer(this._compile(String(buffer)));
    }
}
module.exports = BufferCompiler;