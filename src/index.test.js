import {
	MOCK_ASSUMED_ROLE_DATA,
	MOCK_CONTEXT,
	MOCK_CREDENTIALS_OBJECT,
	MOCK_EVENT,
	MOCK_EVENT_INVALID,
	MOCK_FAILED_PIPELINE_STATE,
	MOCK_PENDING_PIPELINE_STATE,
	MOCK_SUCCESSFUL_PIPELINE_STATE,
} from './mocks';
import { assumeRole, getCredentials } from './sts';
import { continueJobLater, getPipelineState, notifyFailedJob, notifySuccessfulJob } from './codePipeline';
import { handler } from './index';

jest.mock('./codePipeline');
jest.mock('./sts');

describe('[index.js] unit tests', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
		jest.spyOn(console, 'error').mockImplementation(() => {});
		jest.spyOn(console, 'info').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('[handler] when a valid event and context are passed', () => {
		it('must log the event and context', async () => {
			getPipelineState.mockResolvedValue(MOCK_FAILED_PIPELINE_STATE);
			await handler(MOCK_EVENT, MOCK_CONTEXT);
			expect(console.info).toHaveBeenCalledWith('Event: ' + JSON.stringify(MOCK_EVENT));
			expect(console.info).toHaveBeenCalledWith('Context: ' + JSON.stringify(MOCK_CONTEXT));
			expect(console.info).toHaveBeenCalledWith('Pipeline Status: ' + JSON.stringify(MOCK_FAILED_PIPELINE_STATE));
		});

		it('must return a failure signal to the invoking pipeline if there is an error during execution of the handler', async () => {
			assumeRole.mockRejectedValue({
				AccessDenied:
					'User: arn:aws:sts::123456789012:assumed-role/FakeLambdaRole/PipelineMonitorLambda is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::111111111111:role/FakeRole',
			});
			await handler(MOCK_EVENT, MOCK_CONTEXT);
			expect(console.error).toHaveBeenCalledWith('An error occurred while monitoring the pipeline FakePipeline', {
				AccessDenied:
					'User: arn:aws:sts::123456789012:assumed-role/FakeLambdaRole/PipelineMonitorLambda is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::111111111111:role/FakeRole',
			});
			expect(notifyFailedJob).toHaveBeenCalledWith(
				MOCK_EVENT,
				MOCK_CONTEXT,
				'The following error occurred: {"AccessDenied":"User: arn:aws:sts::123456789012:assumed-role/FakeLambdaRole/PipelineMonitorLambda is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::111111111111:role/FakeRole"}'
			);
		});

		it('must return a success signal to the invoking pipeline when the target pipeline has completed successfully', async () => {
			assumeRole.mockResolvedValue(MOCK_ASSUMED_ROLE_DATA);
			getCredentials.mockResolvedValue(MOCK_CREDENTIALS_OBJECT);
			getPipelineState.mockResolvedValue(MOCK_SUCCESSFUL_PIPELINE_STATE);
			await handler(MOCK_EVENT, MOCK_CONTEXT);
			expect(notifyFailedJob).not.toHaveBeenCalled();
			expect(continueJobLater).not.toHaveBeenCalled();
			expect(notifySuccessfulJob).toHaveBeenCalledWith(MOCK_EVENT);
			expect(console.info).toHaveBeenCalledWith('Pipeline FakePipeline Completed Successfully.');
		});

		it('must return a continuation token signal to the invoking pipeline when the target pipeline has failed', async () => {
			assumeRole.mockResolvedValue(MOCK_ASSUMED_ROLE_DATA);
			getCredentials.mockResolvedValue(MOCK_CREDENTIALS_OBJECT);
			getPipelineState.mockResolvedValue(MOCK_PENDING_PIPELINE_STATE);
			await handler(MOCK_EVENT, MOCK_CONTEXT);
			expect(notifyFailedJob).not.toHaveBeenCalled();
			expect(notifySuccessfulJob).not.toHaveBeenCalled();
			expect(continueJobLater).toHaveBeenCalledWith(MOCK_EVENT);
			expect(console.info).toHaveBeenCalledWith('Waiting for Pipeline FakePipeline to complete.');
		});

		it('must return a failure signal to the invoking pipeline when the target pipeline has failed', async () => {
			assumeRole.mockResolvedValue(MOCK_ASSUMED_ROLE_DATA);
			getCredentials.mockResolvedValue(MOCK_CREDENTIALS_OBJECT);
			getPipelineState.mockResolvedValue(MOCK_FAILED_PIPELINE_STATE);
			await handler(MOCK_EVENT, MOCK_CONTEXT);
			expect(continueJobLater).not.toHaveBeenCalled();
			expect(notifySuccessfulJob).not.toHaveBeenCalled();
			expect(notifyFailedJob).toHaveBeenCalledWith(MOCK_EVENT, MOCK_CONTEXT, 'FakePipeline has failed.');
		});
	});

	describe('[handler] when an invalid event and context are passed', () => {
		it('must return a failure signal to the invoking pipeline if there is an error with the parameters provided to the handler', async () => {
			await handler(MOCK_EVENT_INVALID, MOCK_CONTEXT);
			expect(notifyFailedJob).toHaveBeenCalledWith(
				MOCK_EVENT_INVALID,
				MOCK_CONTEXT,
				'Valid user parameters have not been specified.'
			);
		});
	});
});
