import { spawn } from 'node:child_process';

const ffmpegBin = process.env.FFMPEG_BIN || 'ffmpeg';
const ffprobeBin = process.env.FFPROBE_BIN || 'ffprobe';

function run(bin: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const proc = spawn(bin, args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout || stderr);
      } else {
        reject(new Error(`${bin} exited with code ${code}: ${stderr}`));
      }
    });
  });
}

export function runFfmpeg(args: string[]) {
  return run(ffmpegBin, args);
}

export function runFfprobe(args: string[]) {
  return run(ffprobeBin, args);
}
