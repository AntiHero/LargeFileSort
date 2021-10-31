const fsPromises = require('fs/promises');
const readline = require('readline');
const fs = require('fs');
const { resolve } = require('path');
const constants = require('./constants');

async function getFileSize(path) {
  const size = (await fsPromises.stat(path)).size;
  return size;
}

function toBytes(size) {
  return size * constants.KB ** 2;
}

function toMbs(size) {
  return size / constants.KB ** 2;
}

function removeFileIfExists(path) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}

function calculateProgress(currentValue, requiredValue) {
  const progress = ((currentValue * 100) / requiredValue).toFixed(2);
  return progress;
}

function printProgress(progress) {
  readline.cursorTo(process.stdout, 0);
  process.stdout.cursorTo(0);
  process.stdout.write(
    `Current process is ${progress > 100 ? 100 : progress}% completed.`
  );
}

/**
 *
 * @param {string} path - path to folder which should be cleaned (all files will be deleted)
 */
function cleanFolder(path) {
  const files = fs.readdirSync(path);

  files.forEach((file) => {
    fs.unlinkSync(resolve(path, file));
  });
}

module.exports = {
  calculateProgress,
  cleanFolder,
  getFileSize,
  printProgress,
  removeFileIfExists,
  toMbs,
  toBytes,
};
