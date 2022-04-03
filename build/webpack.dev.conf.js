const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.conf');

module.exports = merge(baseConfig, {
	mode: 'development',
	devtool: 'eval-cheap-module-source-map', // https://v4.webpack.docschina.org/configuration/devtool/
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_TLS_REJECT_UNAUTHORIZED': 0
		})
	]
});
