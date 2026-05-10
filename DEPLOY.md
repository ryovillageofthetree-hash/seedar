# GitHub Pages へのデプロイ手順

種まき支援AR を GitHub Pages で公開するための手順です。
プログラミング初心者でも進められるよう、画面操作レベルで記述しています。

> **なぜ GitHub Pages？**
> WebARはカメラ権限のため HTTPS でホスティングする必要があり、GitHub Pages は無料・自動 HTTPS 対応のため学校現場で使いやすいです。

## 0. 事前準備

- [ ] Git がインストールされている（`git --version` でバージョン表示されればOK）
- [ ] GitHub アカウントを持っている（無ければ <https://github.com/signup> で作成）

## 1. ローカル Git リポジトリの初期化

`seedAR/` フォルダで PowerShell を開き、以下を実行：

```powershell
git init
git add .
git commit -m "initial commit: SeedAR v1.0"
```

> **OneDrive 配下での注意**：OneDrive が同期中だと `git add` でロックエラーが出ることがあります。エラーが出たら一度 OneDrive の同期を一時停止（タスクトレイの OneDrive アイコンから「同期の一時停止」）してから再実行してください。

## 2. GitHub にリポジトリを作成

1. <https://github.com/new> を開く
2. **Repository name**: `seedar`（または好きな名前）
3. **Public** を選択（GitHub Pages の無料利用には Public 必須）
4. **README** や `.gitignore`、`license` のチェックは **すべて外す**（既にローカルにあるため）
5. 緑の「**Create repository**」ボタンをクリック

## 3. ローカルリポジトリを GitHub に push

GitHub のリポジトリ作成後の画面に表示されるコマンドのうち、「**…or push an existing repository from the command line**」のブロックを使います。あなたの GitHub ユーザー名が `your-name` の場合：

```powershell
git remote add origin https://github.com/your-name/seedar.git
git branch -M main
git push -u origin main
```

> 初回 push 時にユーザー名・パスワード（または Personal Access Token）の入力を求められます。GitHub では 2021 年からパスワード認証が廃止されており、**Personal Access Token (PAT)** が必要です。
>
> PAT の作成手順：<https://github.com/settings/tokens> → 「Generate new token (classic)」 → 「repo」スコープにチェック → 「Generate token」 → 表示されたトークンをコピー → push 時の「password」欄に貼付け。

## 4. GitHub Pages を有効化

1. GitHub のリポジトリページを開く
2. 上部タブの「**Settings**」をクリック
3. 左サイドバーの「**Pages**」をクリック
4. **Source** を「**Deploy from a branch**」に設定
5. **Branch** で「**main**」「**/ (root)**」を選択 → 「**Save**」
6. 数分後、ページ上部に「Your site is live at `https://your-name.github.io/seedar/`」と表示されます

## 5. 動作確認

公開 URL（例：`https://your-name.github.io/seedar/`）を Chromebook の Chrome で開き、

1. タイトル画面 →「はじめる」
2. プランター選択
3. 種まき方法選択
4. AR 画面でカメラ許可 → 印刷した Hiro マーカーをカメラに映す
5. プランター上に播種位置の円柱（緑または青）が表示されればOK

実機テストの詳細チェックリストは [`DEVICE_TEST.md`](./DEVICE_TEST.md) を参照。

## 6. 更新の反映

仕様変更や修正後は次の3コマンドだけ：

```powershell
git add .
git commit -m "変更内容の簡単な説明"
git push
```

GitHub Pages は数分以内に自動的に新バージョンを反映します。

## トラブルシューティング

### push 時に「Authentication failed」と出る
PAT が必要です。手順 3 の補足を参照。

### Pages にアクセスしても 404 が出る
- ブランチが `main`、フォルダが `/ (root)` になっているか確認
- 公開直後は数分かかることがあります（最大 10 分）
- リポジトリが Public か確認

### AR 画面でカメラが起動しない
- URL が `https://...` で始まっているか確認（`http://` ではカメラ権限が下りない）
- Chrome の URL バー左の鍵マーク → サイトの設定 → カメラを「許可」に
- 詳細は `DEVICE_TEST.md` のトラブルシューティングへ

### 円柱が表示されない／位置がずれる
- マーカーが 50mm × 50mm で印刷されているか測定
- マーカーの上辺がプランター長辺と平行か確認
- 教室の照明が十分明るいか確認（暗所での認識は不安定）
