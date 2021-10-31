const fs = require('fs');
const utils = require('./utils');
const { join } = require('path');

/**
 *
 * @param {string} path - path to the file
 * @param {number} filesAmount - amount of chunks the file should be splitted
 * @param {string} outputPath - path to the output files
 */
module.exports = async function splitFile(
  path,
  filesAmount = 4,
  outputPath = './files/tmp'
) {
  if (typeof path !== 'string' || typeof filesAmount !== 'number') {
    throw new TypeError('Invalid args!');
  }

  if (!fs.existsSync(path)) {
    console.log(`Path: ${path}`);
    throw new Error("File doesn't exist! Create a file!");
  }

  utils.cleanFolder(outputPath);

  const fileSize = await utils.getFileSize(path);

  let fileNum = 1;
  let bytesToRead = Math.round(fileSize / filesAmount);
  let fileData = [];

  const readFileStream = fs.createReadStream(path, {
    highWaterMark: bytesToRead,
  });
  
  let writeFileStream = fs.createWriteStream(
    join(outputPath, `chunk${fileNum}.txt`),
    {
      flags: 'w',
      encoding: 'utf-8',
    }
  );

  readFileStream.on('data', (chunk) => {
    fileData.push(chunk);

    console.log(readFileStream.bytesRead, bytesToRead);
    if (readFileStream.bytesRead === bytesToRead * fileNum) {
      readFileStream.pause();

      fileData = fileData
        .join(' ')
        .split(/\s+/)
        .sort((a, b) => a - b)
        .join(' ');

      writeFileStream.write(Buffer.from(fileData), (err) => {
        if (err) console.log(err);

        fileData = [];
        fileNum++;

        if (fileNum > filesAmount) {
          readFileStream.close();
          writeFileStream.close();
        } else {
          writeFileStream.close();
          writeFileStream = fs.createWriteStream(
            join(outputPath, `chunk${fileNum}.txt`)
          );
          readFileStream.resume();
        }
      });

      writeFileStream.on('error', () => {
        console.log('Writing file error!');
      });
    }
  });
};
