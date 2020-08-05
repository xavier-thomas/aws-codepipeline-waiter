import AWS from 'aws-sdk';

let STS;

/**
 * Assumes a cross account role and returns the AWS credentials object.
 * @param {string} assumeRoleArn: The ARN of the AWS IAM role
 * @returns {object} :The Data returned by the STS Assume Role API call
 */
const assumeRole = async (assumeRoleArn) => {
	STS = new AWS.STS();
	const options = {
		RoleArn: assumeRoleArn,
		RoleSessionName: 'PipelineWaiterLambda',
	};
	return STS.assumeRole(options).promise();
};

/**
 * Assumes a cross account role and returns the AWS credentials object.
 * @param {string} assumeRoleData: The Data returned by the STS Assume Role API call
 * @returns {object} :The Credentials Object returned by AWS STS.GetCredentials
 */
const getCredentials = async (assumeRoleData) => {
	STS = new AWS.STS();
	return STS.credentialsFrom(assumeRoleData);
};

module.exports.assumeRole = assumeRole;
module.exports.getCredentials = getCredentials;
