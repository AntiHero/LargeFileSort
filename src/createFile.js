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

  const existingFileSize = await utils.getFileSize(path);
  let currentSize = existingFileSize;

  if (currentSize >= requiredSize) return;

  process.stdout.write('Creating file...');
  const numbers = [];

  let remainingBytes = requiredSize - existingFileSize;

  for (let i = 0; i < remainingBytes; i++) {
    const number = crypto.randomInt(0, 247);
    numbers.push(number);
    
    const numberLengthInBytes = number.toString().length;
    remainingBytes -= numberLengthInBytes;
    currentSize += numberLengthInBytes + 1;

    // const progress = utils.calculateProgress(currentSize, requiredSize);
    // utils.printProgress(progress); 
  }

  await fsPromises.appendFile(fileHandler, numbers.join('\n'), writeOptions);

  await fileHandler.close();
  process.stdout.write(
    `\nFile created. Size ${utils.toMbs(currentSize).toFixed(4)} MBytes.`
  );
}

module.exports = createFileWithRandomNumbers;
