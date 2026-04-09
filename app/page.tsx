import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="card space-y-4">
        <h1 className="text-3xl font-bold">兒童課後學習回顧短影片產生器</h1>
        <p className="text-slate-600">
          上傳上課錄影，設定風格與片段，即可自動生成可傳給家長的學習回顧短影片（保留原音，輸出 MP4 + ZIP）。
        </p>
        <Link href="/create" className="inline-flex rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-700">
          開始建立影片
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          '上傳 mp4/mov 並自動解析影片資訊',
          '選擇比例、長度、模板與音訊設定',
          '自動拼接片段、套版、輸出下載'
        ].map((item) => (
          <div key={item} className="card text-sm text-slate-700">{item}</div>
        ))}
      </div>
    </section>
  );
}
