# GitHub Copilot Instructions

GitHub Copilot によるコードレビュー時に重点確認すべき点をまとめる。開発手順の網羅ではなく、レビュー観点に絞る。

## プロジェクト概要

- PeX の投資案件・定期預金案件をクロールし、新規案件やステータス変更を Discord に通知する TypeScript 製クローラー。
- エントリーポイントは `src/main.ts`。設定管理は `src/config.ts`（`PexConfiguration`）、通知済み状態の永続化は `src/notified.ts`（`Notified`）。

## 技術スタック（レビュー時の前提）

- 言語: TypeScript / パッケージマネージャー: pnpm
- HTTP 取得: ネイティブ `fetch`（外部 HTTP クライアントライブラリは使用しない）
- HTML 解析: cheerio（`load`）
- Discord 通知・設定・ロガー: `@book000/node-utils`（`Discord` / `ConfigFramework` / `Logger`）
- テスト: jest

## 重点レビュー観点

- **型安全性**: `skipLibCheck: true` による型チェック回避や `any` での握りつぶしを見つけたら指摘する。
- **エラーハンドリング**: `getList` のように外部レスポンス（HTTP ステータス、DOM 構造）に依存する箇所は、要素欠落時に適切に例外を投げているか確認する。セレクタ（`ul.anken-list`、`div.status` の `s1`/`s2` 等）に依存する変更は壊れやすいので注意する。
- **機密情報**: `data/config.json` の Webhook URL・トークンなどをコミットやログへ出力していないか確認する。
- **通知の冪等性**: `Notified` による重複通知の抑止ロジック（`isNotified` / `isExists` / `setNotified`）を壊していないか確認する。
- **設定スキーマ**: 設定構造（`src/config.ts`）を変更した場合、`pnpm generate-schema` による `schema/Configuration.json` の更新が伴っているか確認する（`schema/` が無ければ作成が必要）。

## 強制されている規約

- フォーマット: Prettier / Linter: ESLint（`pnpm lint` が CI で実行される）。整形・lint 差分は指摘対象。
- コミットメッセージ・PR タイトルは [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)（`<description>` は日本語）。
- 日本語と英数字の間には半角スペースを入れる。
- 関数・インターフェースには JSDoc を日本語で記載する。
- コメントは日本語、エラーメッセージは英語。

## フラグすべきでない既知パターン

- ネイティブ `fetch` の直接利用（HTTP クライアントライブラリの導入を提案しない）。
- ログメッセージ先頭の絵文字（`✨` / `❌` / `🎉` 等）は既存の様式であり、除去を提案しない。
