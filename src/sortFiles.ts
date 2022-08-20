import fs from 'node:fs';
import { resolve } from 'node:path';
import fsPromises from 'node:fs/promises';
import * as readline from 'node:readline';
import { readdir } from 'node:fs/promises';

import colors from 'ansi-colors';
import { SingleBar } from 'cli-progress';

import bytesToMb from './utils/bytesToMb';
import writeToFile from './utils/writeToFile';

export default async function sortFiles(
  folder: string,
  outputFile = 'output.txt'
): Promise<void> {
  const generators: AsyncIterableIterator<string>[] = [];

  let size = 0;

  try {
    const files = await readdir(folder);

    for (const file of files) {
      const pathToFile = resolve(folder, file);
      size += fs.statSync(pathToFile).size;

      const generator = readline
        .createInterface({
          input: fs.createReadStream(pathToFile),
          crlfDelay: Infinity,
        })
        [Symbol.asyncIterator]();

      generators.push(generator);
    }
  } catch (err) {
    console.error(err);
  }

  const numPool: number[] = [];

  for await (let generator of generators) {
    const { done, value } = await generator.next();

    if (done) continue;

    const generatorVal = parseInt(value);

    if (!Number.isNaN(generatorVal)) {
      numPool.push(generatorVal);
    }
  }

  let output = '';
  let chunkSize = 0;

  const outputFilePath = resolve(process.cwd(), outputFile);

  if (fs.existsSync(outputFilePath)) {
    fs.unlink(outputFilePath, (err) => {
      if (err) throw new Error('Output file can not be deleted');
    });
  }

  const ws = fs.createWriteStream(outputFilePath);

  let min = Infinity;
  let minIdx = 0;

  const bar = new SingleBar({
    format: `${colors.yellow(
      `Sorting files (${bytesToMb(size)}Mb)`
    )}   | ${colors.cyan('{bar}')} | {percentage}% || {value}/{total} bytes`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  bar.start(size, 0);

  while (true) {
    for (let i = 0; i < numPool.length; i++) {
      if (numPool[i] < min) {
        min = numPool[i];
        minIdx = i;
      }
    }

    if (min === Infinity) {
      void (output && (await writeToFile(ws, output)));
      bar.update(ws.bytesWritten);
      break;
    }

    const strToWrite = String(min) + '\n';
    chunkSize += Buffer.byteLength(strToWrite);

    if (chunkSize > ws.writableHighWaterMark) {
      await writeToFile(ws, output);
      bar.update(ws.bytesWritten);
      chunkSize = 0;
      output = '';
    }

    output += strToWrite;

    const { value } = await generators[minIdx].next();

    Number.isNaN(parseInt(value))
      ? numPool.splice(minIdx, 1, Infinity)
      : numPool.splice(minIdx, 1, Number(value));

    min = Infinity;
  }

  bar.stop();
  
  return fsPromises.rm(folder, { recursive: true });
}
