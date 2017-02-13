var gulp = require('gulp');
var clean = require('gulp-clean');
var path = require('path');
var webpack = require('webpack-stream');
var gutil = require("gulp-util");
var watch = require('gulp-watch');
var async = require("async");
var openfinLauncher = require('openfin-launcher'),
	configPath = __dirname + '/desktop-local.json';
console.log("configPath", configPath)
function launchOpenfin() {
	openfinLauncher.launchOpenFin({
		configPath: configPath
	});
}
gulp.task('clean-scripts', function () {
	return gulp.src('dist/js/*.js', { read: false })
		.pipe(clean());
});
gulp.task("watch", function () {
	return watch(["src/**/*"], {
		ignoreInitial: true
	}, function () {
		gulp.start("build");
	});
});


gulp.task("devServer", ["build"], function (callback) {

	var exec = require('child_process').exec;
	var serverExec = exec('node server.js');
	serverExec.stdout.on("data", function (data) {
		console.log("SERVER STDOUT:", data);
		if (data.indexOf("listening on port") > -1) {
			launchOpenfin();
			callback();
		}
	});
});
var webpackConfig = {
	devtool: 'source-map',
	entry: {
		"main": path.join(__dirname, "src/main.js"),
		"child": path.join(__dirname, "src/child.js")
	},
	stats: {
		warnings: true
	},
	module: {
		loaders: [
			{
				test: /\.json$/,
				loader: "json-loader"
			}, {
				test: /\.js(x)?$/,
				exclude: [/node_modules/],
				loader: 'babel-loader',
				query: {
					presets: ['react', 'es2015', 'stage-1']
				}
			},
		]
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, 'dist/js/')
	},
	resolve: {
		extensions: ['', '.js', '.jsx', '.json'],
		modulesDirectories: [
			'./node_modules'
		],
	},
}
gulp.task("build", ["clean-scripts"], function () {
	return gulp.src('./webpack.config.js')
		.pipe(webpack(webpackConfig))
		.pipe(gulp.dest('dist/js'));

});


gulp.task('default', ['devServer']);
