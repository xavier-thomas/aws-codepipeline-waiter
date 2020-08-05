export const MOCK_ASSUME_ROLE_ARN = 'arn:aws:iam::123456789012:role/FakeRole';

export const MOCK_ASSUMED_ROLE_DATA = {
	ResponseMetadata: {
		RequestId: 'a817893e-9b25-11e8-90e6-6f826b9ef79a',
	},
	AssumedRoleUser: {
		Arn: 'arn:aws:sts::123456789012:assumed-role/FakeRole/PipelineMonitoringLambda',
		AssumedRoleId: 'ARO123EXAMPLE123:FakeRole',
	},
	Credentials: {
		AccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
		Expiration: '2018-08-08T17:11:07.000Z',
		SecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY',
		SessionToken:
			'AQoDYXdzEPT//////////wEXAMPLEtc764bNrC9SAPBSM22wDOk4x4HIZ8j4FZTwdQWLWsKWHGBuFqwAeMicRXmxfpSPfIeoIYRqTflfKD8YUuwthAx7mSEI/qkPpKPi/kMcGdQrmGdeehM4IC1NtBmUpp2wUE8phUZampKsburEDy0KPkyQDYwT7WZ0wq5VSXDvp75YU9HFvlRd8Tx6q6fE8YQcHNVXAkiY9q6d+xo0rKwT38xVqr7ZD0u0iPPkUL64lIZbqBAz+scqKmlzm8FDrypNC9Yjc8fPOLn9FX9KSYvKTr4rvx3iSIlTJabIQwj2ICCR/oLxBA==',
	},
	PackedPolicySize: 6,
};

export const MOCK_CREDENTIALS_OBJECT = {
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
		envPrefix: 'AWS',
	},
	params: {},
};

export const MOCK_TARGET_NAME = 'FakePipeline';

export const MOCK_USER_PARAMETERS = {
	assumerolename: MOCK_ASSUME_ROLE_ARN,
	targetname: MOCK_TARGET_NAME,
};

export const MOCK_USER_PARAMETERS_TRIGGER_TRUE = {
	assumerolename: MOCK_ASSUME_ROLE_ARN,
	targetname: MOCK_TARGET_NAME,
	trigger: true,
};

export const MOCK_USER_PARAMETERS_TRIGGER_FALSE = {
	assumerolename: MOCK_ASSUME_ROLE_ARN,
	targetname: MOCK_TARGET_NAME,
	trigger: false,
};

export const MOCK_PIPELINE_ID = '2989f000-275f-4031-82bf-cab460511cc4';

export const MOCK_INVOKE_ID = '15c14512-62df-4db4-8588-9c786c572a83';

export const MOCK_EVENT = {
	'CodePipeline.job': {
		data: {
			actionConfiguration: {
				configuration: {
					UserParameters: JSON.stringify(MOCK_USER_PARAMETERS),
				},
			},
		},
		id: MOCK_PIPELINE_ID,
	},
};

export const MOCK_EVENT_TRIGGER_TRUE = {
	'CodePipeline.job': {
		data: {
			actionConfiguration: {
				configuration: {
					UserParameters: JSON.stringify(MOCK_USER_PARAMETERS_TRIGGER_TRUE),
				},
			},
		},
		id: MOCK_PIPELINE_ID,
	},
};

export const MOCK_EVENT_TRIGGER_FALSE = {
	'CodePipeline.job': {
		data: {
			actionConfiguration: {
				configuration: {
					UserParameters: JSON.stringify(MOCK_USER_PARAMETERS_TRIGGER_FALSE),
				},
			},
		},
		id: MOCK_PIPELINE_ID,
	},
};

export const MOCK_CONTEXT = {
	invokeid: MOCK_INVOKE_ID,
};

export const MOCK_EVENT_INVALID = {
	'CodePipeline.job': {
		data: {
			actionConfiguration: {
				configuration: {
					UserParameters: null,
				},
			},
		},
	},
};

export const MOCK_SUCCESSFUL_PIPELINE_STATE = {
	pipelineName: 'FakePipeline',
	stageStates: [
		{
			stageName: 'Source',
			latestExecution: {
				status: 'Succeeded',
			},
		},
		{
			stageName: 'Build',
			latestExecution: {
				status: 'Succeeded',
			},
		},
		{
			stageName: 'Deploy',
			latestExecution: {
				status: 'Succeeded',
			},
		},
	],
};

export const MOCK_FAILED_PIPELINE_STATE = {
	pipelineName: 'FakePipeline',
	stageStates: [
		{
			stageName: 'Source',
			latestExecution: {
				status: 'Succeeded',
			},
		},
		{
			stageName: 'Build',
			latestExecution: {
				status: 'Failed',
			},
		},
		{
			stageName: 'Deploy',
			latestExecution: {
				status: 'Succeeded',
			},
		},
	],
};

export const MOCK_PENDING_PIPELINE_STATE = {
	pipelineName: 'FakePipeline',
	stageStates: [
		{
			stageName: 'Source',
			latestExecution: {
				status: 'Succeeded',
			},
		},
		{
			stageName: 'Build',
			latestExecution: {
				status: 'InProgress',
			},
		},
		{
			stageName: 'Deploy',
		},
	],
};

export const MOCK_PIPELINE_START_RESULT = {
	pipelineExecutionId: 'aapban-awdasda-bawsawd-avasadw',
};
