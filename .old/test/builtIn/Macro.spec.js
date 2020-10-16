'use strict';
const path = require('path');
const Macro = require(path.resolve('lib/builtIn/Macro.js'));
const expect = require('chai').expect;
const API = require(path.resolve('lib'));
const {Scenario, Tag, Step} = require('gherkin-ast/index');


describe('builtIn.Macro', () => {
    let macro;
    beforeEach(() => {
        macro = new Macro();
    });

    it('should be available through API', () => {
        expect(API.builtIn.Macro).to.equal(Macro);
    });

    it('should store macros', () => {
        expect(macro.macros).to.eql({});
    });

    it('should not filter out non macro scenarios', () => {
        const scenario = new Scenario();
        const tag = new Tag('@notmacro');

        scenario.tags.push(tag);
        expect(macro.preFilterScenario(scenario)).to.be.undefined;
    });

    it('should throw an error when no name is provided for macro', () => {
        const scenario = new Scenario();
        const tag = new Tag('@macro()');

        scenario.tags.push(tag);
        expect(() => macro.preFilterScenario(scenario)).to.throw(Error)
    });

    it('should throw an error when a macro name is already defined', () => {
        const scenario = new Scenario();
        const scenario_2 = new Scenario();
        const tag = new Tag('@macro(testname)');
        const step = new Step('Given', 'step');

        scenario.tags.push(tag);
        scenario_2.tags.push(tag);
        scenario.steps.push(step);

        macro.macros.testname = scenario;

        expect(() => macro.preFilterScenario(scenario_2)).to.throw(Error);
    });

    it('should throw an error when a macro does not contain any steps', () => {
        const scenario = new Scenario();
        const tag = new Tag('@macro(test)');

        scenario.tags.push(tag);
        expect(() => macro.preFilterScenario(scenario)).to.throw(Error)
    });

    it('should throw an error when a macro contains a macro step', () => {
        const scenario = new Scenario();
        const tag = new Tag('@macro(test)');
        const step = new Step('And', 'macro test is executed');

        scenario.tags.push(tag);
        scenario.steps.push(step);
        expect(() => macro.preFilterScenario(scenario)).to.throw(Error)
    });

    it('should process macro scenarios', () => {
        const scenario = new Scenario();
        const tag = new Tag('@macro(test_tag)');
        const step = new Step('Given', 'random step');

        scenario.tags.push(tag);
        scenario.steps.push(step);

        macro.preFilterScenario(scenario);

        expect(macro.macros.test_tag.steps).to.be.eql(scenario.steps);
    });

    it('should not change non macro steps', () => {
        const step = new Step('Given', 'random step');
        expect(macro.onStep(step)).to.eql(undefined);
    });

    it('should throw an error when name is not provided for macro', () => {
        const step = new Step('And', 'macro is executed');
        expect(() => {
            macro.onStep(step);
        }).to.throw(Error)
    });

    it('should throw an error when there is no macro by name provided', () => {
        const step = new Step('And', 'macro test2 is executed');
        expect(() => macro.onStep(step)).to.throw(Error)
    });

    it('should process macro steps', () => {
        const scenario_macro = new Scenario();
        const tag = new Tag('@macro(test)');
        const step_macro = new Step('When', 'test step');
        const step_test = new Step('And', 'macro test is executed');

        scenario_macro.tags.push(tag);
        scenario_macro.steps.push(step_macro);

        macro.preFilterScenario(scenario_macro);
        expect(macro.onStep(step_test)).to.eql(scenario_macro.steps);
    });

    it('should process macros', () => {
        const baseAst = API.load('test/data/input/macro.feature');
        const expectedAst = API.load('test/data/output/macro.feature');
        const resultAst = API.process(baseAst, macro);

        expect(resultAst).to.eql(expectedAst);
    });

    it('should have a method to create a macro step', () => {
        const step = Macro.createStep("TestMacro");
        expect(step).to.be.instanceOf(Step);
        expect(step.toString()).to.equal("When macro TestMacro is executed");
    })

});