'use strict';
const path = require('path');
const Replacer = require(path.resolve('lib/builtIn/Replacer.js'));
const expect = require('chai').expect;
const CONFIG = require('../data/config/replacer.json');
const API = require(path.resolve('lib'));

describe('builtIn.Replacer', () => {
    it('should be available through API', () => {
        expect(API.builtIn.Replacer).to.equal(Replacer);
    });
    it('should replace given values', () => {
        const baseAst = API.load('test/data/input/replacer.feature');
        const expectedAst = API.load('test/data/output/replacer.feature');
        const resultAst = API.process(baseAst, new Replacer(CONFIG));

        expect(resultAst).to.eql(expectedAst);

    });
    it('should throw error if no/wrong configuration is passed', () => {
        expect(() => {
            new Replacer();
        }).to.throw(TypeError);
    })
});