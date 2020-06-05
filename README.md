<h1 align="center">Pipeline->Pipeline Monitoring λ</h1>

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=xavier-thomas_aws-pipeline-monitor-lambda&metric=alert_status)](https://sonarcloud.io/dashboard?id=xavier-thomas_aws-pipeline-monitor-lambda)
[![Dependency Status](https://david-dm.org/xavier-thomas/aws-pipeline-monitor-lambda.svg)](https://david-dm.org/xavier-thomas/aws-pipeline-monitor-lambda)


<h4 align="center">An AWS lambda for a deployment pipeline to monitor a target pipeline in another account.</h4>

<p align="center">
    <a href="#overview">Overview</a> |
	<a href="#getting-started">Getting Started</a> |
	<a href="#invoking-the-lambda">Invoking the Lambda</a> |
  	<a href="#authors">Authors</a> |
  	<a href="#licence">Licence</a>
</p>

## Overview
### How it works
The incoming **UserParameters** object on the AWS CodePipeline invocation event will have the target pipeline name and the ARN of a role with permissions to monitor it.
Invoking the lambda from a pipeline will:
* Assume the cross account role
* Generate secure temporary credentials using that role.
* Find the status of the target pipeline
* Send a continuation token to the invoking pipeline if the target pipeline is still in progress. Which will cause the invoking pipeline to poll the lambda periodically until the target pipeline succeeds.
* Send a failure / success signal to the invoking pipeline if the target pipeline has failed or succeeded.

## Getting started
### Prerequisites
To clone and run this application, you'll need Git, Node.js and npm installed. You can also use an alternative package manager, such as Yarn if you prefer!

### Installing
From your favourite command line tool, run the following:
```bash
# Clone the repo
git clone https://github.com/MetOffice/pipeline-monitor-lambda.git

# Install dependencies
npm ci
```

### Running tests
From your favourite command line tool, run the following:
```bash
# Run the unit tests
npm test
```

### Linting & code formatting
From your favourite command line tool, run the following:
```bash
# Run the linter
$ npm run lint
```

## Invoking the Lambda
### Inputs
The lambda expects the following UserParameters to be supplied during invocation:
```JSON
{
    "targetname": "target-pipeline-name",
    "assumerolename": "arn:aws:iam::${AccountId}:role/PipelineMonitoringRole-${Tier}"
}
```

## Authors
**[Xavier Thomas](https://github.com/xavier-thomas)**

## Licence
**[3-Clause BSD](./LICENCE)**
