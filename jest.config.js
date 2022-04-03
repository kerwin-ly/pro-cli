/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
/* more details https://jestjs.io/docs/configuration */
module.exports = {
	roots: ['<rootDir>/test'],
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.test.json'
		}
	},
	transform: {
		'^.+\\.ts?$': 'ts-jest'
	},
	collectCoverage: true,
	transformIgnorePatterns: ['node_modules'],
	testEnvironment: 'node',
	coverageDirectory: '<rootDir>/test/coverage',
	// https://github.com/facebook/jest/issues/5164
	// globalSetup: './test/global-setup-hook.js',
	// globalTeardown: './test/global-teardown-hook.js',
	coverageReporters: ['json', 'lcov', 'clover', 'text-summary'],
	moduleNameMapper: {
		'^@(.*)/$': '<rootDir>/src/$1' // 正则匹配方式，对应webpack alias
	}
};
