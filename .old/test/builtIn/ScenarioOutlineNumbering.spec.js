'use strict';
const path = require('path');
const ScenarioOutlineNumbering = require(path.resolve('lib/builtIn/ScenarioOutlineNumbering.js'));
const expect = require('chai').expect;
const API = require(path.resolve('lib'));

describe('builtIn.ScenarioOutlineNumbering', () => {
    it('should be available through API', () => {
        expect(API.builtIn.ScenarioOutlineNumbering).to.equal(ScenarioOutlineNumbering);
    });

    it('should add order of example row', () => {
        const baseAst = API.load('test/data/input/scenarioOutlineNumbering.feature');
        const expectedAst = API.load('test/data/output/scenarioOutlineNumbering.1.feature');
        const resultAst = API.process(baseAst, new ScenarioOutlineNumbering({
            addNumbering: true,
            addParameters: false
        }));

        expect(resultAst).to.eql(expectedAst);
    });
    
    it('should add variables of example table', () => {
        const baseAst = API.load('test/data/input/scenarioOutlineNumbering.feature');
        const expectedAst = API.load('test/data/output/scenarioOutlineNumbering.2.feature');
        const resultAst = API.process(baseAst, new ScenarioOutlineNumbering({
            addNumbering: false,
            addParameters: true
        }));

        expect(resultAst).to.eql(expectedAst);
    });
    
    it('should support custom configuration', () => {
        const baseAst = API.load('test/data/input/scenarioOutlineNumbering.feature');
        const expectedAst = API.load('test/data/output/scenarioOutlineNumbering.3.feature');
        const resultAst = API.process(baseAst, new ScenarioOutlineNumbering({
            addNumbering: true,
            numberingFormat: '${name} / ${i}',
            addParameters: true,
            parameterDelimiter: '|',
            parameterFormat: '${name} (${parameters})'
        }));

        expect(resultAst).to.eql(expectedAst);
    });
});