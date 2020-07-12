jest.mock('aws-sdk');
import { assumeRole, getCredentials } from './sts';
import { MOCK_ASSUME_ROLE_ARN, mockAssumedRoleData, mockCredentialsObject } from './mocks';
import AWS from 'aws-sdk';

describe('[sts.js] unit tests', () => {

	const mockAssumeRole = jest.fn();
	const mockGetCredentials = jest.fn();

	beforeEach(() => {
		jest.restoreAllMocks();
		AWS.STS.mockImplementation(() => ({
			assumeRole: mockAssumeRole,
			credentialsFrom: mockGetCredentials
		}));
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('[getCredentials] when a valid assumeRoleData is passed', () => {
		it('must assume a cross account role', async () => {
			mockAssumeRole.mockReturnValue({
				promise: jest.fn().mockResolvedValue(mockAssumedRoleData),
			});
			const response = await assumeRole(MOCK_ASSUME_ROLE_ARN);
			expect(response).toEqual(mockAssumedRoleData);			
			expect(mockAssumeRole).toHaveBeenCalledWith(
				{
					RoleArn: MOCK_ASSUME_ROLE_ARN,
					RoleSessionName: 'PipelineMonitoringLambda',
				}
			);
		});

	});


	describe('[getCredentials] when a valid assumeRoleData is passed', () => {

		it('must get an AWS Credentials Object from the AssumeRole output data', async () => {
			mockGetCredentials.mockResolvedValue(mockCredentialsObject);
	 		const response = await getCredentials(mockAssumedRoleData);
	 		expect(response).toEqual(mockCredentialsObject);
		});

	});

});
