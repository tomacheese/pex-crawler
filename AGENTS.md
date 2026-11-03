# AGENTS.md

## 言語ルール

- 会話は日本語で行う。
- 成果物（コミットの説明、PR / Issue のタイトル・本文、レビューコメント、コードコメント、JSDoc、ドキュメント）は日本語で記載する。
- 日本語と英数字の間には半角スペースを入れる。
- 例外: UI 文字列、引用、技術的識別子、生成ファイル、外部テキスト。エラーメッセージは英語、`package.json` は英語とする。
- Git 履歴は書き換えない。

## プロジェクト概要

PeX の投資案件（`/investments`）・定期預金案件（`/time_deposit`）をクロールし、新規案件やステータス変更（受付中 ⇔ 受付終了）を Discord に通知する TypeScript 製クローラー。

## 開発コマンド

```bash
pnpm install     # 依存関係のインストール
pnpm start       # 実行
pnpm dev         # 開発モード（ファイル変更を監視）
pnpm test        # テスト (jest)
pnpm lint        # prettier / eslint / tsc
pnpm fix         # prettier / eslint の自動修正
```

CI は [book000/templates](https://github.com/book000/templates) の共通ワークフローで lint とテストを実行する。Node.js のバージョンは `.node-version` を参照する。

## 構成

- `src/main.ts`: エントリーポイント。`getList`（fetch + cheerio で案件抽出）から通知までの流れを管理する。
- `src/notify.ts`: `notifyItems`。未通知の案件を Discord に送信し、1 件ごとに状態を保存する。送信失敗時は通知済みにせず次回再送する。
- `src/notified.ts`: `Notified`。通知済み状態（案件パス → ステータス）の永続化。
- `src/config.ts`: `PexConfiguration`。`@book000/node-utils` の `ConfigFramework` による設定の読み込みと検証。
- `data/`（リポジトリ管理外）: `config.json`（Discord 設定。Webhook URL、またはトークンとチャンネル ID）と `notified.json`（保存先は環境変数 `NOTIFIED_PATH` で変更可）。Docker では `/data` にマウントされる。

## 規約

- コミットは [Conventional Commits](https://www.conventionalcommits.org/)（type は英語、description は日本語）。ブランチは [Conventional Branch](https://conventional-branch.github.io) の短縮形（`feat`、`fix` など）。
- Renovate が作成した PR には追加コミットしない。
- `skipLibCheck` で型エラーを回避しない。
- 関数・インターフェースには日本語の JSDoc を付ける。
- ログメッセージ先頭の絵文字は既存の様式に合わせる。
- ロジックを変更したら、可能な限りテストを追加・更新する。
- `data/config.json` の Webhook URL やトークンなどの機密情報をコミットしない。ログ出力に認証情報や個人情報を含めない。
- HTTP 取得はネイティブ `fetch`、HTML 解析は `cheerio` を使う。
- 注意: `pnpm generate-schema` は参照先の型 `ConfigInterface` が `src/config.ts` に存在しないため、現状は失敗する。設定構造を変更しても `schema/Configuration.json` は管理されていない。

## PR 前の確認

1. `pnpm lint` と `pnpm test` が通ること。
2. 機密情報が含まれていないこと。
