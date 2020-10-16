# ScenarioOutlineNumbering for Gherkin precompiler

The ScenarioOutlineNumbering precompiler is responsible to make all scenarios name, which generated from scenario outlines.

This could be achieved in two ways:

1. Adding number of example row to the name of the scenario
1. Adding all column names to the name of the scenario

## Configuration

ScenarioOutlineNumbering accepts the following configuration:

| Option | Type | Description | Default |
|:------:|:----:|:------------|:--------|
| `addNumbering` | `Boolean` | It indicates whether the 1st option should be applied. | `true` |
| `numberingFormat` | `String` | The format, how number field should be added to the name of the scenario outline. Possible tokens: <ul><li>`${name}` the original name</li><li>`${i}` the number column name</li></ul> | `${i} - ${name}` |
| `addParameters` | `Boolean` | It indicates whether the 2nd option should be applied. | `false` |
| `parameterFormat` | `String` | The format, how parameters should be added to the name of the scenario outline. Possible tokens: <ul><li>`${name}` the original name</li><li>`${parameters}` the added column names</li></ul> | `${name} - ${parameters}` |
| `parameterDelimiter` | `String` | The delimiter, which should be used to list column names. |