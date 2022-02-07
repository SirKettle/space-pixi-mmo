// Node modules below are separated into separate bundles
const cacheGroupModules = {
  pixi: ['pixi.js'],
  otherMainVendors: ['nipplejs', 'socket.io', 'ramda', 'uuid', 'standardized-audio-context']
}

const cacheGroups = Object.entries(cacheGroupModules)
  .reduce((acc, [key, modulePaths]) => ({
    ...acc,
    [key]: {
      test: new RegExp(`[\\/]node_modules[\\/](${modulePaths.join('|')})[\\/]`),
      name: `${key}-bundle`,
      chunks: 'all'
    }
  }), {})

module.exports = (isDevelopment = false) => (isDevelopment
  // development
  ? {
    moduleIds: 'named',
    chunkIds: 'named',
    mangleExports: false,
    minimize: false,
    splitChunks: { cacheGroups }
  }
  // production
  : {
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
    mangleExports: 'deterministic',
    minimize: true,
    splitChunks: { cacheGroups }
  }
);
