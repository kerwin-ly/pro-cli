const webpack = require('webpack');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const baseConfig = require('./webpack.dev.conf');

module.exports = merge(baseConfig, {
	mode: 'production',
	devtool: 'hidden-source-map',
	plugins: [
		new CleanWebpackPlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_TLS_REJECT_UNAUTHORIZED': 1
		})
	]
});
