Feature: Test for macro

  Background: Background
    Given step

  Scenario: Logging in
    Given the Login pages is opened
    When the username field is filled with the username of user_1
    And the password field is filled with the password of user_1
    And the login button is clicked
    Then the Home page should be loaded

  Scenario: Non macro scenario
    Given a non macro step
    Then nothing happens

  Scenario: Login 2
    Given Index page is opened
    Given the Login pages is opened
    When the username field is filled with the username of user_1
    And the password field is filled with the password of user_1
    And the login button is clicked
    Then the Home page should be loaded