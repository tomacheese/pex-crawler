# GitHub Copilot Instructions

プロジェクト概要・開発コマンド・規約は [AGENTS.md](../AGENTS.md) を参照する。ここではコードレビュー時の重点観点のみを記す。

## 重点レビュー観点

- **型安全性**: `skipLibCheck: true` による型チェック回避や `any` での握りつぶしを指摘する。
- **エラーハンドリング**: `getList`（`src/main.ts`）のように外部レスポンス（HTTP ステータス、DOM 構造）に依存する箇所は、要素欠落時に適切に例外を投げているか確認する。セレクタ（`ul.anken-list`、`div.status` の `s1` / `s2` など）に依存する変更は壊れやすい。
- **機密情報**: `data/config.json` の Webhook URL・トークンをコミットしていないか、またログ出力に認証情報や個人情報が含まれていないか確認する。
- **通知の冪等性**: 重複通知の抑止（`Notified` の `isNotified` / `isExists` / `setNotified`）と、`notifyItems`（`src/notify.ts`）の「送信失敗時は通知済みにしない」「1 件ごとに即時保存」を壊していないか確認する。
- **規約**: 日本語の JSDoc・コメント、エラーメッセージは英語、日本語と英数字の間の半角スペース、Conventional Commits（description は日本語）。

## フラグすべきでない既知パターン

- ネイティブ `fetch` の直接利用（HTTP クライアントライブラリの導入を提案しない）。
- ログメッセージ先頭の絵文字（`✨` / `❌` / `🎉` など）は既存の様式であり、除去を提案しない。
