const fsPromises = require('fs/promises');
const fs = require('fs');
const constants = require('./constants');

async function getFileSize(path) {
  const size = (await fsPromises.stat(path)).size;
  return size;
};

function toBytes(size) {
  return size * constants.KB ** 2;
};

function toMbs(size) {
  return size / constants.KB ** 2;
};

function removeFileIfExists(path) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

function calculateProgress(currentValue, requiredValue) {
  const progress = (currentValue * 100 / requiredValue).toFixed(2);
  return progress;
}

function printProgress(progress){
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`Current process is ${progress > 100 ? 100 : progress}% completed.`);
};

module.exports = {
  calculateProgress,
  getFileSize,
  printProgress,
  removeFileIfExists,
  toMbs,
  toBytes,
};
