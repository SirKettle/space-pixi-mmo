const path = require('path');
const DotEnv = require('dotenv');

const devServer = require('./config/devServer');
const optimization = require('./config/optimization');
const resolveAlias = require('./config/resolveAlias');
const plugins = require('./config/plugins');
const logInfo = require('./utils/logInfo');

const rootDirPath = path.resolve(process.cwd());
const pkg = require(path.resolve(rootDirPath, 'package.json'));
const clientDirPath = path.resolve(rootDirPath, 'client');
const srcDirPath = path.resolve(clientDirPath, 'src');

// access env vars
DotEnv.config({ path: path.resolve(rootDirPath, '.env') });

const port = process.env.CLIENT_PORT || 3000;

module.exports = (_env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const analyzeBundles = Boolean(argv.analyze);

  logInfo(port, isDevelopment);

  const config = {
    entry: {
      app: [path.resolve(srcDirPath, 'index.ts')],
    },
    output: {
      clean: true,
      filename: 'js/[name].[contenthash].js',
      path: path.resolve(clientDirPath, 'client-build'),
      publicPath: '/',
    },
    devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
    resolve: {
      alias: resolveAlias(srcDirPath),
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.png'],
    },
    cache: isDevelopment,
    optimization: optimization(isDevelopment),
    devServer: devServer(port, isDevelopment),
    module: {
      rules: [
        { test: /\.(png|jpe?g|gif)$/i, use: [{ loader: 'file-loader' }] },
        {
          test: /\.(ts|js)x?$/,
          exclude: '/node_modules',
          use: { loader: 'babel-loader' },
        },
      ],
    },
    plugins: plugins({
      srcDirPath,
      clientDirPath,
      isDevelopment,
      analyzeBundles,
      pkg,
    }),
  };

  return config;
};
