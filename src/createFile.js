const fsPromises = require('fs/promises');
const crypto = require('crypto');
const utils = require('./utils');

/**
 *
 * @param {number} size - size in MBytes
 * @param {string} path - path to the file
 */
async function createFileWithRandomNumbers(
  size = utils.toBytes(1),
  path = './files/numbers.txt'
) {
  const writeOptions = { encoding: 'utf-8' };
  
  const fileHandler = await fsPromises.open(path, 'a');
  
  const requiredSize = utils.toBytes(size);
  let currentSize = await utils.getFileSize(path);
  
  process.stdout.write('Creating file...');

  while (currentSize < requiredSize) {
    const number = crypto.randomInt(0, 10000);

    await fsPromises.appendFile(
      fileHandler,
      String(number) + ' ',
      writeOptions
    );

    currentSize = await utils.getFileSize(path);
    const progress = utils.calculateProgress(currentSize, requiredSize);
    utils.printProgress(progress);
  }

  await fileHandler.close();
  process.stdout.write(
    `\nFile created. Size ${utils.toMbs(currentSize).toFixed(4)} MBytes.`
  );
}

module.exports = createFileWithRandomNumbers;
