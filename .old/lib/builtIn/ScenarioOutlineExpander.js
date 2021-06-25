'use strict';

const DefaultConfig = require('../DefaultConfig');

/**
 * @typedef {Object} ScenarioOutlineExpanderConfiguration
 * @property {string} ignoreTag
 */
const DEFAULT_CONFIG = {
  ignoreTag: '@notExpand'
};
/**
 * The ScenarioOutlineExpander precompiler is responsible
 * for converting ScenarioOutlines to single Scenarios using the
 * first column of the Example table.
 */
class ScenarioOutlineExpander extends DefaultConfig {
  /**
   * @constructor
   * @param {ScenarioOutlineExpanderConfig|Object} config
   */
  constructor(config) {
    super();
    this.config = Object.assign({}, DEFAULT_CONFIG, config || {});
  }

  onScenarioOutline(outline) {
    if (!outline.tags.length || !outline.tags.some(tag => this.config.ignoreTag === tag.name)) {
      return outline.toScenario();
    }
    outline.tags = outline.tags.filter(tag => tag.name !== this.config.ignoreTag)
  }
}

module.exports = ScenarioOutlineExpander;
