const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: [
    'es5-shim',
    'babel-polyfill',
    './src/frontend/main'
  ],
  output: {
    filename: 'bundle.min.js',
    path: path.join(__dirname, 'public/dist'),
    publicPath: '/dist/'
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      },
      '__DEVTOOLS__': false
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new ExtractTextPlugin('master.css', { allChunks: true }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.template.html'
    })
  ],
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: [ 'style-loader', 'css-loader' ],
        include: path.join(__dirname, 'public/dist/styles')
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: [
          path.join(__dirname, 'src/frontend'),
          path.join(__dirname, 'src/common')
        ]
      },
      {
        test: /\.svg$/,
        loader: 'url-loader?mimetype=image/svg+xml'
      }
    ]
  }
}
