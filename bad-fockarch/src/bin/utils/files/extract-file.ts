import { extract } from "tar-stream";
import { createGunzip } from "zlib";

import { createReadStream, createWriteStream, mkdirSync } from "fs";
import { rm } from "fs/promises";

import { join, parse } from "path";

export const extractFile = (archivePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const extractData = extract();
    const rootDir = parse(archivePath).dir;

    extractData.on("entry", (header, stream, nextEntry) => {
      const fullPath = join(rootDir, header.name);

      if (header.type === "directory") {
        mkdirSync(fullPath, { recursive: true });
        stream.resume();
        nextEntry();
      } else {
        mkdirSync(parse(fullPath).dir, { recursive: true });
        const writeStream = createWriteStream(fullPath);
        stream.pipe(writeStream);
        writeStream.on("finish", nextEntry);
        writeStream.on("error", (err) => {
          extractData.destroy(err);
          reject(err);
        });
        stream.on("error", (err) => {
          extractData.destroy(err);
          reject(err);
        });
      }
    });

    extractData.on("finish", async () => {
      try {
        await rm(archivePath, { force: true });
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    extractData.on("error", reject);

    createReadStream(archivePath)
      .on("error", reject)
      .pipe(createGunzip())
      .on("error", reject)
      .pipe(extractData);
  });
};