import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

export const downloadFile = async (url: string, destPath: string): Promise<void> => {
  await mkdir(path.dirname(destPath), { recursive: true });
  
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed with status ${response.status}`);
  }
  
  const fileStream = createWriteStream(destPath);
  await pipeline(response.body, fileStream);
};