'use strict';

const DefaultConfig = require('../DefaultConfig');
const {TableCell} =  require('gherkin-ast/index');

/**
 * @typedef {Object} ScenarioOutlineNumberConfiguration
 * @property {boolean} addParameters
 * @property {string} parameterDelimiter
 * @property {string} parameterFormat
 * @property {boolean} addNumbering
 * @property {string} numberingFormat
 */
const DEFAULT_CONFIG = {
    addParameters: false,
    parameterDelimiter: ',',
    parameterFormat: '${name} - ${parameters}',
    addNumbering: true,
    numberingFormat: '${i} - ${name}'
};

const NUMBERING_COLUMN = 'num';

/**
 * The ScenarioOutlineNumbering precompiler is responsible
 * to make all scenarios name unique,
 * which generated from scenario outlines.
 * @class
 * @extends DefaultConfig
 */
class ScenarioOutlineNumbering extends DefaultConfig {
    /**
     * @constructor
     * @param {ScenarioOutlineNumberingConfig|Object} config
     */
    constructor(config) {
        super();
        this.config = Object.assign({}, DEFAULT_CONFIG, config || {});
    }

    onScenarioOutline(scenarioOutline) {
        if (this.config.addNumbering) {
            scenarioOutline.name = this.config.numberingFormat
                .replace(/\$\{i\}/g, `<${NUMBERING_COLUMN}>`)
                .replace(/\$\{name\}/g, scenarioOutline.name);
        }
        if (this.config.addParameters) {
            let allColumns = new Set();
            scenarioOutline.examples.forEach(examples => {
                examples.header.cells.forEach(cell => {
                    allColumns.add(cell);
                });
            });
            allColumns = Array.from(allColumns)
                .map(column => `<${column}>`)
                .join(this.config.parameterDelimiter);
            scenarioOutline.name = this.config.parameterFormat
                .replace(/\$\{parameters\}/g, allColumns)
                .replace(/\$\{name\}/g, scenarioOutline.name);
        }
    }

    onExampleHeader(header, parent) {
        if (this.config.addNumbering) {
            const fieldExists = header.cells.some(cell => {
                return cell.value === NUMBERING_COLUMN;
            });
            if (fieldExists) {
                console.warn('The default numbering field already exists in Scenario Outline: ' + parent.name);
            }
            header.cells.unshift(new TableCell(NUMBERING_COLUMN));
        }
    }

    onExampleRow(row, parent, i) {
        if (this.config.addNumbering) {
            row.cells.unshift(new TableCell(String(i + 1)));
        }
    }
}

module.exports = ScenarioOutlineNumbering;