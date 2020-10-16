'use strict';
const path = require('path');
const StepGroups = require(path.resolve('lib/builtIn/StepGroups.js'));
const expect = require('chai').expect;
const API = require(path.resolve('lib'));

describe('builtIn.StepGroups', () => {
    it('should be available through API', () => {
        expect(API.builtIn.StepGroups).to.equal(StepGroups);
    });

    it('should process feature files with default config', () => {
        const baseAst = API.load('test/data/input/stepGroups.feature');
        const expectedAst = API.load('test/data/output/stepGroups.feature');
        const resultAst = API.process(baseAst, new StepGroups());

        expect(resultAst).to.eql(expectedAst);
    });

});