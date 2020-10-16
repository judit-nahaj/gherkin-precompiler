Feature: Test for loop

  @regression
  Scenario: Test for loop - 1
    Given the Login pages is opened
    When theusername field is filled with the username of user_1
    And the password field is filled with the password of user_1
    And the login button is clicked
    Then the Home page should be loaded

  @regression
  Scenario: Test for loop - 2
    Given the Login pages is opened
    When theusername field is filled with the username of user_1
    And the password field is filled with the password of user_1
    And the login button is clicked
    Then the Home page should be loaded

  @regression
  Scenario: Test for loop - 3
    Given the Login pages is opened
    When theusername field is filled with the username of user_1
    And the password field is filled with the password of user_1
    And the login button is clicked
    Then the Home page should be loaded

  @regression
  Scenario: Test for loop - 4
    Given the Login pages is opened
    When theusername field is filled with the username of user_1
    And the password field is filled with the password of user_1
    And the login button is clicked
    Then the Home page should be loaded

  @regression
  Scenario: Test for loop - 5
    Given the Login pages is opened
    When theusername field is filled with the username of user_1
    And the password field is filled with the password of user_1
    And the login button is clicked
    Then the Home page should be loaded

  @regression
  Scenario Outline: Test for loop - 1
    Given the Login pages is opened
    When theusername field is filled with the username of <user>
    And the password field is filled with the password of <user>
    And the login button is clicked
    Then the Home page should be

    Examples:
      | user   |
      | user_1 |
      | user_2 |

  @regression
  Scenario Outline: Test for loop - 2
    Given the Login pages is opened
    When theusername field is filled with the username of <user>
    And the password field is filled with the password of <user>
    And the login button is clicked
    Then the Home page should be

    Examples:
      | user   |
      | user_1 |
      | user_2 |