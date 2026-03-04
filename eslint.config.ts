import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import {defineConfig, globalIgnores} from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{js,jsx,ts,tsx}'], // 新增 ts/tsx 支持
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended, // 引入 TS 推荐规则
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parser: tseslint.parser, // 使用 TS 解析器
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: {jsx: true},
                sourceType: 'module',
                project: './tsconfig.json', // 关联 tsconfig
            },
        },
        rules: {
            'no-unused-vars': 'off', // 禁用原生规则，改用 TS 版本
            '@typescript-eslint/no-unused-vars': ['error', {varsIgnorePattern: '^[A-Z_]'}],
            '@typescript-eslint/explicit-module-boundary-types': 'warn', // 要求导出函数显式声明返回类型
        },
    },
]);