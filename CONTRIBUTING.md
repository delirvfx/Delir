[日本語](./CONTRIBUTING-ja.md)

# Contributing guide

Delir always appreciate your contribution!

Contributions include the following:

- Bug reports
- Request new features
    - Includes new post-effect API features
- Bug fixes
- New post effect development
- etc..


### Bug report / Feature request

We accept bug reports and requests for new features 🌟  
Please feel free to set up an issue on GitHub.

### Bugfix

We accept pull requests for bug fixes 🐛  
Please send a patch on GitHub that conforms to the coding rules described below.

Review the pull request sent and merge if there is no problem.  
Determine when bug fixes are released based on their importance.

### New feature pull request

Please send a feature request issue before making a new feature pull request. Maybe we're already working on the this feature, or coming up big refactoring, so it's may not the right time to develop a new feature.

We receive the issue and discuss for the feature and triage the implementation timing. Please note that we may close the new feature pull request before sending the feature request issue.

### Development post effect

We are also accepting post-effect development 🌈  
For adding post effects, please send a pull request according to the following flow.

- Fork Delir
- Create a post effects directory in `packages/contrib-posteffect`
    - Create a directory with the same name as the `name` field in package.json
- Place the post-effect code and `package.json` under the created directory
    - Follow npm `package.json` format.
        -The name field should be unique within the Delir repository.
    - It is not necessary to write the email address in the `author` field. Instead, write a URL that you can contact, such as the Twitter account URL. Example: `delirvfx (https://twitter.com/delirvfx)`
- Create a branch and make a pull request to Delir
- Delir team members will review the code and merge if there is no problem

The merged code is maintained to the extent that `package.engines['@ delirvfx/core']` follows.  
New features and plugins that have become technically difficult to follow will be excluded from maintenance, so please send a modification pull request to the plugin if necessary.

## Coding conventions

In principle, follow the Linter settings set for the project.  
Delir enables automatic code formatting by `prettier`,` tslint`, `sass-lint` at commit time.  
Commit by `git commit --no-verify` is allowed when Linter is not available, such as when Linter does not function properly due to the new syntax.

## Disclaimer

Please note that the information here is subject to change without notice.
