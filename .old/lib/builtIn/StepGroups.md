# StepGroups for Gherkin precompiler

The StepGroups precompiler is responsible for correcting the gherkin keywords of steps to make the tests more readable.

Example:
```gherkin
Given the page is opened
Given the settings are deleted
When the settings menu item is clicked
When the advanced settings link is clicked
Then the advanced settings should be loaded
Then the basic settings link should be visible
```
It will be modified to:

```gherkin
Given the page is opened
And the settings are deleted
When the settings menu item is clicked
And the advanced settings link is clicked
Then the advanced settings should be loaded
And the basic settings link should be visible
```

