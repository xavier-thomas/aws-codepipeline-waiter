import {
	mockAssumedRoleData,
	mockCredentialsObject,
	mockFailedPipelineResult,
	mockInvalidCodePipelineEvent,
	mockLambdaContext,
	mockPendingPipelineresult,
	mockSuccessfulPipelineResult,
	mockValidCodePipelineEvent,
} from './mocks';
import STS from './sts';
import codePipeline from './codePipeline';
import { handler } from './index';

jest.mock('./codePipeline');
jest.mock('./sts');

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
				'User: arn:aws:sts::123456789012:assumed-role/FakeLambdaRole/PipelineMonitorLambda is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::111111111111:role/FakeRole',
		});
		await handler(mockValidCodePipelineEvent, mockLambdaContext);
		expect(console.error).toHaveBeenCalledWith('An error occurred while monitoring the pipeline FakePipeline', {
			AccessDenied:
				'User: arn:aws:sts::123456789012:assumed-role/FakeLambdaRole/PipelineMonitorLambda is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::111111111111:role/FakeRole',
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
