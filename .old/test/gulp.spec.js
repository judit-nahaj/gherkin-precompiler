'use strict';

const fs = require('fs');
const path = require('path');
const plugin = require(path.resolve('gulp'));
const Replacer = require(path.resolve('lib/builtIn/Replacer'));
const CONFIG = require('./data/config/replacer.json');
const File = require('vinyl');
const concatStream = require('concat-stream');

const expect = require('chai').expect;
const toLines = s => s.split(/(?:\r\n|\n)/);

describe('Gulp plugin', () => {
    it('should throw error if no precompiler passed', () => {
        expect(() => plugin()).to.throw;
    });

    describe('streamed input', () => {
        let file, check, replacer;

        beforeEach(() => {
            file = new File({
                base: 'test/data/',
                path: 'test/data/input/replacer.feature',
                contents: fs.createReadStream('test/data/input/replacer.feature') 
            });

            check = (stream, done, cb) => {
                stream.on('data', newFile => {
                    newFile.contents.pipe(concatStream({
                        encoding: 'string'
                    }, data => {
                        cb(data);
                        done();
                    }))
                });
                stream.write(file);
                stream.end();
            };
            
            replacer = new Replacer(CONFIG);
        });

        it('should not apply replacer to non-feature files', done => {
            file.path = 'test/data/input/replacer.txt';
            const stream = plugin(replacer);
            check(stream, done, data => {
                expect(toLines(data)).to.not.eql(
                    toLines(fs.readFileSync('test/data/output/replacer.feature', 'utf8'))
                );
            });
        });
        
        it('should apply replacer to feature file', done => {
            const stream = plugin(replacer);
            check(stream, done, data => {
                expect(toLines(data)).to.eql(
                    toLines(fs.readFileSync('test/data/output/replacer.feature', 'utf8'))
                );
            });
        });
    });

    describe('buffered input', () => {
        let file, check, replacer;

        beforeEach(() => {
            file = new File({
                path: 'test/data/input/replacer.feature',
                contents: fs.readFileSync('test/data/input/replacer.feature') 
            });

            check = (stream, done, cb, err) => {
                stream.on('data', newFile => {
                    cb(newFile);
                });
                stream.on('error', e => {
                    err(e);
                });
                stream.on('end', () => done());
                stream.write(file);
                stream.end();
            };

            replacer = new Replacer(CONFIG);
        });

        it('should apply replacer to feature file', done => {
            const stream = plugin(replacer);
            check(stream, done, newFile => {
                expect(
                    toLines(String(newFile.contents))
                ).to.eql(
                    toLines(fs.readFileSync('test/data/output/replacer.feature', 'utf8'))
                );
            });
        });
        
        it('should handle errors during parsing', done => {
            file.contents = new Buffer('this is not a valid feature file');
            const stream = plugin(replacer);
            check(stream, done, newFile => {
                expect(String(newFile.contents)).to.equal(String(file.contents));
            }, e =>  {
                expect(e).to.not.be.undefined;
            }); 
        });
    });
});