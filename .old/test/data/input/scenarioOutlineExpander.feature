Feature: ScenariosOutlineExpander
  As a TAE
  I want to expand ScenarioOutlines to Scenarios
  So that I can see final result/run them separately

  Scenario Outline: Test without tag(<language>)
  Given I am on Home page (<language>) user
  Then I should be on Home page

  Examples:
    | language | title |
    | EN | Welcome |

  @tag1 @expand
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

      @tag1 @notExpand
  Scenario Outline: Test cat (<language>)
    Given I am on Home page <language> user
    When <language> language is choosen
    Then I should be on Home page
    And the title should be "<title>"
  
  @tag2
  Examples:
    | language | title |
    | EN | Welcome |
    | FR | Bienvenue |