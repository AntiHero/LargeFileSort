const utils = require('../utils');
const fs = require('fs');
const createFileWithRandomNumbers = require('../createFile');

jest.mock('fs');
console.log(process.cwd())

it('should be a function', () => {
  expect(createFileWithRandomNumbers).toBeInstanceOf(Function);
});

const pathToTestFile = './files/test.txt';

describe('check functionality', () => {
  beforeEach(() => {
    utils.removeFileIfExists(pathToTestFile);
  });

  afterAll(() => {
    utils.removeFileIfExists(pathToTestFile);
  });

  it.only('should create a file at specified path', async () => {
    await createFileWithRandomNumbers(0.001, pathToTestFile);
    expect(fs.existsSync(pathToTestFile)).toBeTruthy();
  });

  it('should create a file of specified size', async () => {
    const requiredSize = 0.005;
    await createFileWithRandomNumbers(requiredSize, pathToTestFile);
    const currentSize = await utils.getFileSize(pathToTestFile);
    expect(Number(utils.toMbs(currentSize).toFixed(4))).toBe(requiredSize);
  });
});
