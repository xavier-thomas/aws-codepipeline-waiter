# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).


# <<<----- ADD NEW VERSIONS HERE

## 2.1.3 - (April 22, 2021)
### Changed
- Update Dependencies

## 2.1.2 - (April 21, 2021)
### Changed
- Update Dependencies

## 2.1.1 - (October 27, 2020)
### Changed
- Update Dependencies

## 2.1.0 - (August 06, 2020)
### Changed
- Added feature to return failed pipeline state when a target pipeline was stopped manually.
- Fixed a bug that caused a pipeline to be triggered more than once.
- Fixed a edge case that could return a successful state for an in-progress pipeline

## 2.0.4 - (August 06, 2020)
### Changed
- Fixed Lambda function name

## 2.0.3 - (August 06, 2020)
### Changed
- corrected Lambda handler reference
- Added CF Stack Export for LambdaRole

## 2.0.2 - (August 05, 2020)
### Changed
- Added Tags for pipeline waiter SAR app
- Updated packages

## 2.0.1 - (August 05, 2020)
### Changed
- Updated Documentation linting.

## 2.0.0 - (August 05, 2020)
### Added
- Conditional Ability to Trigger a child pipeline before waiting for it.
### Changed
- Updated Documentation.

## 1.2.2 - (August 04, 2020)
### Changed
- Fixed licence information.

## 1.2.1 - (August 04, 2020)
### Changed
- Fixed a bug with the publish buildspec.

## 1.2.0 - (August 04, 2020)
### Added
- Auto-Publish to AWS Serverless Application Repo.

## 1.1.2 - (July 22, 2020)
### Changed
- Fixed coverage report for SonarCloud.

## 1.1.1 - (July 21, 2020)
### Changed
- Added auto tagging workflow.
- Updated PR template.

## 1.1.0 - (July 05, 2020)
### Added
- Enabled Mutation Tests with Stryker.
    - Added Mutation Testing Score Badge to README.
- Enabled Jest-Junit to export test reports.
### Changed
- Updated Jest Unit Tests.
- Updated Packages.

## 🚀 1.0.0 - (Aug 15, 2018)
### Initial
- Pipeline Monitor lambda released under closed source.
