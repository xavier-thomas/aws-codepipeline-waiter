import { assumeRole, getCredentials } from './sts';
import { continueJobLater, getPipelineState, notifyFailedJob, notifySuccessfulJob } from './codePipeline';

/**
 * Invokes the Pipeline Monitor and Waiter Lambda
 *
 * @param {Object} event :Code Pipeline Lambda Invoke Event
 * https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-Lambda.html#action-reference-Lambda-event
 *
 * @param {Object} context :Lambda Invoke Context
 * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 *
 * @returns {PutJobSuccessResult, PutJobFailureResult} As part of the implementation of the Lambda function, there must be a call to either the PutJobSuccessResult API or PutJobFailureResult API.
 * Otherwise, the execution of this action hangs until the action times out
 * https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-Lambda.html
 */

exports.handler = async (event, context) => {
	console.info('Event: ' + JSON.stringify(event));
	console.info('Context: ' + JSON.stringify(context));
	const userParameters = JSON.parse(event['CodePipeline.job'].data.actionConfiguration.configuration.UserParameters);

	if (userParameters) {
		try {
			const data = await assumeRole(userParameters.assumerolename);
			const credentials = await getCredentials(data);
			const pipelineStatus = await getPipelineState(userParameters.targetname, credentials);
			console.info('Pipeline Status: ' + JSON.stringify(pipelineStatus));

			let isPipelineSuccessful = true;
			for (let i = 0; i < pipelineStatus.stageStates.length; i++) {
				if (pipelineStatus.stageStates[i].latestExecution.status === 'InProgress') {
					isPipelineSuccessful = false;
					console.info('Waiting for Pipeline ' + userParameters.targetname + ' to complete.');
					await continueJobLater(event);
					break;
				} else if (pipelineStatus.stageStates[i].latestExecution.status === 'Failed') {
					isPipelineSuccessful = false;
					await notifyFailedJob(event, context, userParameters.targetname + ' has failed.');
					break;
				}
			}
			if (isPipelineSuccessful) {
				console.info('Pipeline ' + userParameters.targetname + ' Completed Successfully.');
				await notifySuccessfulJob(event);
			}
		} catch (err) {
			console.error('An error occurred while monitoring the pipeline ' + userParameters.targetname, err);
			await notifyFailedJob(event, context, 'The following error occurred: ' + JSON.stringify(err));
		}
	} else {
		await notifyFailedJob(event, context, 'Valid user parameters have not been specified.');
	}
};
