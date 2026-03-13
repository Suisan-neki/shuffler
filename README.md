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

### ① オンラインで使う（インストール不要・一番かんたん）

リポジトリ上部の **About → Website** のリンクにアクセスするだけで使えます。

---

### ② 自分のパソコンにインストールして使う

#### 1. Node.js をインストールする

[https://nodejs.org/](https://nodejs.org/) を開き、**LTS** と書かれたバージョンをダウンロードしてインストールしてください。

> すでにインストール済みの場合はスキップ。`node -v` をターミナルで実行してバージョンが表示されれば OK です。

#### 2. このリポジトリをダウンロードする

**Git を使う場合（推奨）:**

```bash
git clone https://github.com/Suisan-neki/shuffler.git
cd shuffler
```

**Git を使わない場合:**

このページ右上の緑の **Code** ボタン → **Download ZIP** でダウンロードし、ZIP を展開してください。

#### 3. 依存パッケージをインストールする

ターミナル（Mac は「ターミナル」、Windows は「コマンドプロンプト」または「PowerShell」）で、展開したフォルダに移動してから実行します。

```bash
npm install
```

#### 4. アプリを起動する

```bash
npm run dev
```

ターミナルに表示される `http://localhost:5173` をブラウザで開くと使えます。

> 終了するときはターミナルで `Ctrl + C` を押してください。

---

### ビルド（静的ファイルとして書き出す）

```bash
npm run build
# dist/ フォルダに成果物が生成されます
```

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
