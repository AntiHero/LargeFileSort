import fs from "fs";

export default function writeToFile(
  stream: fs.WriteStream,
  chunk: Buffer | string,
  encoding = "utf-8" as BufferEncoding
): Promise<void> {
  return new Promise<void>((res, rej) => {
    if (
      !stream.write(chunk, encoding, (err) => {
        if (err) rej(err);

        res();
      })
    ) {
      stream.once("drain", () => res());
    }
  });
}
