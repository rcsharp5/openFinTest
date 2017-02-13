var path = require('path');
console.log(__dirname);
console.log()
module.exports = {
    devtool: 'source-map',
    entry: {
        "main": path.join(__dirname, "src/main.js")

    },
    eslint: {
        cache: false,
        fix: false
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
    watch: true,
    resolve: {
        extensions: ['', '.js', '.jsx', '.json'],
        modulesDirectories: [
            './node_modules'
        ],
    },
};