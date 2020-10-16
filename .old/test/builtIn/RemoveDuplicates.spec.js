'use strict';

const {resolve} = require('path');
const {Tag, Examples, TableRow, TableCell} = require('gherkin-ast/index');
const RemoveDuplicates = require(resolve('lib/builtIn/RemoveDuplicates.js'));
const API = require(resolve('lib'));
const expect = require('chai').expect;
const sinon = require('sinon');

describe('builtIn.RemoveDuplicates', () => {
    it('should be available through API', () => {
        expect(API.builtIn.RemoveDuplicates).to.equal(RemoveDuplicates);
    });
    
    beforeEach(() => {
        sinon.spy(console, 'log');
        sinon.spy(console, 'warn');
    });

    afterEach(() => {
        console.log.restore();
        console.warn.restore();
    });

    describe('example rows', () => {
        it('should remove duplicate rows', () => {
            const compiler = new RemoveDuplicates({
                processRows: true
            });
            const examples = new Examples();
            const row = new TableRow();
            row.cells.push(new TableCell('hello'));
            row.cells.push(new TableCell('world'));
            examples.body.push(row);
            examples.body.push(row.clone());

            expect(examples.body).to.have.lengthOf(2);

            compiler._filterRows(examples, {}, {});

            expect(examples.body).to.have.lengthOf(1);
        });

        it('should not remove duplicate rows if it is turned off', () => {
            const compiler = new RemoveDuplicates();
            const examples = new Examples();
            const row = new TableRow();
            row.cells.push(new TableCell('hello'));
            row.cells.push(new TableCell('world'));
            examples.body.push(row);
            examples.body.push(row.clone());

            expect(examples.body).to.have.lengthOf(2);

            compiler._filterRows(examples, {}, {});

            expect(examples.body).to.have.lengthOf(2);
        });

        describe('logging', () => {
            it('should display warning if duplicate row found, but won\'t be removed', () => {
                const compiler = new RemoveDuplicates();
                const examples = new Examples();
                const row = new TableRow();
                row.cells.push(new TableCell('hello'));
                row.cells.push(new TableCell('world'));
                examples.body.push(row);
                examples.body.push(row.clone());
                compiler._filterRows(examples, {}, {});
                
                expect(console.log.called, 'console.log called instead of console.warn').to.be.false;
                expect(console.warn.called, 'console.warn is not called').to.be.true;
            });
        
            it('should display info message if duplicate row found and will be removed', () => {
                const compiler = new RemoveDuplicates({
                    processRows: true
                });
                const examples = new Examples();
                const row = new TableRow();
                row.cells.push(new TableCell('hello'));
                row.cells.push(new TableCell('world'));
                examples.body.push(row);
                examples.body.push(row.clone());
                compiler._filterRows(examples, {}, {});

                expect(console.warn.called, 'console.warn called instead of console.log').to.be.false;
                expect(console.log.called, 'console.log is not called').to.be.true;
            });

            it('should not display anything if verbose turned off even if duplicate row found', () => {
                const compiler = new RemoveDuplicates({
                    processRows: true,
                    verbose: false
                });
                const examples = new Examples();
                const row = new TableRow();
                row.cells.push(new TableCell('hello'));
                row.cells.push(new TableCell('world'));
                examples.body.push(row);
                examples.body.push(row.clone());
                compiler._filterRows(examples, {}, {});

                expect(console.log.called, 'console.log is called').to.be.false;
                expect(console.warn.called, 'console.warn is called').to.be.false;
            })
        });
    });

    describe('tag inheritance', () => {
        it('should identify if a tag present on parent', () => {
            const compiler = new RemoveDuplicates();
            expect(compiler._hasTag({}, '@noTag'), 'identify if no tags field').to.be.false;
            expect(compiler._hasTag({tags: []}, '@noTag'), 'identify if no tags at all').to.be.false;
            expect(compiler._hasTag({tags: [new Tag('@found')]}, '@found'), 'identify if tag found').to.be.true;
            expect(compiler._hasTag({tags: [new Tag('@notFound')]}, '@noTag'), 'identify if tag not found').to.be.false;
        });
    
        it('should remove tag if presents on parent', () => {
            const compiler = new RemoveDuplicates();
            const element = {tags: [new Tag('@onFeature')]};
            const parent = {tags: [new Tag('@onFeature')]};

            compiler._filterTags(element, parent);
            expect(element.tags).to.have.length(0);
            expect(parent.tags).to.have.length(1);
        });
    
        it('should not remove unique tag if not present on parent', () => {
            const compiler = new RemoveDuplicates();
            const element = {tags: [new Tag('@onScenario')]};
            const parent = {tags: [new Tag('@onFeature')]};

            compiler._filterTags(element, parent);
            expect(element.tags).to.have.length(1);
            expect(element.tags[0].name).to.equal('@onScenario');
        });

        describe('logging', () => {
            it('should display warning if tag found on parent, but won\'t be removed', () => {
                const compiler = new RemoveDuplicates({
                    processTags: false
                });
                const element = {tags: [new Tag('@onFeature')]};
                const parent = {tags: [new Tag('@onFeature')]};

                compiler._filterTags(element, parent);
                expect(console.log.called, 'console.log called instead of console.warn').to.be.false;
                expect(console.warn.called, 'console.warn is not called').to.be.true;
            });
        
            it('should display info message if tag found on parent and will be removed', () => {
                const compiler = new RemoveDuplicates();
                const element = {tags: [new Tag('@onFeature')]};
                const parent = {tags: [new Tag('@onFeature')]};

                compiler._filterTags(element, parent);
                expect(console.warn.called, 'console.warn called instead of console.log').to.be.false;
                expect(console.log.called, 'console.log is not called').to.be.true;
            });

            it('should not display anything if verbose turned off even if tag found on parent', () => {
                const compiler = new RemoveDuplicates({
                    processTags: false,
                    verbose: false
                });
                const element = {tags: [new Tag('@onFeature')]};
                const parent = {tags: [new Tag('@onFeature')]};

                compiler._filterTags(element, parent);
                expect(console.log.called, 'console.log is called').to.be.false;
                expect(console.warn.called, 'console.warn is called').to.be.false;
            })
        });
    });

    describe('duplicate tags', () => {
        it('should remove tag if it presents multiple times', () => {
            const compiler = new RemoveDuplicates();
            const element = {tags: [new Tag('@duplicate'), new Tag('@duplicate')]};
            const parent = {tags: []};

            compiler._filterTags(element, parent);
            expect(element.tags).to.have.length(1);
            expect(element.tags[0].name).to.equal('@duplicate');
        });
    
        it('should not remove unique tags', () => {
            const compiler = new RemoveDuplicates();
            const element = {tags: [new Tag('@duplicate'), new Tag('@notDuplicate')]};
            const parent = {tags: []};

            compiler._filterTags(element, parent);
            expect(element.tags).to.have.length(2);
            expect(element.tags[0].name).to.equal('@duplicate');
            expect(element.tags[1].name).to.equal('@notDuplicate');
        });
    
        describe('logging', () => {
            it('should display warning if tag found multiple times, but won\'t be removed', () => {
                const compiler = new RemoveDuplicates({
                    processTags: false
                });
                const element = {tags: [new Tag('@duplicate'), new Tag('@duplicate')]};
                const parent = {tags: []};

                compiler._filterTags(element, parent);
                expect(console.log.called, 'console.log called instead of console.warn').to.be.false;
                expect(console.warn.called, 'console.warn is not called').to.be.true;
            });
        
            it('should display info message if tag found multiple times and will be remove', () => {
                const compiler = new RemoveDuplicates();
                const element = {tags: [new Tag('@duplicate'), new Tag('@duplicate')]};
                const parent = {tags: []};

                compiler._filterTags(element, parent);
                expect(console.warn.called, 'console.warn called instead of console.log').to.be.false;
                expect(console.log.called, 'console.log is not called').to.be.true;
            });

            it('should not display any message if verbose mode turned off even if duplicate tag found', () => {
                const compiler = new RemoveDuplicates({
                    verbose: false
                });
                const element = {tags: [new Tag('@duplicate'), new Tag('@duplicate')]};
                const parent = {tags: []};

                compiler._filterTags(element, parent);
                expect(console.log.called, 'console.log is called').to.be.false;
                expect(console.warn.called, 'console.warn is called').to.be.false;
            })
        });
    });

    describe('combined usage of tags', () => {
        it('should remove tags either duplicated or inherited too', () => {
            const compiler = new RemoveDuplicates();

            const parent = {tags: [new Tag('@inherited')]};
            const element = {tags: [
                new Tag('@duplicate'),
                new Tag('@duplicate'),
                new Tag('@notDuplicate'),
                new Tag('@inherited')
            ]};
            
            compiler._filterTags(element, parent);
            expect(element.tags).to.have.length(2);
            expect(element.tags[0].name).to.equal('@duplicate');
            expect(element.tags[1].name).to.equal('@notDuplicate');
        });
    });

    describe('handlers', () => {
        it('should process tags in case of Feature', () => {
            const compiler = new RemoveDuplicates();
            sinon.spy(compiler, '_filterTags');

            compiler.onFeature('Feature');
            expect(compiler._filterTags.calledWith('Feature')).to.be.true;
        });

        it('should process tags in case of Scenarios', () => {
            const compiler = new RemoveDuplicates();
            sinon.spy(compiler, '_filterTags');

            compiler.onScenario('Scenario', 'Parent');
            expect(compiler._filterTags.calledWith('Scenario', 'Parent')).to.be.true;
        });

        it('should process tags in case of ScenarioOutlines', () => {
            const compiler = new RemoveDuplicates();
            sinon.spy(compiler, '_filterTags');

            compiler.onScenarioOutline('Scenario', 'Parent');
            expect(compiler._filterTags.calledWith('Scenario', 'Parent')).to.be.true;
        });

        it('should process tags of examples of ScenarioOoutlines', () => {
            const compiler = new RemoveDuplicates();
            sinon.spy(compiler, '_filterTags');

            compiler.onScenarioOutline({
                examples: ['Example1', 'Example2']
            });
            expect(compiler._filterTags.calledWith('Example1')).to.be.true;
            expect(compiler._filterTags.calledWith('Example2')).to.be.true;
        });

        it('should process example rows', () => {
            const compiler = new RemoveDuplicates();
            sinon.spy(compiler, '_filterRows');

            compiler.onScenarioOutline({
                examples: ['Example1', 'Example2']
            });
            expect(compiler._filterRows.calledWith('Example1')).to.be.true;
            expect(compiler._filterRows.calledWith('Example2')).to.be.true;
        });
    });
});