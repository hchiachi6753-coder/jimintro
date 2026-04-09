# Lesson Recap Studio (MVP)

把「兒童上課錄影」自動轉成適合傳給家長看的學習回顧短影片。

## 專案用途
- 上傳 `mp4/mov` 課程錄影
- 設定比例、長度、風格、註解密度、音訊模式
- 輸入手動片段（或留空採平均抽樣）
- 產生保留原音的短影片 `mp4`，並同時輸出 `zip`

## 技術架構
- Frontend: Next.js + TypeScript + Tailwind
- Backend: Next.js Route Handlers (API)
- Video pipeline: ffmpeg / ffprobe
- Storage: local filesystem (`/storage`)

## 安裝方式
```bash
npm install
cp .env.example .env
```

## ffmpeg 安裝
請先安裝 `ffmpeg` 與 `ffprobe`：

- macOS (Homebrew)
```bash
brew install ffmpeg
```

- Ubuntu / Debian
```bash
sudo apt update && sudo apt install -y ffmpeg
```

- Windows (choco)
```bash
choco install ffmpeg
```

若指令不在 PATH，可在 `.env` 設定：
```env
FFMPEG_BIN=/your/path/to/ffmpeg
FFPROBE_BIN=/your/path/to/ffprobe
```

## 本機啟動
```bash
npm run dev
```
開啟 `http://localhost:3000`

## 使用流程
1. 進入 `/create`
2. 上傳影片（mp4/mov）
3. 設定輸出條件
4. （可選）輸入片段，每行 `mm:ss - mm:ss`
5. 按下「開始轉換」
6. 跳轉結果頁預覽與下載 `mp4 / zip`

## 假資料 / 測試影片範例
1. 生成測試影片：
```bash
./scripts/create-sample-video.sh
```
2. 片段可使用：`tmp/sample-segments.txt`

## 專案結構
```
app/
components/
lib/
  config/
  templates/
  video/
public/
storage/
tmp/
scripts/
```

## 已知限制
- 目前註解為規則模板，尚未串接 LLM。
- 平均抽樣策略為簡化版本，未做畫面內容偵測。
- 目前流程為單機同步處理，大檔案處理較慢。

## 下一步擴充
- 串接 LLM 自動生成段落標題與家長註解
- 自動偵測高互動片段
- 多品牌模板系統
- 批次處理多支影片
- 雲端儲存（S3/GCS）
- 背景任務 queue（BullMQ / Cloud Tasks）
- 使用者帳號與權限
