'use strict';
const path = require('path');
const ScenarioNumbering = require(path.resolve('lib/builtIn/ScenarioNumbering.js'));
const expect = require('chai').expect;
const API = require(path.resolve('lib'));

describe('builtIn.ScenarioNumbering', () => {
    it('should be available through API', () => {
        expect(API.builtIn.ScenarioNumbering).to.equal(ScenarioNumbering);
    });

    it('should process feature files with default config', () => {
        const baseAst = API.load('test/data/input/scenarioNumbering.feature');
        const expectedAst = API.load('test/data/output/scenarioNumbering.1.feature');
        const resultAst = API.process(baseAst, new ScenarioNumbering());

        expect(resultAst).to.eql(expectedAst);
    });

    it('should process feature files with custom config', () => {
        const baseAst = API.load('test/data/input/scenarioNumbering.feature');
        const expectedAst = API.load('test/data/output/scenarioNumbering.2.feature');
        const resultAst = API.process(baseAst, new ScenarioNumbering({
            format: '${i} - ${name}'
        }));

        expect(resultAst).to.eql(expectedAst);
    });
});