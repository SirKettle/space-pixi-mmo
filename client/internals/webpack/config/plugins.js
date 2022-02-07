const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = ({
  isDevelopment,
  analyzeBundles,
  srcDirPath,
  pkg
}) => {

  const copyPlugin = new CopyPlugin({
    patterns: [
      path.resolve(srcDirPath, 'favicon.png'),
      {
        from: path.resolve(srcDirPath, 'static'),
        to: 'static'
      }
    ]
  });

  const htmlPlugin = new HtmlPlugin({ template: path.resolve(srcDirPath, 'index.html'), title: pkg.description });

  return (isDevelopment
    // development
    ? [
      new webpack.ProgressPlugin(),
      // This replaces the webpack.DefinePlugin using .env file
      new DotenvPlugin(),
      new webpack.DefinePlugin({
        'process.env.name': JSON.stringify(pkg.name),
        'process.env.description': JSON.stringify(pkg.description),
        'process.env.version': JSON.stringify(pkg.version),
      }),
      copyPlugin,
      htmlPlugin,
    ]
    // production
    : [
      ...(analyzeBundles ? [new BundleAnalyzerPlugin()] : []),
      new webpack.ProgressPlugin(),
      // prevents errors with process not being defined
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new webpack.DefinePlugin({
        'process.env.name': JSON.stringify(pkg.name),
        'process.env.description': JSON.stringify(pkg.description),
        'process.env.version': JSON.stringify(pkg.version),

      }),
      copyPlugin,
      htmlPlugin,
    ]
  );
};
