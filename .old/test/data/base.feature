@tag1 @tag2
Feature: Hello world
  As a smth
  I want to do smth
  So that I am smth

  Background:
    Given this is a given step
    And this is a given step too
    When this is a when step
    And this is a when step too
    Then it should be a then step
    And it should be a then step too

  @tag2 @tag3
  Scenario: Name of scenario
  Description of the scenario

    Given this is a given step
    And this is a given step too
    When this is a when step with data table
      | val1 |
      | val2 |
      | val3 |
    And this is a when step with data table too
      | col1 | col2 |
      | val1 | val2 |
      | val3 | val4 |
    And this is a when step with doc string
      """
      Hello world
      Hello World
      hello World
      hello world
      """
    Then it should be a then step
    And it should be a then step too

  @tag2 @tag(3)
  Scenario Outline: Name of background <key>
    Given this is a given step
    And this is a given step too
    When this is a when step <key>
    And this is a when step too
    Then it should be a then step
    And it should be a then step too

  @tagE1 @tagE2
    Examples: First examples
      | key     |
      | value1  |
      | value12 |
      | value13 |

  @tagE2
    Examples: Second examples
      | key     |
      | value2  |
      | value22 |
      | value23 |