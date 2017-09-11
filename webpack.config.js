var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var path = require("path");
var DashboardPlugin = require('webpack-dashboard/plugin');
var LiveReloadPlugin = require('webpack-livereload-plugin');

/**
 * Define Path
 */
var outputFolder = 'build';

module.exports = {
  devtool: 'source-map',
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
    }]
  },
  plugins: [
    // LiveReload
    new LiveReloadPlugin({
      appendScriptTag: true
    }),
    // Dashboard
    new DashboardPlugin(),
    // HTML
    new HtmlWebpackPlugin({
      title: 'DEV! Lines',
      hash: true,
      template: './src/index.html',
    }),
    // css optimize
    new OptimizeCssAssetsPlugin(),
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
      ]
    }),
    // Clean build
    new CleanWebpackPlugin([outputFolder], {
      verbose: true,
      dry: false,
      exclude: []
    }),
    // sass
    new ExtractTextPlugin({
      filename: 'css/main.css',
      allChunks: true
    }),
    // env plugin
    new webpack.DefinePlugin({
      'proccess.env': {
        NODE_ENV: 'production',
      }
    })
  ],
}
