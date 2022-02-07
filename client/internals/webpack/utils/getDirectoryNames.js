const { readdirSync } = require('fs');

const getDirectoryNames = srcPath =>
  readdirSync(srcPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

module.exports = {
  getDirectoryNames
};
