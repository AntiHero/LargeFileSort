const utils = require('../utils');
const fs = require('fs');
const createFileWithRandomNumbers = require('../createFile');

it('should be a function', () => {
  expect(createFileWithRandomNumbers).toBeInstanceOf(Function);
});

const pathToTestFile = './files/test.txt';

describe('file creation', () => {
  beforeAll(() => {
    utils.removeFileIfExists(pathToTestFile);
  });

  afterEach(() => {
    utils.removeFileIfExists(pathToTestFile);
  });

  it('should create a file at specified path', async () => {
    await createFileWithRandomNumbers(0.001, pathToTestFile);
    expect(fs.existsSync(pathToTestFile)).toBeTruthy();
  });

  it('should create a file of specified size', async () => {
    const requiredSize = 0.0001;
    await createFileWithRandomNumbers(requiredSize, pathToTestFile);
    const currentSize = await utils.getFileSize(pathToTestFile);
    expect(Number(utils.toMbs(currentSize).toFixed(4))).toBe(requiredSize);
  });
});
