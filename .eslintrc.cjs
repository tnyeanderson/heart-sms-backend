module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		"array-bracket-spacing": 1,
		"arrow-spacing": 1,
		"comma-spacing": 1,
		"linebreak-style": ["error", "unix"],
		"max-len": [
			"error",
			{
				"code": 140,
				"ignorePattern": "^import\\s"
			}
		],
		"no-trailing-spaces": 2,
		"no-multi-spaces": 2,
		"no-multiple-empty-lines": ["error", {max: 1}],
		"eol-last": 2,
		"eqeqeq": 2,
		"no-var": 2,
		"prefer-template": 1,
		"spaced-comment": 1,
		"indent": ["error", "tab"]
	},
	"ignorePatterns": [
		// don't ever lint node_modules
		"node_modules",
		// don't lint build output (make sure it's set to your correct build folder name)
		"dist",
		// don't lint nyc coverage output
		"coverage",
		// for now, don't lint test files
		"test"
	]
};
