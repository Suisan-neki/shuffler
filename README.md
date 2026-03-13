# フラッシュカード

[![Deploy](https://github.com/Suisan-neki/shuffler/actions/workflows/deploy.yml/badge.svg)](https://github.com/Suisan-neki/shuffler/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-対応-5a0fc8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

PDF や画像をアップロードして、シャッフル再生できるフラッシュカード学習アプリです。
データはすべてブラウザのローカルストレージ（IndexedDB）に保存されるため、サーバーへのアップロードは一切ありません。

## 機能

- **PDF・画像の取り込み** — PDF はページごとに画像へ変換して読み込み
- **シャッフル再生** — カードをランダム順に表示
- **枚数・速度の設定** — 1セッションで表示する枚数と表示間隔を調整可能
- **繰り返しモード** — 同じカードが何度も出現するランダム抽選モード
- **メモ機能** — 各カードにメモを記録（IndexedDB に永続化）
- **複数セット管理** — 複数のカードセットを切り替えて使用
- **PWA 対応** — ブラウザからデスクトップアプリとしてインストール可能（オフライン動作）

## 使い方

### ① ブラウザで開いてそのまま使う（一番かんたん）

リポジトリ上部の **About → Website** のリンクを開くだけで使えます。
インストール不要、アカウント登録不要です。

### ② デスクトップアプリとしてインストールする（PWA）

ブラウザで開いた後、アドレスバー右端に表示される **「インストール」ボタン**（↓ マーク）をクリックするだけで、アプリとしてインストールできます。

- Node.js、git、ターミナル操作は一切不要
- オフラインでも動作します

> **Chrome / Edge** の場合はアドレスバー右端に ⊕ アイコンが出ます。Safari（Mac）は共有ボタン →「ホーム画面に追加」です。

---

### ③ ソースからローカルで動かす（開発者向け）

<details>
<summary>手順を見る</summary>

**必要なもの:** [Node.js](https://nodejs.org/) LTS 版

```bash
git clone https://github.com/Suisan-neki/shuffler.git
cd shuffler
npm install
npm run dev
# → http://localhost:5173 で起動
```

</details>

## 技術スタック

| 分類 | 技術 |
|------|------|
| フレームワーク | React 18 + TypeScript |
| ビルドツール | Vite |
| スタイリング | Tailwind CSS |
| 状態管理 | Zustand |
| データ保存 | IndexedDB（ブラウザ内・完全ローカル） |
| PDF 処理 | PDF.js |
| PWA | vite-plugin-pwa + Workbox |

## ライセンス

[MIT](LICENSE)
