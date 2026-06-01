# General Industry Analysis Agent

通用產業分析 Agent — 輸入產業名稱，Claude 產生研究架構，確認後輸出完整 Markdown 報告。

## 功能

1. 輸入產業、地理範圍、分析目的、時間尺度、輸出深度、語言
2. 勾選 18 個產業分析重點模組（可全選/自訂）
3. 選擇特殊產業框架（SaaS、半導體、平台、製造業等，或 Auto-detect）
4. Claude 生成逐頁研究架構（含 value chain、major players、每頁 core question / hypothesis）
5. 前端可編輯、刪除、移動、複製每一頁
6. 確認架構後 Claude 搜尋資料並輸出完整 Markdown 報告
7. 預覽報告、查看 sources、查看 data gaps、下載 `.md` 檔

## 安裝

```bash
npm install
```

## 設定 API Key

複製 `.env.example` 為 `.env.local`，填入你的 Anthropic API Key：

```bash
cp .env.example .env.local
```

編輯 `.env.local`：

```env
ANTHROPIC_API_KEY=sk-ant-...
```

## 啟動開發

```bash
npm run dev
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000)

## 使用流程

1. **Step 1**：填寫產業名稱、地理範圍、分析目的，勾選分析重點，按「產生研究架構」
2. **Step 2**：檢視並編輯 Claude 產生的研究架構（每頁可展開編輯所有欄位）
3. **Step 3**：確認後 Claude 搜尋資料並撰寫完整 Markdown 報告，可下載 `.md`

## Claude API 注意事項

- API Key 只在 server-side 使用，不會暴露到前端
- 報告生成使用 `claude-sonnet-4-6`，max_tokens 16000
- 若帳號支援 `web_search_20250305` tool，系統會自動啟用網路搜尋
- 若不支援，系統會退到純語言模型生成（仍可產出完整報告）
- Framework 生成約 15–30 秒；報告生成約 1–3 分鐘

## 未來可擴充功能

- 登入系統 + 研究歷史紀錄
- 資料庫儲存報告（目前只在前端 state 暫存）
- PPT / Word / PDF 輸出
- 多人協作
- 更細緻的 streaming 進度顯示
- 自訂 prompt template
