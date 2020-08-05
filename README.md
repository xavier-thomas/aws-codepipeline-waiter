<h1 align="center">AWS Code Pipeline Waiter λ</h1>

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=xavier-thomas_aws-codepipeline-waiter&metric=alert_status)](https://sonarcloud.io/dashboard?id=xavier-thomas_aws-codepipeline-waiter)
![Tests](https://github.com/xavier-thomas/aws-codepipeline-waiter/workflows/tests/badge.svg)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=xavier-thomas_aws-codepipeline-waiter&metric=coverage)](https://sonarcloud.io/dashboard?id=xavier-thomas_aws-codepipeline-waiter)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fxavier-thomas%2Faws-codepipeline-waiter%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/xavier-thomas/aws-codepipeline-waiter/master)
[![Dependency Status](https://david-dm.org/xavier-thomas/aws-codepipeline-waiter.svg)](https://david-dm.org/xavier-thomas/aws-codepipeline-waiter)


<h4 align="center">An AWS lambda that can be called from a deployment AWS CodePipeline to monitor and wait for a target CodePipeline in the same or another AWS account.</h4>

<p align="center">
    <a href="#overview">Overview</a> |
    <a href="#getting-started">Getting Started</a> |
    <a href="#deploying-the-lambda">Deploying the Lambda</a> |
    <a href="#permissions">Permissions</a> |
    <a href="#invoking-the-lambda">Invoking the Lambda</a> |
    <a href="#contributing">Contributing</a> |
  	<a href="#authors">Authors</a> |
  	<a href="#licence">Licence</a>
</p>

## Overview

This lambda provides a waiter for an AWS CodePipeline to wait for another AWS CodePipeline. The invoking pipeline can invoke this lambda which will then wait for a target pipeline to complete execution or fail execution. The lambda uses a [Continuation Token](https://docs.aws.amazon.com/codepipeline/latest/userguide/actions-invoke-lambda-function.html) that it returns to the Invoking CodePipeline to get around the 15 minute lambda execution duration. In essence, this acts as a built in polling mechanism within CodePipeline.

Once the waiter has been invoked from the invoking pipeline, the invoking pipeline will stay in progress and wait for the target pipeline to complete. If the target pipeline fails instead of completing successfully, then this lambda will return a failure signal to the invoking pipeline which will also then fail. This lambda can therefore be considered as a way to mirror one pipeline's state to another.

### Use Cases
* This can be useful to resolve dependencies between multiple pipelines.
  For example, a CodePipeline that needs to deploy a front-end application may want to ensure that the pipeline deploying the API has been completed successfully. Or a pipeline deploying a microservice may want to ensure that any dependencies are deployed correctly.

* AWS CodePipelines can be used to Deploy other AWS CodePipelines in a parent / child configuration. This is especially useful when you want to have individual pipelines to deploy each of your components, but you also need the ability to do a full scale deployment (into either a new environment or an existing environment) where an ochestration or parent CodePipeline can be used to co-ordinate and drive the child pipelines.

* To co-ordinate with a CodePipeline in another AWS Account to be successful before continuing with the execution. This is a common use case in some multi account AWS estates especially large enterprises.

* To get around the CodePipeline stage limitations when this lambda can be used to chain multiple CodePipelines together to run in sequence.

* If you use a Meta CodePipeline, (i.e. one that continiously deploys configuration changes to your actual CodePipeline), you may wish to use this lambda to wait for a running pipeline to finish before deploying any changes.

* Any other reason why you may want to trigger or wait for another pipeline.

## Getting Started
### Deploying the Lambda

The lambda needs to be deployed into the same account as your invoking / parent pipeline. It can be deployed through the console from [here](https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/create/app?applicationId=arn:aws:serverlessrepo:us-east-1:673103718481:applications/CodePipeline-Waiter)
or it can be deployed from Cloudformation.

In order to deploy from CloudFormation, use the following as an example for your template.

```YAML

Description: Deploys CodePipeline Waiter Lambda function from Serverless Application Repo
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31


Resources:
  CodePipelineWaiter:
    Type: AWS::Serverless::Application
    Properties:
      Location:
        ApplicationId: arn:aws:serverlessrepo:us-east-1:673103718481:applications/CodePipeline-Waiter
      SemanticVersion: 2.0.2
      # Optional Parameter to control the export name of the nested stack
      Parameters:
        ExportPrefix: !Ref AWS::StackName

```
#### Manual Deployment - Not Recommended
If you choose not to use the lambda from the Servlerless Repo, you can also manually build and deploy the lambda into your own account.
The following methods are not recommended due to the additional complexity this adds, use at your own discression.

```bash
# Build the Lambda
yarn build
```
Once built locally you can use one of several of the following methods.
* [SAM Deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)
* [SAM Package](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html) or [Cloudformation Package](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/package.html) along with manual deployment of the resulting packaged template.
* Build and deploy the lambda from an AWS CodePipeline / CodeBuild that's watching this repository
* Zip the lambda and deploy it manually.


### Permissions

In order to re-use this lambda to wait on different pipelines, and in order to adhear to the [principles of least privillege](https://aws.amazon.com/blogs/security/tag/least-privilege/), this lambda needs to assume a role which will give it permissions to trigger / monitor a target pipeline.

This role needs to be created alongside the target pipeline in the same account. It's therefore recommended to use the following template in the same Cloudfromation template that creates your target pipeline.

If you are not using Cloudformation, provision an IAM role with similar permissions and trust policies using a method of your choice.

Although not recommended, you can also provisionally reduce the security provided by this role by allowing a wider trust role and a wider resource permission.

```YAML

  # This Role is to allow the CodePipeline Waiter Lambda to assume it in order to Monitor or Trigger the target pipeline
  # This role needs to exist in the same account as the target pipeline
  PipelineWaiterRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub "example-role-for-target-pipeline-name"
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          Effect: Allow
          Principal:
            AWS:
              # Note 1: This Lambda always creates an role session with the name "PipelineWaiterLambda"
              # Note 2: The InvokingAccountID is the account ID where the Lambda resides. It can be the same account or a different account (in the case of cross account pipelines)
              - !Sub 'arn:aws:sts::${InvokingAccountID}:assumed-role/${RoleNameCreatedByThelambda}/PipelineWaiterLambda'
          Action:
            - sts:AssumeRole
      Policies:
        - PolicyName: !Sub "example-policy-for-target-pipeline-name"
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - codepipeline:ListPipelines
                Resource: '*'
              - Effect: Allow
                Action:
                  - codepipeline:GetPipelineState
                  - codepipeline:StartPipelineExecution
                Resource: !Sub 'arn:aws:codepipeline:${AWS::Region}:${AWS::AccountId}:target-pipeline-name*'

```

### Invoking the Lambda

This Lambda function can only be invoked from an AWS CodePipeline. If you are using CloudFormation use the following stage in your template to invoke the lambda.

If you are not using Cloudformation, provision a CodePipeline stage to invoke the lambda with similar UserParameters using a method of your choice.

```YAML

  ReleasePipeline:
    Type: AWS::CodePipeline::Pipeline
    Properties:
      Name: "example-invoking-pipeline"
      ...
      ...
      ...
      Stages:
        - Name: Source
          Actions:
            - Name: Package-Source
              ActionTypeId:
                Category: Source
                Owner: ThirdParty
                Version: 1
                Provider: GitHub
              OutputArtifacts:
                - Name: SourceOutput
              Configuration:
                Owner: ...
                Repo: ...
                Branch: ...
                OAuthToken: ...

        - Name: Deploy
            - Name: PipelineWaiter
              ActionTypeId:
                Category: Invoke
                Owner: AWS
                Version: 1
                Provider: Lambda
              Configuration:
                # The following ExportPrefix is the same as the one above when deploying the lambda.
                # Defaults to ""
                FunctionName:
                  Fn::ImportValue: !Sub ${ExportPrefix}PipelineWaiterLambdaName
                #The Targetname and AssumeRolearn can be in the same account or in another account.
                #If they are in another account, they need the correct trust permissions. See above section in readme.
                UserParameters: |
                  {
                  "targetname":"target-pipeline-name", #Required
                  "assumerolearn":"arn:aws:iam::123456789:role/example-role-for-target-pipeline-name", #Required
                  "trigger": true #Optional. Defaults to false
                  }
              RunOrder: 1

```

#### Inputs
The Lambda needs to receive the following as an **UserParameters** object on the AWS CodePipeline invocation event.

The lambda expects the following UserParameters to be supplied during invocation:
```JSON
{
    "targetname": "target-pipeline-name",
    "assumerolearn": "arn:aws:iam::${TargetAccountID}:role/example-role-for-target-pipeline-name",
    "trigger": true / false
}
```

* The Target Pipeline's name
* The Role that provides permissions to monitor / trigger the pipeline. This can either be in the same account or in a different account.
* An optional boolean flag when set to true will attempt to start the pipeline before waiting for it. Defaults to false.


### How it works


Invoking the lambda from a pipeline will:
* Assume the cross account role
* Generate secure temporary credentials using that role.
* If trigger option is enabled, then start the target pipeline with a new execution.
* Find the status of the target pipeline.
* Send a [Continuation Token](https://docs.aws.amazon.com/codepipeline/latest/userguide/actions-invoke-lambda-function.html) to the invoking pipeline if the target pipeline is still in progress. Which will cause the invoking pipeline to poll the lambda periodically until the target pipeline succeeds.
* Send a failure / success signal to the invoking pipeline if the target pipeline has failed or succeeded.


## Contributing
### Prerequisites
To clone and contribute to this application, you'll need Git, Node.js and [Yarn](https://yarnpkg.com/) installed. You can also use an alternative package manager, such as NPM if you prefer!

### Installing
From your favourite command line tool, run the following:
```bash
# Clone the repo
git clone git@github.com:xavier-thomas/aws-codepipeline-waiter.git

## or if you use HTTPS instead of SSH
git clone https://github.com/xavier-thomas/aws-codepipeline-waiter.git

# Install dependencies
yarn
```

### Running tests
From your favourite command line tool, run the following:
```bash
# Run the unit tests
yarn test
```

### Running Mutation Tests
This project uses [Stryker](https://stryker-mutator.io/) for mutation testing.
From your favourite command line tool, run the following:
```bash
# Mutate and test the unit tests
yarn mutate
```

### Linting & code formatting
From your favourite command line tool, run the following:
```bash
# Run the linter
yarn lint
```

### Raising Issues
We welcome anyone to contribute to this project.
Before raising a PR, reach out to us by [raising an issue](https://github.com/xavier-thomas/aws-codepipeline-waiter/issues) or by emailing the author.
There is a helpful issue template that can be used as a guideline to report issues or suggest new features.

### Raising PRs

Once you are satisfied with your work, you can raise a [Pull Request](https://github.com/xavier-thomas/aws-codepipeline-waiter/pulls).
The project's maintainers will need to approve this before it can be merged in and atleast 1 approving review is needed before your work can be merged in.

`Note`: Pre-Commit hooks are in place to perform audit, lint fix and run tests before you can commit. To ensure that unverified changes are not merged into master, when a new PR is raised on GitHub, the github actions workflow automatically runs the unit tests, mutation tests, [Sonar](https://sonarcloud.io/) and [cfn-lint](https://github.com/aws-cloudformation/cfn-python-lint) to validate the PR. Without successful checks, your pull request will be blocked from being merged as a safeguard.


## Authors
**[Xavier Thomas](https://github.com/xavier-thomas)**

## Licence
**[3-Clause BSD](./LICENCE)**
