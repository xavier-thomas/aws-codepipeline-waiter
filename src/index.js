const { notifyFailedJob, notifySuccessfulJob, continueJobLater, getPipelineState } = require('./codePipeline');
const { assumeRole, getCredentials } = require('./sts');

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
