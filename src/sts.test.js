const AWS = require('aws-sdk-mock');
const { assumeRole, getCredentials } = require('./sts');

const mockCredentialsData = {
	AssumedRoleUser: {
		Arn: 'arn:aws:sts::123456789012:assumed-role/FakeRole/PipelineMonitoringLambda',
		AssumedRoleId: 'ARO123EXAMPLE123:FakeRole'
	},
	Credentials: {
		AccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
		Expiration: 1534156391,
		SecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY',
		SessionToken:
			'AQoDYXdzEPT//////////wEXAMPLEtc764bNrC9SAPBSM22wDOk4x4HIZ8j4FZTwdQWLWsKWHGBuFqwAeMicRXmxfpSPfIeoIYRqTflfKD8YUuwthAx7mSEI/qkPpKPi/kMcGdQrmGdeehM4IC1NtBmUpp2wUE8phUZampKsburEDy0KPkyQDYwT7WZ0wq5VSXDvp75YU9HFvlRd8Tx6q6fE8YQcHNVXAkiY9q6d+xo0rKwT38xVqr7ZD0u0iPPkUL64lIZbqBAz+scqKmlzm8FDrypNC9Yjc8fPOLn9FX9KSYvKTr4rvx3iSIlTJabIQwj2ICCR/oLxBA=='
	},
	PackedPolicySize: 6
};

describe('STS', () => {
	it('must assume a cross account role', () => {
		const assumeRoleResultSpy = jest.fn();
		AWS.mock('STS', 'assumeRole', assumeRoleResultSpy);
		assumeRole('arn:aws:iam::123456789012:role/FakeRole');
		expect(assumeRoleResultSpy).toHaveBeenCalledWith(
			{
				RoleArn: 'arn:aws:iam::123456789012:role/FakeRole',
				RoleSessionName: 'PipelineMonitoringLambda'
			},
			expect.anything()
		);
		AWS.restore('CodePipeline');
	});

	it('must get an AWS Credentials Object from the AssumeRole output data', () => {
		const credentialsFromResultSpy = jest.fn();
		AWS.mock('STS', 'credentialsFrom', credentialsFromResultSpy);
		getCredentials(mockCredentialsData);
		expect(credentialsFromResultSpy).toHaveBeenCalledWith(
			{
				AssumedRoleUser: {
					Arn: 'arn:aws:sts::123456789012:assumed-role/FakeRole/PipelineMonitoringLambda',
					AssumedRoleId: 'ARO123EXAMPLE123:FakeRole'
				},
				Credentials: {
					AccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
					Expiration: 1534156391,
					SecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY',
					SessionToken:
						'AQoDYXdzEPT//////////wEXAMPLEtc764bNrC9SAPBSM22wDOk4x4HIZ8j4FZTwdQWLWsKWHGBuFqwAeMicRXmxfpSPfIeoIYRqTflfKD8YUuwthAx7mSEI/qkPpKPi/kMcGdQrmGdeehM4IC1NtBmUpp2wUE8phUZampKsburEDy0KPkyQDYwT7WZ0wq5VSXDvp75YU9HFvlRd8Tx6q6fE8YQcHNVXAkiY9q6d+xo0rKwT38xVqr7ZD0u0iPPkUL64lIZbqBAz+scqKmlzm8FDrypNC9Yjc8fPOLn9FX9KSYvKTr4rvx3iSIlTJabIQwj2ICCR/oLxBA=='
				},
				PackedPolicySize: 6
			},
			expect.anything()
		);
		AWS.restore('CodePipeline');
	});
});
