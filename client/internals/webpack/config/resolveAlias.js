const path = require('path');
const { getDirectoryNames } = require('../utils/getDirectoryNames');

module.exports = (srcDirPath) => ({
  // adds an alias record for each directory in /src - ie '~assets': '../src/assets'
  ...getDirectoryNames(srcDirPath).reduce((acc, dir) => ({
    ...acc,
    [`~${dir}`]: path.resolve(srcDirPath, dir)
  }), {}),
  '~types': path.resolve(srcDirPath, 'types'),
});
