Feature: Test for macro

  Background: Background
    Given step

  @macro(not_used_macro)
  Scenario: Macro not used
    Given the Index pages is opened
    When the username field is filled with the username of user_1
    And the password field is filled with the password of user_1
    And the login button is clicked

  @macro(login)
  Scenario: Macro scenario for login
    Given the Login pages is opened
    When the username field is filled with the username of user_1
    And the password field is filled with the password of user_1
    And the login button is clicked

  Scenario: Logging in
    Given macro login is executed
    Then the Home page should be loaded

  Scenario: Non macro scenario
    Given a non macro step
    Then nothing happens

  Scenario: Login 2
    Given Index page is opened
    And macro login is executed
    Then the Home page should be loaded