# 種まき支援AR（SeedAR）

中学校技術科「生物育成の技術」の授業で使う、播種支援用 WebAR アプリです。
生徒が選んだプランターと播種方法に応じて、適切な播種位置をプランター上に AR 表示します。

## 動作環境

- 端末：Chromebook
- ブラウザ：Google Chrome（最新安定版）
- 必要：Web カメラ、十分な照明、印刷した AR マーカー

## 開発状況（v1.0 開発中）

機能①「種まき支援機能」のみ実装予定。機能②③（間引き／収穫の目安サイズ）は将来拡張。

## 関連ドキュメント

- [`SPECIFICATION.md`](./SPECIFICATION.md) — 仕様書 v1.2
- [`DEPLOY.md`](./DEPLOY.md) — GitHub Pages へのデプロイ手順
- [`DEVICE_TEST.md`](./DEVICE_TEST.md) — Chromebook 実機テストチェックリスト
- [`assets/markers/print.html`](./assets/markers/print.html) — ARマーカーの印刷ページ
- [`tests/calculator.test.html`](./tests/calculator.test.html) — 計算ロジックの単体テスト

## ローカルで開く方法

WebAR はカメラ権限のため、ファイルを直接ダブルクリックでは動きません。
以下のいずれかでローカルサーバーを立ち上げてください。

**おすすめ：同梱の Node サーバー**（追加インストール不要）

```powershell
node tools/serve.js 8765
```

ブラウザで `http://127.0.0.1:8765/` を開きます。

**代替：npx http-server**

```powershell
npx http-server . -p 8080
```

> PowerShell の実行ポリシーで `npx.ps1` がブロックされる場合は、上記の `node tools/serve.js` を使ってください。

## ディレクトリ構成

```
seedAR/
├── index.html        # タイトル画面
├── planter.html      # プランター選択画面
├── method.html       # 播種方法選択画面
├── ar.html           # AR 表示画面
├── css/style.css
├── js/
│   ├── main.js          # 画面遷移制御
│   ├── calculator.js    # 播種位置計算
│   └── ar-renderer.js   # AR 描画
├── data/
│   ├── crops.json       # 作物データ
│   └── planters.json    # プランターデータ
├── assets/
│   ├── images/          # UI 画像
│   └── markers/         # AR マーカー画像
├── tests/               # 計算ロジックの単体テスト
├── tools/serve.js       # 開発用ローカル HTTP サーバー
├── README.md
└── SPECIFICATION.md     # 仕様書 v1.2
```

詳細は `SPECIFICATION.md` を参照。
