import AWS from 'aws-sdk';

let CodePipeline;

/**
 * Notifies AWS CodePipeline if the target pipeline has failed
 * @param {Object} event :Code Pipeline Lambda Invoke Event
 * https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-Lambda.html#action-reference-Lambda-event
 * @param {string} event.targetname - The name of the Child / Slave Pipeline to wait for
 * @param {string} event.assumerolename - The name of the monitoring role to assume. This can be a role in another AWS account for Cross Account trigger & waiter
 * @param {boolean} event.trigger - Should be Child Pipeline be started first before waiting for it.
 *
 * @param {Object} context :Lambda Invoke Context
 * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {string} message: A message to describe the failure
 * @returns {promise} :HTTPS Status 200 and empty body
 */
const notifyFailedJob = async (event, context, message) => {
	CodePipeline = new AWS.CodePipeline();
	const options = {
		jobId: event['CodePipeline.job'].id,
		failureDetails: {
			message: message,
			type: 'JobFailed',
			externalExecutionId: context.invokeid,
		},
	};
	return CodePipeline.putJobFailureResult(options).promise();
};

/**
 * Notifies AWS CodePipeline if the target pipeline has completed
 * successfully
 * @param {Object} event :Code Pipeline Lambda Invoke Event
 * https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-Lambda.html#action-reference-Lambda-event
 * @param {string} event.targetname - The name of the Child / Slave Pipeline to wait for
 * @param {string} event.assumerolename - The name of the monitoring role to assume. This can be a role in another AWS account for Cross Account trigger & waiter
 * @param {boolean} event.trigger - Should be Child Pipeline be started first before waiting for it.
 *
 * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @returns {promise} :HTTPS Status 200 and empty body
 */
const notifySuccessfulJob = async (event) => {
	CodePipeline = new AWS.CodePipeline();
	const options = {
		jobId: event['CodePipeline.job'].id,
	};
	return CodePipeline.putJobSuccessResult(options).promise();
};

/**
 * Notifies AWS CodePipeline if the target pipeline is still in progresss
 * @param {Object} event :Code Pipeline Lambda Invoke Event
 * https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-Lambda.html#action-reference-Lambda-event
 * @param {string} event.targetname - The name of the Child / Slave Pipeline to wait for
 * @param {string} event.assumerolename - The name of the monitoring role to assume. This can be a role in another AWS account for Cross Account trigger & waiter
 * @param {boolean} event.trigger - Should be Child Pipeline be started first before waiting for it.
 *
 * @returns {promise} :HTTPS Status 200 and empty body
 */
const continueJobLater = async (event) => {
	CodePipeline = new AWS.CodePipeline();
	const options = {
		jobId: event['CodePipeline.job'].id,
		continuationToken: JSON.stringify({ previous_job_id: event['CodePipeline.job'].id }),
	};
	return CodePipeline.putJobSuccessResult(options).promise();
};

/**
 * Get the execution status of the latest run of a given AWS CodePipeline
 * @param {string} targetName: The name of the target AWS CodePipeline
 * @param {object} credentials: The AWS Credentials object with the correct cross account permisions
 * @returns {object} pipelineState: Returns the Pipeline State
 */
const getPipelineState = async (targetName, credentials) => {
	CodePipeline = new AWS.CodePipeline({ credentials: credentials });
	const options = {
		name: targetName,
	};
	return CodePipeline.getPipelineState(options).promise();
};

/**
 * Start an execution of a given AWS CodePipeline
 * @param {string} targetName: The name of the target AWS CodePipeline
 * @param {object} credentials: The AWS Credentials object with the correct cross account permissions
 */
const triggerPipelineRelease = async (targetName, credentials) => {
	CodePipeline = new AWS.CodePipeline({ credentials: credentials });
	const options = {
		name: targetName,
	};
	return CodePipeline.startPipelineExecution(options).promise();
};

module.exports.notifyFailedJob = notifyFailedJob;
module.exports.notifySuccessfulJob = notifySuccessfulJob;
module.exports.continueJobLater = continueJobLater;
module.exports.getPipelineState = getPipelineState;
module.exports.triggerPipelineRelease = triggerPipelineRelease;
