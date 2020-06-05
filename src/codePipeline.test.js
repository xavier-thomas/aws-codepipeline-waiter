const AWS = require('aws-sdk-mock');
const { notifyFailedJob, notifySuccessfulJob, continueJobLater, getPipelineState } = require('./codePipeline');

const mockUserParameters = {
	assumerolename: 'arn:aws:iam::123456789012:role/FakeRole',
	targetname: 'FakePipeline',
};

const mockCodePipelineEvent = {
	'CodePipeline.job': {
		data: {
			actionConfiguration: {
				configuration: {
					UserParameters: JSON.stringify(mockUserParameters),
				},
			},
		},
		id: '2989f000-275f-4031-82bf-cab460511cc4',
	},
};

const mockCodePipelineContext = {
	invokeid: '15c14512-62df-4db4-8588-9c786c572a83',
	fail: jest.fn(),
	succeed: jest.fn(),
};

const mockCredentials = {
	accessKeyId: 'akid',
	secretAccessKey: 'secret',
	sessionToken: 'session',
};

describe('CodePipeline', () => {
	it('must notify AWS CodePipeline of an unsuccessful invocation of the handler', () => {
		const putJobFailureResultSpy = jest.fn();
		AWS.mock('CodePipeline', 'putJobFailureResult', putJobFailureResultSpy);
		notifyFailedJob(mockCodePipelineEvent, mockCodePipelineContext, 'Error');
		expect(putJobFailureResultSpy).toHaveBeenCalledWith(
			{
				failureDetails: {
					externalExecutionId: '15c14512-62df-4db4-8588-9c786c572a83',
					message: 'Error',
					type: 'JobFailed',
				},
				jobId: '2989f000-275f-4031-82bf-cab460511cc4',
			},
			expect.anything()
		);
		AWS.restore('CodePipeline');
	});

	it('must notify AWS CodePipeline of a successful invocation of the handler', () => {
		const putJobSuccessResultSpy = jest.fn();
		AWS.mock('CodePipeline', 'putJobSuccessResult', putJobSuccessResultSpy);
		notifySuccessfulJob(mockCodePipelineEvent);
		expect(putJobSuccessResultSpy).toHaveBeenCalledWith(
			{ jobId: '2989f000-275f-4031-82bf-cab460511cc4' },
			expect.anything()
		);
		AWS.restore('CodePipeline');
	});

	it('must notify AWS CodePipeline of a pending pipeline job', () => {
		const putJobSuccessResultSpy = jest.fn();
		AWS.mock('CodePipeline', 'putJobSuccessResult', putJobSuccessResultSpy);
		continueJobLater(mockCodePipelineEvent);
		expect(putJobSuccessResultSpy).toHaveBeenCalledWith(
			{
				jobId: '2989f000-275f-4031-82bf-cab460511cc4',
				continuationToken: JSON.stringify({
					previous_job_id: '2989f000-275f-4031-82bf-cab460511cc4',
				}),
			},
			expect.anything()
		);
		AWS.restore('CodePipeline');
	});

	it('must get the latest execution status of a AWS CodePipeline', () => {
		const getPipelineStateResultSpy = jest.fn();
		AWS.mock('CodePipeline', 'getPipelineState', getPipelineStateResultSpy);
		getPipelineState('FakeTargetPipeline', mockCredentials);
		expect(getPipelineStateResultSpy).toHaveBeenCalledWith(
			{
				name: 'FakeTargetPipeline',
			},
			expect.anything()
		);
		AWS.restore('CodePipeline');
	});
});
