import { CreateVideoForm } from '@/components/create-video-form';

export default function CreatePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">建立影片</h1>
      <p className="text-slate-600">上傳影片、設定風格與限制，產出給家長的課後回顧短影片。</p>
      <CreateVideoForm />
    </section>
  );
}
