jest.mock('aws-sdk');
import {
	MOCK_CONTEXT,
	MOCK_CREDENTIALS_OBJECT,
	MOCK_EVENT,
	MOCK_INVOKE_ID,
	MOCK_PIPELINE_ID,
	MOCK_PIPELINE_START_RESULT,
	MOCK_SUCCESSFUL_PIPELINE_STATE,
	MOCK_TARGET_NAME,
} from './mocks';
import {
	continueJobLater,
	getPipelineState,
	notifyFailedJob,
	notifySuccessfulJob,
	triggerPipelineRelease,
} from './codePipeline';
import AWS from 'aws-sdk';

describe('[codePipeline.js] unit tests', () => {
	const mock_getPipelineState = jest.fn();
	const mock_putJobFailureResult = jest.fn();
	const mock_putJobSuccessResult = jest.fn();
	const mock_startPipelineExecution = jest.fn();

	beforeEach(() => {
		jest.restoreAllMocks();
		AWS.CodePipeline.mockImplementation(() => ({
			getPipelineState: mock_getPipelineState,
			putJobFailureResult: mock_putJobFailureResult,
			putJobSuccessResult: mock_putJobSuccessResult,
			startPipelineExecution: mock_startPipelineExecution,
		}));
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('[notifyFailedJob] when a valid event and context are passed', () => {
		it('must notify AWS CodePipeline of a failed job', async () => {
			mock_putJobFailureResult.mockReturnValue({
				promise: jest.fn().mockResolvedValue(''),
			});
			const response = await notifyFailedJob(MOCK_EVENT, MOCK_CONTEXT, 'FakePipeline has failed.');
			expect(mock_putJobFailureResult).toHaveBeenCalledWith({
				jobId: MOCK_PIPELINE_ID,
				failureDetails: {
					message: 'FakePipeline has failed.',
					type: 'JobFailed',
					externalExecutionId: MOCK_INVOKE_ID,
				},
			});
			expect(response).toEqual('');
		});
	});

	describe('[notifySuccessfulJob] when a valid event is passed', () => {
		it('must notify AWS CodePipeline of a successful job', async () => {
			mock_putJobSuccessResult.mockReturnValue({
				promise: jest.fn().mockResolvedValue(''),
			});
			const response = await notifySuccessfulJob(MOCK_EVENT);
			expect(mock_putJobSuccessResult).toHaveBeenCalledWith({
				jobId: MOCK_PIPELINE_ID,
			});
			expect(response).toEqual('');
		});
	});

	describe('[continueJobLater] when a valid event is passed', () => {
		it('must notify AWS CodePipeline of a pending pipeline job', async () => {
			mock_putJobSuccessResult.mockReturnValue({
				promise: jest.fn().mockResolvedValue(''),
			});
			const response = await continueJobLater(MOCK_EVENT);
			expect(mock_putJobSuccessResult).toHaveBeenCalledWith({
				jobId: MOCK_PIPELINE_ID,
				continuationToken: JSON.stringify({ previous_job_id: MOCK_PIPELINE_ID }),
			});
			expect(response).toEqual('');
		});
	});

	describe('[getPipelineState] when a valid target and credentials are passed', () => {
		it('must get the latest execution status of a AWS CodePipeline', async () => {
			mock_getPipelineState.mockReturnValue({
				promise: jest.fn().mockResolvedValue(MOCK_SUCCESSFUL_PIPELINE_STATE),
			});
			const response = await getPipelineState(MOCK_TARGET_NAME, MOCK_CREDENTIALS_OBJECT);
			expect(AWS.CodePipeline).toHaveBeenCalledWith({
				credentials: MOCK_CREDENTIALS_OBJECT,
			});
			expect(mock_getPipelineState).toHaveBeenCalledWith({
				name: MOCK_TARGET_NAME,
			});
			expect(response).toEqual(MOCK_SUCCESSFUL_PIPELINE_STATE);
		});
	});

	describe('[triggerPipelineRelease] when a valid target and credentials are passed', () => {
		it('must trigger an execution of an AWS CodePipeline', async () => {
			mock_startPipelineExecution.mockReturnValue({
				promise: jest.fn().mockResolvedValue(MOCK_PIPELINE_START_RESULT),
			});
			const response = await triggerPipelineRelease(MOCK_TARGET_NAME, MOCK_CREDENTIALS_OBJECT);
			expect(AWS.CodePipeline).toHaveBeenCalledWith({
				credentials: MOCK_CREDENTIALS_OBJECT,
			});
			expect(mock_startPipelineExecution).toHaveBeenCalledWith({
				name: MOCK_TARGET_NAME,
			});
			expect(response).toEqual(MOCK_PIPELINE_START_RESULT);
		});
	});
});
