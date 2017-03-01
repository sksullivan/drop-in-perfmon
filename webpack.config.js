var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin'); 

module.exports = {
  entry: './main.js',
  output: { path: __dirname+'/dist', filename: 'bundle.js' },
  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      { 
        test: /\.css$/, 
        loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader" })
      },
      { 
        test: /\.(jpg|png)$/, 
        loader: "file-loader" 
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'file-loader',
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'file-loader'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'file-loader'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("[name].css")
  ],
};
