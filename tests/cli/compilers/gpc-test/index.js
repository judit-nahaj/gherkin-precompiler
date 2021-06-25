module.exports = class TestCompiler {
    constructor(config) {
        this.config = config;
    }
    onFeature(feature) {
        feature.name += this.config.name;
    }
}