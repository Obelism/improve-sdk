import js from '@eslint/js'
import prettier from 'eslint-config-prettier/flat'
import onlyWarn from 'eslint-plugin-only-warn'
import turbo from 'eslint-plugin-turbo'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

/**
 * Shared flat ESLint config for the Obelism Improve SDK packages.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
	js.configs.recommended,
	prettier,
	{
		plugins: { turbo },
		rules: {
			'turbo/no-undeclared-env-vars': 'warn',
		},
	},
	{
		// Surfaces every rule as a warning rather than an error.
		plugins: { 'only-warn': onlyWarn },
	},
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			globals: {
				...globals.browser,
				...globals.node,
				React: true,
				JSX: true,
			},
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**', '.next/**', 'out/**', 'build/**'],
	},
]
