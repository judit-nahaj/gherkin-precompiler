# ForLoop for Gherkin precompiler

This precompiler is responsible for repeating selected scenarios or scenario outlines.
In case of scenario outlines it copies all rows of examples, resulting iterator*rows number of scenarios when tests are run.


## Usage:

Identify scenario or scenario outline to be repeated and mark it with `${loopTag}(${i})` e.g. `@loop(4)`.

The precompiler will then repeat this scenario or scenario outline for `${i}` times, modifying its name according to the format.

Configurable variables and their default options:

| Option | Default | Description |
|:------:|:-------:|:------------|
| maxValue | 10 | Maximum value of iteration |
| tagName | `'loop'` | Tag used to mark scenarios or outlines to be repeated |
| format | `'${name} (${i})'` | Format of the scenario or outline name after repeating |

See examples for the input files and an output in the test/data folder.