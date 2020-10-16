'use strict';
const path = require('path');
const ScenarioOutlineExpander = require(path.resolve('lib/builtIn/ScenarioOutlineExpander.js'));
const expect = require('chai').expect;
const API = require(path.resolve('lib'));

describe('builtIn.ScenarioOutlinExpander', () => {
  it('should be available through API', () => {    
    expect(API.builtIn.ScenarioOutlineExpander).to.equal(ScenarioOutlineExpander);
  });

  it('should expand scenario outline with default config', () => {
    const baseAst = API.load('test/data/input/scenarioOutlineExpander.feature');
    const expectedAst = API.load('test/data/output/scenarioOutlineExpander.1.feature');
    const resultAst = API.process(baseAst, new ScenarioOutlineExpander());

    expect(resultAst).to.eql(expectedAst);
  });

  it('should expand scenario outline with custom config', () => {
    const baseAst = API.load('test/data/input/scenarioOutlineExpander.feature');
    const expectedAst = API.load('test/data/output/scenarioOutlineExpander.2.feature');
    const resultAst = API.process(baseAst, new ScenarioOutlineExpander({
      ignoreTag: '@expand'
    }));

    expect(resultAst).to.eql(expectedAst);
  });
});
