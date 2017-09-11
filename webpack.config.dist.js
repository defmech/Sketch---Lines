var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var path = require("path");

/**
 * Define Path
 */


var outputFolder = 'dist';

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.resolve(__dirname, outputFolder),
    filename: 'js/[name].js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: [
          ["es2015", {
            "modules": false
          }]
        ]
      }
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('css-loader?url=false!postcss-loader!sass-loader')
    }, {
      test: /\.glsl$/,
      loader: 'webpack-glsl-loader'
    }]
  },
  plugins: [
    // HTML
    new HtmlWebpackPlugin({
      title: 'ATHENAEUM',
      chunks: ['standalone'],
      hash: false,
      inject: false,
      template: './src/index.html',
    }),
    new HtmlWebpackPlugin({
      title: 'Sketch - Lines',
      hash: true,
      template: './src/index.html',
    }),
    // css optimize
    new OptimizeCssAssetsPlugin(),
    // sass
    new ExtractTextPlugin({
      filename: 'css/main.css',
      allChunks: true,
    }),
    // copy static
    new CopyWebpackPlugin([{
      from: './src/assets',
      to: 'assets',
    }, {
      from: './src/js/libs',
      to: 'js/libs',
    }], {
      ignore: [
        // Doesn't copy any files with a txt extension
        '.DS_Store',
      ],
    }),
    // Clean build
    new CleanWebpackPlugin([outputFolder], {
      verbose: true,
      dry: false,
      exclude: [],
    }),
    // uglify js
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false,
      },
      output: {
        comments: false,
      },
      sourceMap: false,
    }),
    // env plugin
    new webpack.DefinePlugin({
      'proccess.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],
};
