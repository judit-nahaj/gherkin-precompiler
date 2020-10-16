# Macro for Gherkin precompiler

This pre-processor is responsible for defining macros in feature files and then executing them.


Usage:
1. Defining a macro by creating  macro scenario. Using @macro(${macroName}) tag on the scenario defines a macro with the provided name and steps that are included.

    Note: this scenario will not be run during test execution, it is removed during pre-processing. The definition cannot contain macro execution step (see next step).

    Errors are thrown when no name or steps are included in the definition, or when defining a macro with an already existing name.

2. Executing the macro. In another scenario using step 'macro ${macroName} is executed' will replace this step with the steps in the definition of ${macroName} macro.

    Throws error when no ${macroName} is provided in the step, or when no macro is defined by name provided.

See examples for the input files and an output in the test/data folder.

## API

### `Macro.createStep(name)`

**Params**:
- `{String} name` - The name of the macro

**Returns**: `{Step}` - A macro step for the given macro.