'use client';

import { useEffect, useState } from 'react';
import { JobRecord } from '@/lib/types';

export default function ResultPage({ params }: { params: { jobId: string } }) {
  const [job, setJob] = useState<JobRecord | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const run = async () => {
      const res = await fetch(`/api/jobs/${params.jobId}`);
      const data = await res.json();
      setJob(data);
      if (data.status === 'processing') {
        timer = setTimeout(run, 2000);
      }
    };
    void run();
    return () => clearTimeout(timer);
  }, [params.jobId]);

  if (!job) return <p>讀取中...</p>;

  if (job.status === 'failed') {
    return <div className="card"><p className="text-rose-700">處理失敗：{job.error}</p></div>;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">結果頁</h1>
      <div className="card space-y-4">
        <p>狀態：{job.status === 'done' ? '處理完成' : '處理中'}</p>
        {job.previewUrl && (
          <video controls className="max-h-[540px] w-full rounded-lg border">
            <source src={job.previewUrl} type="video/mp4" />
          </video>
        )}
        {job.status === 'done' && (
          <div className="flex gap-3">
            <a href={job.downloadMp4Url} className="rounded-lg bg-brand-500 px-4 py-2 text-white">下載 MP4</a>
            <a href={job.downloadZipUrl} className="rounded-lg bg-slate-700 px-4 py-2 text-white">下載 ZIP</a>
          </div>
        )}
      </div>
    </section>
  );
}
