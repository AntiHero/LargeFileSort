const fs = jest.createMockFromModule('fs');

function exsistsSync() {
  return true;
}

fs.existsSync = exsistsSync;

module.exports = fs;
