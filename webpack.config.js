const path = require("path"),
	defaultConfig = {
		mode: "production",
		entry: "./src/index.ts",
		target: "web",
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: "ts-loader",
					exclude: /node_modules/
				}
			]
		},
		resolve: {
			extensions: [".ts"]
		},
		output: {
			filename: "typingwriter.min.js",
			path: path.resolve(__dirname, "bin")
		},
		externals: {
			"hangul-js": "Hangul"
		},
		devtool: "source-map"
	},
	bundleConfig = {
		...defaultConfig,
		output: {
			filename: "typingwriter.bundle.js",
			path: path.resolve(__dirname, "bin")
		},
		externals: []
	};

module.exports = [defaultConfig, bundleConfig];
