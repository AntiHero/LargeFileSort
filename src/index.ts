import colors from 'ansi-colors';

import sortFiles from './sortFiles';
import splitFile from './splitFile';
import generateFile from './generateFile';

const failure = () => {
  console.log(colors.red('Failure'));
  return Promise.reject();
};

const success = () => console.log(colors.green('Success'));

generateFile()
  .then((filePath) => {
    success();
    return filePath;
  }, failure)
  .then(splitFile)
  .then((folderPath) => {
    success();
    return folderPath;
  }, failure)
  .then(sortFiles)
  .then(success, failure)
  .then(() => console.log(colors.bgMagenta('Job done')))
  .catch((e) => `Finished with ${e}`);
