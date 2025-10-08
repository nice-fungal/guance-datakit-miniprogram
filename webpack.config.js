const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
module.exports = (env, args) => {
	let baseConfig = {
		mode: args.mode,
		entry: './src/index.js',
		experiments: {
			outputModule: true,
		},
		output: {
			filename: 'dataflux-rum-miniapp.js',
			path: path.resolve(__dirname, './dist'),
			library: {
				type: 'module',
			},
		},
		devtool: args.mode === 'development' ? 'inline-source-map' : 'source-map',
	}
	if (args.mode !== 'development') {
		baseConfig = Object.assign(baseConfig, {
			optimization: {
				minimize: false,
				minimizer: [
					new TerserPlugin({
						terserOptions: {
							compress: {
								drop_console: true,
							},
						},
					}),
				],
			},
		})
	} else {
		baseConfig = Object.assign(baseConfig, {
			watchOptions: {
				ignored: /node_modules|demo/, //忽略不用监听变更的目录
				aggregateTimeout: 300, // 文件发生改变后多长时间后再重新编译（Add a delay before rebuilding once the first file changed ）
				poll: 1000, //每秒询问的文件变更的次数
			},
		})
	}
	return baseConfig
}
