Feature: Test for stepGroups

  Background:
    Given step
    And step
    When step
    And step
    And step
    Then step
    And step
    And step

  Scenario: Test
    Given step
    And step
    When step
    And step
    And step
    Then step
    And step
    And step

  Scenario Outline: Test (<test>)
    Given step
    And step
    When step
    And step
    And step
    Then step
    And step
    And step

    Examples:
      | test |
      | test |