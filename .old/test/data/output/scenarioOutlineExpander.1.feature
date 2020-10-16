Feature: ScenariosOutlineExpander
  As a TAE
  I want to expand ScenarioOutlines to Scenarios
  So that I can see final result/run them separately

@language(EN)
  Scenario: Test without tag(EN)
  Given I am on Home page (EN) user
  Then I should be on Home page

  @tag1 @expand @tag2 @language(EN)
  Scenario: Test language (EN)
    Given I am on Home page EN user
    When EN language is choosen
    Then I should be on Home page
    And the title should be "Welcome"

  @tag1 @expand @tag2 @language(FR)
  Scenario: Test language (FR)
    Given I am on Home page FR user
    When FR language is choosen
    Then I should be on Home page
    And the title should be "Bienvenue"

  @tag1
  Scenario Outline: Test cat (<language>)
    Given I am on Home page <language> user
    When <language> language is choosen
    Then I should be on Home page
    And the title should be "<title>"
  
  @tag2
  Examples:
    | language | title     |
    | EN       | Welcome   |
    | FR       | Bienvenue |