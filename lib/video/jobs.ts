import fs from 'node:fs/promises';
import path from 'node:path';
import { JobRecord } from '../types';
import { getStorageRoot } from './storage';

function jobPath(id: string) {
  return path.join(getStorageRoot(), 'jobs', `${id}.json`);
}

export async function saveJob(job: JobRecord) {
  await fs.writeFile(jobPath(job.id), JSON.stringify(job, null, 2), 'utf8');
}

export async function getJob(id: string): Promise<JobRecord | null> {
  try {
    const raw = await fs.readFile(jobPath(id), 'utf8');
    return JSON.parse(raw) as JobRecord;
  } catch {
    return null;
  }
}
