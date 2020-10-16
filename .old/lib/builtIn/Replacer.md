# Replacer for Gherkin precompiler

This Replacer is responsible for exchanging predefined strings in the
feature files. It inserts the provided text in the place held for them.

As an input it needs the feature file to be modified, and a config
json file, which contains the words to be replaced, and the words
to replace them with. It is a regular json, where the keys are the
words need replacing, and their values are the words they will get
replaced by.
In case the config file is not available, or its format is incorrect
the Replacer throws an error.

It replaces strings given in a format '${to_replace}' in the input
feature.
It can find and replace such strings in the following parts of a
feature file:

* Feature: name, description
* Background: name, description
* Scenario Outline: name, decription
* Scenario: name, description
* Step: text
* Tag: name
* Examples: name
* Document string: content
* Data table: header name, cell values

See examples for the input files and an output in the test/data folder.