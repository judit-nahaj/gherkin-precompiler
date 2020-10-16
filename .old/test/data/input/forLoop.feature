Feature: Test for loop

  @regression @loop(5)
  Scenario: Test for loop
    Given the Login pages is opened
    When theusername field is filled with the username of user_1
    And the password field is filled with the password of user_1
    And the login button is clicked
    Then the Home page should be loaded

  @regression @loop(2)
  Scenario Outline: Test for loop
    Given the Login pages is opened
    When theusername field is filled with the username of <user>
    And the password field is filled with the password of <user>
    And the login button is clicked
    Then the Home page should be

    Examples:
      | user   |
      | user_1 |
      | user_2 |