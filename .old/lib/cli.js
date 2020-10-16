'use strict';

const { resolve, join, dirname, normalize } = require('path');
const { readFileSync, statSync, ensureDirSync } = require('fs-extra');
const glob = require('glob');
const yargs = require('yargs');
const API = require('./index');

const prepareArguments = argv => {
    if (!argv.source && !argv.base) {
        throw new Error('Either source or base option must be set!');
    }
    if (!argv.base) {
        if (glob.hasMagic(argv.source)) {
            throw new Error('Base must be set in case of source is a pattern!');
        }
        const sourceStat = statSync(argv.source);
        if (sourceStat.isDirectory()) {
            argv.base = argv.source;
        } else {
            argv.base = dirname(argv.source);
        }
    } else {
        if (glob.hasMagic(argv.base)) {
            throw new Error('Base must be a directory, not a glob pattern!');
        }
        const baseStat = statSync(argv.base);
        if (!baseStat.isDirectory()) {
            throw new Error('Base must be a directory!');
        }
    }
    if (!argv.source) {
        argv.source = join(argv.base, '**', '*.feature');
    } else if (!glob.hasMagic(argv.source) && statSync(argv.source).isDirectory()) {
        argv.source = join(argv.source, '**', '*.feature');
    }
    if (!argv.destination) {
        argv.destination = join(argv.base, 'dist');
    } else if (!statSync(argv.destination).isDirectory()) {
        throw new Error('Destination must be a directory!');
    }
    if (!Array.isArray(argv.compilers)) {
        throw new Error(`Precompilers must be set in the configuration file!\nE.g:\n${JSON.stringify({
            compilers: [{
                type: "Replacer",
                arguments: [{
                    user: "ExampleUser"
                }]
            }]
        }, null, 2)}`);
    } else {
        argv.compilers.forEach(config => {
            if (!config.type && !config.path) {
                throw new Error(`Type or path of the precompiler must be set!\n${JSON.stringify(config, null, 2)}`);
            }
            if (config.type && !API.builtIn[config.type]) {
                throw new Error(`There is no such precompiler: "${config.type}"!`);
            }
            if (config.path && !statSync(config.path).isFile()) {
                throw new Error(`Path must be a JS or JSON file: "${config.path}"!`);
            }
        });
    }
    if (argv.verbose) {
        console.log('Configuration:', JSON.stringify(argv, null, 2));
    }
    return true;
};

class CLI {
    constructor() {
        this.config = yargs(process.argv)
            .option('config', {
                type: 'string',
                alias: 'c',
                coerce: resolve,
                default: './precompiler.json',
                description: 'The path of the configuration file which contains the precompilers and their configurations.',
                normalize: true,
                config: true,
                configParser: path => require(path)
            })
            .option('source', {
                type: 'string',
                alias: 's',
                coerce: resolve,
                description: 'The pattern or path of feature files which needs to be precompiled.',
                normalize: true
            })
            .option('base', {
                type: 'string',
                alias: 'b',
                coerce: resolve,
                description: 'The base directory of feature files.',
                normalize: true
            })
            .option('destination', {
                type: 'string',
                alias: 'd',
                coerce: resolve,
                description: 'The destination directory of precompiled feature files.',
                normalize: true
            })
            .option('verbose', {
                type: 'boolean'
            })
            .check(prepareArguments)
            .help('help')
            .fail((msg, err, yargs) => {
                console.error(msg);
                console.error(yargs.help());
                if (err) throw err;
            })
            .argv;
        this.compilers = this._getCompilers();
        this.sources = this._getSources();
    }

    _getSources() {
        return glob
            .sync(this.config.source, {
                absolute: true
            })
            .map(normalize)
            .map(file => ({
                input: file,
                output: this.config.destination + file.replace(this.config.base, '')
            }));
    }

    _getCompilers() {
        return this.config.compilers
            .map(config => {
                if (config.path) {
                    return require(resolve(config.path));
                }
                return new API.builtIn[config.type](config.configuration);
            });
    }

    run() {
        this.sources.forEach(source => {
            this.config.verbose && console.log(`Processing ${source.input}`);
            const ast = API.load(source.input);
            const outputAST = API.process.apply(API, [ast].concat(this.compilers));
            ensureDirSync(dirname(source.output));
            API.save(source.output, outputAST, this.config.formatOptions);
            this.config.verbose && console.log(`Processed file written out ${source.output}`);
        });
        return this;
    }
}

module.exports.run = () => new CLI().run();