import { truncate } from "node:fs/promises";
import { resolve } from "node:path";
import fs from "node:fs";

import { SingleBar } from "cli-progress";
import colors from "ansi-colors";

import createRandomNum from "./utils/createRandomNum";
import writeToFile from "./utils/writeToFile";
import mbToBytes from "./utils/mbToBytes";

const MB_100 = 100;

interface GenerateOptions {
  min: number;
  max: number;
}

export default async function generateFile(
  path = "input.txt",
  size = MB_100,
  options: GenerateOptions = {
    min: -100_000,
    max: 100_000,
  }
): Promise<string> {
  const { min, max } = options;
  const pathToFile = resolve(process.cwd(), path);

  if (fs.existsSync(pathToFile)) {
    fs.unlink(pathToFile, (err) => {
      if (err) {
        throw new Error('Input file can not be deleted!')
      }
    })
  }

  const ws = fs.createWriteStream(pathToFile, {
    encoding: "utf-8",
  });

  const fileSizeInBytes = mbToBytes(size);

  let chunkSize = 0;
  let chunk = "";

  const bar = new SingleBar({
    format: `${colors.yellow(`Generating file (${size}Mb)`)} | ${colors.cyan(
      "{bar}"
    )} | {percentage}% || {value}/{total} bytes`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  let bytesWritten = 0;
  bar.start(fileSizeInBytes, 0);

  while (ws.bytesWritten < fileSizeInBytes) {
    while (
      chunkSize < ws.writableHighWaterMark &&
      bytesWritten + chunkSize < fileSizeInBytes
    ) {
      const strToWrite = String(createRandomNum(min, max)) + "\n";
      chunk += strToWrite;
      chunkSize += Buffer.byteLength(strToWrite);
    }

    try {
      await writeToFile(ws, chunk);
      bytesWritten += chunkSize;

      chunk = "";
      chunkSize = 0;

      bar.update(ws.bytesWritten);
    } catch (err) {
      console.error("Error writing to file, %s", err);
    }
  }

  ws.close();
  bar.stop();

  return pathToFile;
}
