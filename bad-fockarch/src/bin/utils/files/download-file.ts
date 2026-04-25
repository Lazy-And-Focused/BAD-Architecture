import { get as httpGet } from "https";
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { parse } from "path";

function ensureDir(filePath: string): void {
  const dir = parse(filePath).dir;
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export const downloadFile = async (
  url: string,
  destPath: string,
): Promise<void> => {
  ensureDir(destPath);

  return new Promise<void>((resolve, reject) => {
    const file = createWriteStream(destPath);

    httpGet(url, (response) => {
      if (response.statusCode && response.statusCode >= 400) {
        reject(new Error(`Download failed with status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
      file.on("error", (err) => {
        file.close();
        reject(err);
      });
      response.on("error", (err) => {
        file.close();
        reject(err);
      });
    }).on("error", (err) => {
      file.close();
      reject(err);
    });
  });
};
