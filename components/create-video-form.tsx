'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { defaultProcessSettings } from '@/lib/config/defaults';
import { ProcessRequest, SegmentInput, VideoInfo } from '@/lib/types';

interface UploadResponse {
  uploadId: string;
  storedFilename: string;
  originalFilename: string;
  info: VideoInfo;
}

function parseSegmentsText(input: string): SegmentInput[] {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [start, end] = line.split('-').map((s) => s.trim());
      return { start, end };
    });
}

export function CreateVideoForm() {
  const router = useRouter();
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  const [segmentsRaw, setSegmentsRaw] = useState('00:10 - 00:18\n00:30 - 00:38');
  const [settings, setSettings] = useState(defaultProcessSettings);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hasAudioLabel = useMemo(() => (upload?.info.hasAudio ? '有' : '無'), [upload]);

  async function onUpload(file: File) {
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '上傳失敗');
      return;
    }
    setUpload(data);
  }

  async function onProcess() {
    if (!upload) {
      setError('請先上傳影片');
      return;
    }
    setLoading(true);
    setError('');

    const payload: ProcessRequest = {
      ...settings,
      uploadId: upload.uploadId,
      originalFilename: upload.originalFilename,
      segments: parseSegmentsText(segmentsRaw)
    };

    const res = await fetch('/api/process', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || '處理失敗');
      return;
    }

    router.push(`/result/${data.jobId}`);
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">1) 上傳影片</h2>
        <input
          type="file"
          accept=".mp4,.mov"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onUpload(file);
          }}
          className="block w-full rounded-lg border border-slate-300 p-2"
        />
        {upload && (
          <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            <p>檔名：{upload.originalFilename}</p>
            <p>影片長度：{upload.info.duration.toFixed(1)} 秒</p>
            <p>解析度：{upload.info.width} × {upload.info.height}</p>
            <p>是否含音訊：{hasAudioLabel}</p>
          </div>
        )}
      </section>

      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">2) 輸出設定</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">影片比例
            <select className="mt-1 w-full rounded-lg border p-2" value={settings.aspectRatio} onChange={(e) => setSettings((s) => ({ ...s, aspectRatio: e.target.value as '9:16' | '16:9' }))}>
              <option value="9:16">直式 9:16</option>
              <option value="16:9">橫式 16:9</option>
            </select>
          </label>
          <label className="text-sm">輸出長度
            <select className="mt-1 w-full rounded-lg border p-2" value={settings.outputLength} onChange={(e) => setSettings((s) => ({ ...s, outputLength: Number(e.target.value) as 30 | 45 | 60 }))}>
              <option value={30}>30 秒</option>
              <option value={45}>45 秒</option>
              <option value={60}>60 秒</option>
            </select>
          </label>
          <label className="text-sm">風格模板
            <select className="mt-1 w-full rounded-lg border p-2" value={settings.styleTemplate} onChange={(e) => setSettings((s) => ({ ...s, styleTemplate: e.target.value as ProcessRequest['styleTemplate'] }))}>
              <option value="warmCute">溫暖可愛</option>
              <option value="formal">正式學習回饋</option>
              <option value="social">社群短影片感</option>
            </select>
          </label>
          <label className="text-sm">註解密度
            <select className="mt-1 w-full rounded-lg border p-2" value={settings.annotationDensity} onChange={(e) => setSettings((s) => ({ ...s, annotationDensity: e.target.value as ProcessRequest['annotationDensity'] }))}>
              <option value="low">少</option>
              <option value="medium">中</option>
              <option value="high">多</option>
            </select>
          </label>
          <label className="text-sm">字卡切換
            <select className="mt-1 w-full rounded-lg border p-2" value={settings.captionToggle} onChange={(e) => setSettings((s) => ({ ...s, captionToggle: e.target.value as ProcessRequest['captionToggle'] }))}>
              <option value="on">開</option>
              <option value="off">關</option>
            </select>
          </label>
          <label className="text-sm">音訊設定
            <select className="mt-1 w-full rounded-lg border p-2" value={settings.audioMode} onChange={(e) => setSettings((s) => ({ ...s, audioMode: e.target.value as ProcessRequest['audioMode'] }))}>
              <option value="original">保留原音</option>
              <option value="original_with_bgm">原音 + 輕背景音樂</option>
              <option value="mute">靜音</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">3) 片段輸入（可留空採平均抽樣）</h2>
        <textarea
          className="h-36 w-full rounded-lg border border-slate-300 p-3 font-mono text-sm"
          value={segmentsRaw}
          onChange={(e) => setSegmentsRaw(e.target.value)}
        />
        <p className="text-sm text-slate-500">格式：每行一段，例如 00:10 - 00:18</p>
      </section>

      {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <button onClick={() => void onProcess()} disabled={loading} className="rounded-xl bg-brand-500 px-5 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-60">
        {loading ? '處理中...' : '開始轉換'}
      </button>
    </div>
  );
}
