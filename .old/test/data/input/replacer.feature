Feature: Test feature file for ${feature}
  ${description}

  Background: Opening ${feature} page
    Given the ${feature} page is opened

  Scenario Outline: Login with <user> without ${feature2}
    And username is filled with <username>
    And password is filled with <password>
    And login button is clicked
    Then the profile page of <user> should be loaded
    """
    ${feature2}
    """
    And the following menu items should be displayed
      | ${feature2} |

    Examples:
      | user  | username | ${pwd} |
      | ${u1} | user1    | pwd1   |
      | ${u2} | user2    | pwd2   |

  @${tag1}
  Scenario: Testing ${feature2}
    And username is filled with <username>
    And password is filled filth <pwd>
    And login button is clicked
    Then the profile page of <user> should be loaded
    When the ${button} is clicked
    Then the user should be logged out