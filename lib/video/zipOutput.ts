import fs from 'node:fs';
import archiver from 'archiver';

export async function zipOutput(sourceFile: string, zipPath: string) {
  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.file(sourceFile, { name: 'lesson-recap.mp4' });
    archive.finalize();
  });
}
