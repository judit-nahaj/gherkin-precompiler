# ScenarioOutlineExpander for Gherkin precompiler

This precompiler is responsible for converting Scenario Outlines to single Scenarios as Cucumber would do and adds  the first column as a tag.

Example:
```gherkin
  @tag1
  Scenario Outline: Test language (<language>)
    Given I am on Home page <language> user
    When <language> language is choosen
    Then I should be on Home page
    And the title should be "<title>"

  @tag2
  Examples:
    | language | title |
    | EN | Welcome |
    | FR | Bienvenue |
```
It will be modified to:

```gherkin
  @tag1 @tag2 @language(EN)
  Scenario: Test language (EN)
    Given I am on Home page EN user
    When EN language is choosen
    Then I should be on Home page
    And the title should be "Welcome"

  @tag1 @tag2 @language(FR)
  Scenario: Test language (FR)
    Given I am on Home page FR user
    When FR language is choosen
    Then I should be on Home page
    And the title should be "Bienvenue"
```

## Usage

The precompiler accepts the following configuration:

| Option | type | Description |Default|
|:------:|:----:|:------------|:-----:|
|`ignoreTag`|`String`| Tag used to mark scenarios to be ignored during expanding Scenario Outlines |`@notExpand`|
