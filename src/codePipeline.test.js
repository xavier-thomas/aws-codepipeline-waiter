import { continueJobLater, getPipelineState, notifyFailedJob, notifySuccessfulJob } from './codePipeline';
import { mockCodePipelineContext, mockCredentials, mockValidCodePipelineEvent } from './mocks';
import AWS from 'aws-sdk-mock';

describe('CodePipeline', () => {
	const getPipelineStateResultSpy = jest.fn();
	const putJobFailureResultSpy = jest.fn();
	const putJobSuccessResultSpy = jest.fn();

	beforeEach(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {});
		jest.spyOn(console, 'info').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	it('must notify AWS CodePipeline of an unsuccessful invocation of the handler', () => {
		AWS.mock('CodePipeline', 'putJobFailureResult', putJobFailureResultSpy);
		notifyFailedJob(mockValidCodePipelineEvent, mockCodePipelineContext, 'Error');
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
	});

	it('must notify AWS CodePipeline of a successful invocation of the handler', () => {
		AWS.mock('CodePipeline', 'putJobSuccessResult', putJobSuccessResultSpy);
		notifySuccessfulJob(mockValidCodePipelineEvent);
		expect(putJobSuccessResultSpy).toHaveBeenCalledWith(
			{ jobId: '2989f000-275f-4031-82bf-cab460511cc4' },
			expect.anything()
		);
	});

	it('must notify AWS CodePipeline of a pending pipeline job', () => {
		AWS.mock('CodePipeline', 'putJobSuccessResult', putJobSuccessResultSpy);
		continueJobLater(mockValidCodePipelineEvent);
		expect(putJobSuccessResultSpy).toHaveBeenCalledWith(
			{
				jobId: '2989f000-275f-4031-82bf-cab460511cc4',
				continuationToken: JSON.stringify({
					previous_job_id: '2989f000-275f-4031-82bf-cab460511cc4',
				}),
			},
			expect.anything()
		);
	});

	it('must get the latest execution status of a AWS CodePipeline', () => {
		AWS.mock('CodePipeline', 'getPipelineState', getPipelineStateResultSpy);
		getPipelineState('FakeTargetPipeline', mockCredentials);
		expect(getPipelineStateResultSpy).toHaveBeenCalledWith(
			{
				name: 'FakeTargetPipeline',
			},
			expect.anything()
		);
	});
});
