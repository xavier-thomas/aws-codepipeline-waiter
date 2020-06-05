module.exports = function(config) {
	config.set({
		babel: {
			optionsFile: '.babelrc'
		},
		coverageAnalysis: 'off',
		maxConcurrentTestRunners: 1,
		mutate: ['src/**/*.js', '!src/**/*.test.js', '!src/mocks.js'],
		mutator: 'javascript',
		reporters: ['clear-text', 'progress'],
		testRunner: 'jest',
		transpilers: ['babel']
	});
};