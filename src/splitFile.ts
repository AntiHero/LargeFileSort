import { resolve } from 'node:path';
import * as readline from 'node:readline';
import child_process from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { statSync, existsSync, createReadStream } from 'node:fs';

import colors from 'ansi-colors';
import { SingleBar } from 'cli-progress';

import bytesToMb from './utils/bytesToMb';
import mbToBytes from './utils/mbToBytes';
import calculateSplits from './utils/calculateSplits';

interface SplitFileOptions {
  tmpFolder: string;
  splits?: number;
  maxRam: number;
}

export default async function splitFile(
  filePath: string,
  options: SplitFileOptions = {
    maxRam: 50,
    tmpFolder: 'tmp',
  }
): Promise<string> {
  if (!existsSync(filePath)) throw new Error('Provide a valid file path!');

  let { tmpFolder, splits, maxRam } = options;

  try {
    const pathToTmpFolder = resolve(process.cwd(), tmpFolder);
    
    if (existsSync(pathToTmpFolder)) {
      await rm(pathToTmpFolder, { recursive: true });
    }
    await mkdir(pathToTmpFolder);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  let lines: number = 0;

  try {
    lines = Number(
      child_process.execSync(`wc -l ${filePath}`).toString().split(/\s+/)[0]
    );
  } catch (e) {
    console.error('Please run this function in any unix-like shell');
    process.exit(0);
  }

  void (Number.isNaN(lines) && (lines = 0));

  if (!lines) {
    console.error('File is empty');
    return Promise.reject();
  }

  const fileSize = statSync(filePath).size;

  if (!splits) splits = calculateSplits(fileSize, mbToBytes(maxRam));

  let linesPerChunk = Math.floor(lines / splits);
  const remainder = lines % splits;

  const rs = createReadStream(filePath, {
    encoding: 'utf-8',
  });

  const rl = readline.createInterface({
    input: rs,
  });

  let arr: number[] = [];
  let chunkNum = 1;

  const bar = new SingleBar({
    format: `${colors.yellow(
      `Splitting file (${bytesToMb(fileSize)}Mb)`
    )}  | ${colors.cyan('{bar}')} | {percentage}% || {value}/{total} splits`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  bar.start(splits, 0);

  for await (const line of rl) {
    if (Number.isNaN(line)) { continue; }

    arr.push(Number(line));

    if (arr.length === linesPerChunk + (chunkNum ^ splits ? 0 : remainder)) {
      await writeFile(
        `${tmpFolder}/${chunkNum}.txt`,
        Int32Array.from(arr).sort((a, b) => a - b).join('\n') + '\n',
        {
          encoding: 'utf8',
        }
      );
      arr = [];

      bar.update(chunkNum);
      chunkNum++;
    }
  }

  bar.stop();
  
  return resolve(process.cwd(), tmpFolder);
}
