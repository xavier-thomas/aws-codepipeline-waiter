const AWS = require('aws-sdk');

let STS;

/**
 * Assumes a cross account role and returns the AWS credentials object.
 * @param {object} assumeRoleName: The ARN of the AWS IAM role
 */
const assumeRole = async (assumeRoleName) => {
	STS = new AWS.STS();
	const options = {
		RoleArn: assumeRoleName,
		RoleSessionName: 'PipelineMonitoringLambda',
	};
	return STS.assumeRole(options).promise();
};

/**
 * Assumes a cross account role and returns the AWS credentials object.
 * @param {object} assumeRoleData: The Data returned by the STS Assume Role API call
 */
const getCredentials = async (assumeRoleData) => {
	STS = new AWS.STS();
	return STS.credentialsFrom(assumeRoleData);
};

module.exports.assumeRole = assumeRole;
module.exports.getCredentials = getCredentials;
