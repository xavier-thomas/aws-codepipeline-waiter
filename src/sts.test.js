jest.mock('aws-sdk');
import { MOCK_ASSUMED_ROLE_DATA, MOCK_ASSUME_ROLE_ARN, MOCK_CREDENTIALS_OBJECT } from './mocks';
import { assumeRole, getCredentials } from './sts';
import AWS from 'aws-sdk';

describe('[sts.js] unit tests', () => {
	const mockAssumeRole = jest.fn();
	const mockGetCredentials = jest.fn();

	beforeEach(() => {
		jest.restoreAllMocks();
		AWS.STS.mockImplementation(() => ({
			assumeRole: mockAssumeRole,
			credentialsFrom: mockGetCredentials,
		}));
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('[getCredentials] when a valid assumeRoleData is passed', () => {
		it('must assume a cross account role', async () => {
			mockAssumeRole.mockReturnValue({
				promise: jest.fn().mockResolvedValue(MOCK_ASSUMED_ROLE_DATA),
			});
			const response = await assumeRole(MOCK_ASSUME_ROLE_ARN);
			expect(mockAssumeRole).toHaveBeenCalledWith({
				RoleArn: MOCK_ASSUME_ROLE_ARN,
				RoleSessionName: 'PipelineWaiterLambda',
			});
			expect(response).toEqual(MOCK_ASSUMED_ROLE_DATA);
		});
	});

	describe('[getCredentials] when a valid assumeRoleData is passed', () => {
		it('must get an AWS Credentials Object from the AssumeRole output data', async () => {
			mockGetCredentials.mockResolvedValue(MOCK_CREDENTIALS_OBJECT);
			const response = await getCredentials(MOCK_ASSUMED_ROLE_DATA);
			expect(response).toEqual(MOCK_CREDENTIALS_OBJECT);
		});
	});
});
