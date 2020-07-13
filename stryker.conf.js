module.exports = function(config) {
	config.set({
		babel: {
			optionsFile: '.babelrc'
		},
		coverageAnalysis: 'off',
		dashboard: {
			reportType: 'full'
		},
		maxConcurrentTestRunners: 1,
		mutate: ['src/**/*.js', '!src/**/*.test.js', '!src/mocks.js'],
		mutator: 'javascript',
		jest: {
			config: require('./jest.config.json'),
			"enableFindRelatedTests": false
		},
		packageManager: 'yarn',
		reporters: ['html', 'clear-text', 'progress', 'dashboard'],
		testRunner: 'jest',
		transpilers: ['babel']
	});
};