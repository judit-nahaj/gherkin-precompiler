# RemoveDuplicates for Gherkin precompiler

The RemoveDuplicates precompiler is responsible to have only reasonable amount of tags and/or rows in each feature file.

It can proceed the following actions:
1. Removes tags from Scenario/ScenarioOutline/Examples which exists on Feature too.
1. Removes duplicate tags from Scenario/ScearioOutline/Feature/Examples.
1. Removes duplicate rows from Examples.

## Configuration

RemoveDuplicateRows accepts the following configuration:

| Option | Type | Description | Default |
|:------:|:----:|:------------|:--------|
| `processTags` | `Boolean` | It indicates whether the 1st and 2nd option should be applied. | `true` |
| `processRows` | `Boolean` | It indicates whether the 3rd option should be applied. | `false` |
| `verbose` | `Boolean` | It indicates whether any warning or information message should be displayed. | `true` |

## Verbose mode

In case of any duplicate item the precompiler displays a message, unless verbose mode is turned off.

- If processing of an item type is turned **on**, it displayes an **INFO** message if it finds duplicate item.
- If processing of an item type if turned **off**, it displayes a **WARNING** message if it finds duplicate item, to indicate that processing would be suggested.