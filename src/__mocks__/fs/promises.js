const fsPromises = jest.createMockFromModule('fs/promises');

function stat() {
  return ({
    size: 1,
  })
}

fsPromises.stat = stat;

module.exports = fsPromises;
