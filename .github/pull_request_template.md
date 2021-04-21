# Description

Please include a summary of the change and which issue is fixed.
Please also include relevant motivation and context.
List any dependencies that are required for this change.


## Type of change
- [ ] :bug: Bug fix (non-breaking change which fixes an issue)
- [ ] :package: Dependency Update
- [ ] :rocket: New feature (non-breaking change which adds functionality)
- [ ] :boom: Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] :closed_lock_with_key: Security fix
- [ ] :notebook: Documentation update
- [ ] :whale2: Other (if none of the other choices apply)

# How Has This Been Tested?

Please describe the tests that you ran to verify your changes.
Provide instructions so we can reproduce.
Please also list any relevant details for your test configuration

# Checklist:

#### Versioning
- [ ] `Changelog` has been updated in the root directory
- [ ] Version updated on `package.json` in the root directory
- [ ] Version updated in the `codepipeline-waiter.yaml`
- [ ] Version updated in the `README.md` file's deploying lambda block.

#### PR Etiquette
- [ ] I've added labels to my PR to describe the change.

#### Sanity
- [ ] I have performed a self-review of my own code
- [ ] I have added necessary documentation (if appropriate)
- [ ] Any dependent changes have been merged and published in downstream modules

#### Testing
- [ ] Linting passing locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] Unit testing passing locally
- [ ] Mutation testing is passing locally
- [ ] Integration tests & End to End tests are passing

#### Code Quality
- [ ] Errors and handled and Logged
- [ ] Types added to all method signatures and parameters
- [ ] I have commented on my code, particularly in hard-to-understand areas
- [ ] Sonar analysis is passing
