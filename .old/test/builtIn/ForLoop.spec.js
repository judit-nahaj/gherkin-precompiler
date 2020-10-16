'use strict';
const path = require('path');
const ForLoop = require(path.resolve('lib/builtIn/ForLoop.js'));
const expect = require('chai').expect;
const API = require(path.resolve('lib'));
const sinon = require('sinon');
const {Scenario, Tag} = require('gherkin-ast/index');


describe('builtIn.ForLoop', () => {
    describe('configuration', () => {
        it('should use default config when no configuration is provided', () => {
            const loop =  new ForLoop();
            // maxValue: 10,
            //     tagName: 'loop',
            //     format: '${name} (${i})'
            expect(loop.config).to.not.be.undefined;
            expect(loop.config.format).to.eql('${name} (${i})');
            expect(loop.config.maxValue).to.eql(10);
            expect(loop.config.tagName).to.eql('loop');
        });

        it('should use the provided configutation if available', () => {
            const loop =  new ForLoop({
                tagName: 'repeat',
                format: '${name} - ${i}',
                maxValue: 11
            });

            expect(loop.config).to.not.be.undefined;
            expect(loop.config.format).to.eql('${name} - ${i}');
            expect(loop.config.maxValue).to.eql(11);
            expect(loop.config.tagName).to.eql('repeat');
        });

        it('should set regex based on the provided value', () => {
            const loop =  new ForLoop({
                tagName: 'repeat',
            });

            expect(loop._looptag).to.eql(/^@repeat\((\d+)\)/);
        });
    });

    describe('getIterationNumber', () => {
        it('should return 0 when there is no loop tag', () => {
            const loop = new ForLoop();
            const scenario = new Scenario('Scenario', 'Scenario name');

            expect(loop.getIterationNumber(scenario)).to.eql(0);
        });

        it('should throw an error when provided iterator exceeds maximum', () => {
            const loop = new ForLoop();
            const scenario = new Scenario('Scenario', 'Scenario name');
            const tag = new Tag('@loop(42)');
            scenario.tags.push(tag);

            expect(() => loop.getIterationNumber(scenario)).to.throw(Error);
        });

        it('should return the correct iterator', () => {
            const loop = new ForLoop();
            const scenario = new Scenario('Scenario', 'Scenario name');
            const tag = new Tag('@loop(4)');
            scenario.tags.push(tag);

            expect(loop.getIterationNumber(scenario)).to.eql(4);
        });
    });

    describe('looper', () => {
        it('should not repeat scenarios without loop tag', () => {
            const loop = new ForLoop();
            loop.getIterationNumber = sinon.stub().returns(0);

            expect(loop.looper(42)).to.be.undefined;
            expect(loop.getIterationNumber.calledWith(42)).to.be.true;
        });

        it('should repeat scenarios for the correct times', () => {
            const loop = new ForLoop();
            const scenario = new Scenario('Scenario', 'Scenario name');
            loop.getIterationNumber = sinon.stub().returns(3);
            const result = loop.looper(scenario);

            expect(result).to.have.lengthOf(3);
            expect(loop.getIterationNumber.calledWith(scenario)).to.be.true;
        });

        it('should process scenario names', () => {
            const loop = new ForLoop();
            const scenario = new Scenario('Scenario', 'Scenario name');
            loop.getIterationNumber = sinon.stub().returns(3);
            const result = loop.looper(scenario);

            result.forEach((scenario, i) => {
                expect(scenario.name).to.eql('Scenario name (' + (i + 1) + ')');
            })
        });
    });

    it('should process scenarios', () => {
        const loop = new ForLoop();
        loop.looper = sinon.spy();
        loop.onScenario(42);

        expect(loop.looper.calledWith(42)).to.be.true;
    });

    it('should process scenario outlines', () => {
        const loop = new ForLoop();
        loop.looper = sinon.spy();
        loop.onScenarioOutline(42);

        expect(loop.looper.calledWith(42)).to.be.true;
    });

    it('should filter out loop tags', () => {
        const loop = new ForLoop();
        const tag = new Tag('@loop(2)');

        expect(loop.preFilterTag(tag)).to.be.false;
    });

    it('should not filter out non loop tags', () => {
        const loop = new ForLoop();
        const tag = new Tag('@not_loop(2)');

        expect(loop.preFilterTag(tag)).to.be.true;
    });

    it('should work with feature files', () => {
        const baseAst = API.load('test/data/input/forLoop.feature');
        const expectedAst = API.load('test/data/output/forLoop.feature');
        const resultAst = API.process(baseAst, new ForLoop({
            format: '${name} - ${i}'
        }));

        expect(resultAst).to.eql(expectedAst);
    });

    it('should be available through API', () => {
        expect(API.builtIn.ForLoop).to.equal(ForLoop);
    });
});