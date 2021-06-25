# ScenarioNumbering for Gherkin precompiler

The ScenarioNumbering precompiler is responsible to add an index to all scenario and scenario outlines.

## Configuration

ScenariNumbering accepts the following configuration:

| Option | Type | Description | Default |
|:------:|:----:|:------------|:--------|
| `format` | `String` | The format, how index should be added to the name of the scenario/scenairo outline. Possible tokens: <ul><li>`${name}` the original name</li><li>`${i}` the index</li></ul> | `${i}. ${name}` |