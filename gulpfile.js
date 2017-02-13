var gulp = require('gulp');
var clean = require('gulp-clean');
var path = require('path');
//var webpack = require('webpack-stream');
var webpack = require('gulp-webpack');
var gutil = require("gulp-util");
var watch = require('gulp-watch');
var async = require("async");
var openfinLauncher = require('openfin-launcher'),
	configPath = __dirname + '/desktop-local.json';
function launchOpenfin() {
	openfinLauncher.launchOpenFin({
		configPath: configPath
	});
}
gulp.task('clean-scripts', function () {
	return gulp.src(__dirname + '/dist/js', { read: false })
		.pipe(clean({ force: true }));
});
gulp.task("watch", function () {
	return watch(["src/**/*"], {
		ignoreInitial: true
	}, function () {
		gulp.start("build");
	});
});


gulp.task("devServer", ["build"], function (callback) {
	gulp.watch(['./src/**/*.js'], function () {
		gulp.start('build');
	});
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
		"main": __dirname + "/src/main.js",
		"child": __dirname + "/src/child.js"
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
		path: __dirname + "/dist/js/"
	},
	resolve: {
		extensions: ['', '.js', '.jsx', '.json'],
		modulesDirectories: [
			'./node_modules'
		],
	},
}
gulp.task("build", ["clean-scripts"], function () {
	return gulp.src(__dirname + '/webpack.config.js')
		.pipe(webpack(webpackConfig))
		.pipe(gulp.dest(__dirname + '/dist/js'))
		.on('error', function (err) {
			console.log(err)
		});
});


gulp.task('default', ['devServer']);
