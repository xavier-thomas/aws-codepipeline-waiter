const { handler } = require('./index');
const codePipeline = require('./codePipeline');
const STS = require('./sts');

jest.mock('./codePipeline');
jest.mock('./sts');

const mockUserParameters = {
	assumerolename: 'arn:aws:iam::123456789012:role/FakeRole',
	targetname: 'FakePipeline'
};

const mockValidCodePipelineEvent = {
	'CodePipeline.job': {
		data: {
			actionConfiguration: {
				configuration: {
					UserParameters: JSON.stringify(mockUserParameters)
				}
			}
		}
	}
};

const mockInvalidCodePipelineEvent = {
	'CodePipeline.job': {
		data: {
			actionConfiguration: {
				configuration: {
					UserParameters: null
				}
			}
		}
	}
};

const mockLambdaContext = {
	invokeid: '9a2b02ef-28bc-81ea-48be-f2f26b9ef79b'
};

const mockAssumedRoleData = {
	ResponseMetadata: {
		RequestId: 'a817893e-9b25-11e8-90e6-6f826b9ef79a'
	},
	AssumedRoleUser: {
		Arn: 'arn:aws:sts::123456789012:assumed-role/FakeRole/PipelineMonitoringLambda',
		AssumedRoleId: 'ARO123EXAMPLE123:FakeRole'
	},
	Credentials: {
		AccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
		Expiration: '2018-08-08T17:11:07.000Z',
		SecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY',
		SessionToken:
			'AQoDYXdzEPT//////////wEXAMPLEtc764bNrC9SAPBSM22wDOk4x4HIZ8j4FZTwdQWLWsKWHGBuFqwAeMicRXmxfpSPfIeoIYRqTflfKD8YUuwthAx7mSEI/qkPpKPi/kMcGdQrmGdeehM4IC1NtBmUpp2wUE8phUZampKsburEDy0KPkyQDYwT7WZ0wq5VSXDvp75YU9HFvlRd8Tx6q6fE8YQcHNVXAkiY9q6d+xo0rKwT38xVqr7ZD0u0iPPkUL64lIZbqBAz+scqKmlzm8FDrypNC9Yjc8fPOLn9FX9KSYvKTr4rvx3iSIlTJabIQwj2ICCR/oLxBA=='
	},
	PackedPolicySize: 6
};

const mockCredentialsObject = {
	expired: false,
	expireTime: '2018-08-08T17:11:07.000Z',
	accessKeyId: 'ASIASXBQRWFASXWKV646C',
	sessionToken:
		'FQoGZXIvYXdzEMr//////////wEaDGEJJQBmW+i5TjdZXyL8AW1Uk77mRGl95xK9Jj4Y91pasfagwagasfw2WIRwrisNUy+0gvb874062Rml8iz/xKi8OmUraIS4czmHBm7WICHXWTAJaTZmMYZFO3Ha5nf0FEs1i8hzf2bbmfc6tUDK1fnsV2/jD8HNE2yGpNHyXnE8S+LHlvHZ9YmjjprY912CjP4D3/Ik8qN/i3PF6w+0GsDgBhIgPzz1qa01f00anh64MQSZiQtO43VeaVwIDyXca0tgJOin68PaquoqipSPLYmLhn9pai3dl0W3zhjzUGJ59Mq482hNHRtNvH5LTiLA9uwE0m39MhlHGd+iq/Z1KqxkQbPbDEjTl51SibrKzbBQ==',
	masterCredentials: {
		expired: false,
		expireTime: null,
		accessKeyId: 'ASIASVSNOLSJFWNOMA4PY',
		sessionToken:
			'FQoGZXIvYXdzEMr//////////wEaDML+QdwbMzuF6kB2DyLuAfzZUd1flyzt2Wa2r2qrqasfatr2asfsa70RIol8E8+LVU5+fzSiW0yZlL7x9Xel7M6k8Dj4u6Oi42f+xYMIze1lfBO4fAULbbagY+GVhGNP3Ic8mHr7yJEUVzuI8iBuJzatuwLhfGF8lEt+/FaRLX9FSkqQxVVnSB2YQ5OlVHF7zOmaIB1yvySPm2IcQGPijHSYTazJP2lYxAD1EJfdvrJNPpW/K0YiasWeRv2F5cjT/GC3ve1teszNMuBdV2eoYd8wP2IGOYw2fpTmNQVnsXuQYetO1Mon/c0Iomays2wU=',
		envPrefix: 'AWS'
	},
	params: {}
};

const mockFailedPipelineResult = {
	pipelineName: 'infrastructure-lambdas-build-deploy-pipeline',
	stageStates: [
		{
			stageName: 'Source',
			latestExecution: {
				status: 'Succeeded'
			}
		},
		{
			stageName: 'Build',
			latestExecution: {
				status: 'Failed'
			}
		},
		{
			stageName: 'Deploy',
			latestExecution: {
				status: 'Succeeded'
			}
		}
	]
};

const mockSuccessfulPipelineResult = {
	pipelineName: 'infrastructure-lambdas-build-deploy-pipeline',
	stageStates: [
		{
			stageName: 'Source',
			latestExecution: {
				status: 'Succeeded'
			}
		},
		{
			stageName: 'Build',
			latestExecution: {
				status: 'Succeeded'
			}
		},
		{
			stageName: 'Deploy',
			latestExecution: {
				status: 'Succeeded'
			}
		}
	]
};

const mockPendingPipelineresult = {
	pipelineName: 'infrastructure-lambdas-build-deploy-pipeline',
	stageStates: [
		{
			stageName: 'Source',
			latestExecution: {
				status: 'Succeeded'
			}
		},
		{
			stageName: 'Build',
			latestExecution: {
				status: 'InProgress'
			}
		},
		{
			stageName: 'Deploy'
		}
	]
};

describe('Index', () => {
	beforeEach(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {});
		jest.spyOn(console, 'info').mockImplementation(() => {});
		jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('must log the event, context and pipeline status', async () => {
		STS.assumeRole.mockResolvedValue(mockAssumedRoleData);
		STS.getCredentials.mockResolvedValue(mockCredentialsObject);
		codePipeline.getPipelineState.mockResolvedValue(mockFailedPipelineResult);
		await handler(mockValidCodePipelineEvent, mockLambdaContext);
		expect(console.info).toHaveBeenCalledWith('Event: ' + JSON.stringify(mockValidCodePipelineEvent));
		expect(console.info).toHaveBeenCalledWith('Context: ' + JSON.stringify(mockLambdaContext));
		expect(console.info).toHaveBeenCalledWith('Pipeline Status: ' + JSON.stringify(mockFailedPipelineResult));
	});

	it('must return a failure signal to the invoking pipeline when the target pipeline has failed', async () => {
		STS.assumeRole.mockResolvedValue(mockAssumedRoleData);
		STS.getCredentials.mockResolvedValue(mockCredentialsObject);
		codePipeline.getPipelineState.mockResolvedValue(mockFailedPipelineResult);
		await handler(mockValidCodePipelineEvent, mockLambdaContext);
		expect(codePipeline.continueJobLater).not.toHaveBeenCalled();
		expect(codePipeline.notifySuccessfulJob).not.toHaveBeenCalled();
		expect(codePipeline.notifyFailedJob).toHaveBeenCalledWith(
			mockValidCodePipelineEvent,
			mockLambdaContext,
			'FakePipeline has failed.'
		);
	});

	it('must return a success signal to the invoking pipeline when the target pipeline has completed successfully', async () => {
		STS.assumeRole.mockResolvedValue(mockAssumedRoleData);
		STS.getCredentials.mockResolvedValue(mockCredentialsObject);
		codePipeline.getPipelineState.mockResolvedValue(mockSuccessfulPipelineResult);
		await handler(mockValidCodePipelineEvent, null);
		expect(codePipeline.notifyFailedJob).not.toHaveBeenCalled();
		expect(codePipeline.continueJobLater).not.toHaveBeenCalled();
		expect(codePipeline.notifySuccessfulJob).toHaveBeenCalledWith(mockValidCodePipelineEvent);
		expect(console.info).toHaveBeenCalledWith('Pipeline FakePipeline Completed Successfully.');
	});

	it('must return a continuation token signal to the invoking pipeline when the target pipeline has failed', async () => {
		STS.assumeRole.mockResolvedValue(mockAssumedRoleData);
		STS.getCredentials.mockResolvedValue(mockCredentialsObject);
		codePipeline.getPipelineState.mockResolvedValue(mockPendingPipelineresult);
		await handler(mockValidCodePipelineEvent, null);
		expect(codePipeline.notifyFailedJob).not.toHaveBeenCalled();
		expect(codePipeline.notifySuccessfulJob).not.toHaveBeenCalled();
		expect(codePipeline.continueJobLater).toHaveBeenCalledWith(mockValidCodePipelineEvent);
		expect(console.info).toHaveBeenCalledWith('Waiting for Pipeline FakePipeline to complete.');
	});

	it('must return a failure signal to the invoking pipeline if there is an error during execution of the handler', async () => {
		STS.assumeRole.mockRejectedValue({
			AccessDenied:
				'User: arn:aws:sts::123456789012:assumed-role/FakeLambdaRole/PipelineMonitorLambda is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::111111111111:role/FakeRole'
		});
		await handler(mockValidCodePipelineEvent, mockLambdaContext);
		expect(console.error).toHaveBeenCalledWith('An error occurred while monitoring the pipeline FakePipeline', {
			AccessDenied:
				'User: arn:aws:sts::123456789012:assumed-role/FakeLambdaRole/PipelineMonitorLambda is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::111111111111:role/FakeRole'
		});
		expect(codePipeline.notifyFailedJob).toHaveBeenCalledWith(
			mockValidCodePipelineEvent,
			mockLambdaContext,
			'The following error occurred: {"AccessDenied":"User: arn:aws:sts::123456789012:assumed-role/FakeLambdaRole/PipelineMonitorLambda is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::111111111111:role/FakeRole"}'
		);
	});

	it('must return a failure signal to the invoking pipeline if there is an error with the parameters provided to the handler', async () => {
		await handler(mockInvalidCodePipelineEvent, mockLambdaContext);
		expect(codePipeline.notifyFailedJob).toHaveBeenCalledWith(
			mockInvalidCodePipelineEvent,
			mockLambdaContext,
			'Valid user parameters have not been specified.'
		);
	});
});
