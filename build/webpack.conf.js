const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { pathResolve } = require('./util');
const path = require('path');
const { BASE_DIR } = require('./config');

module.exports = {
	target: 'node',
	entry: {
		main: pathResolve('../src/main.ts')
	},
	output: {
		path: pathResolve('../lib'),
		filename: '[name].js'
	},
	resolve: {
		extensions: ['.ts', '.js', '.json'],
		alias: {
			'@api': path.resolve(BASE_DIR, 'api'),
			'@command': path.resolve(BASE_DIR, 'command'),
			'@config': path.resolve(BASE_DIR, 'config'),
			'@typings': path.resolve(BASE_DIR, 'typings'),
			'@utils': path.resolve(BASE_DIR, 'utils')
		}
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				include: [pathResolve('../src')],
				exclude: '/node_modules/',
				loader: 'ts-loader',
				options: {
					transpileOnly: true, // 加快编译速度 https://webpack.docschina.org/guides/build-performance/
					configFile: pathResolve('../tsconfig.json') // 指定特定的ts编译配置，为了区分脚本的ts配置
				}
			}
		]
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					from: pathResolve('../templates'),
					to: './templates'
				},
				{
					from: pathResolve('../package.json'),
					to: './package.json'
				}
			]
		})
	],
	node: {
		// 防止打包后的node工程，读取__dirname, __filename为空
		__dirname: false,
		__filename: false
	},
	externals: [nodeExternals()]
};
