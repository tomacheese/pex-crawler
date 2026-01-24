# GEMINI.md

## 目的
- Gemini CLI 向けのコンテキストと作業方針を定義する。

## 出力スタイル
- 言語: 日本語
- トーン: 簡潔で事実ベース
- 形式: Markdown

## 共通ルール
- 会話は日本語で行う。
- PR とコミットは Conventional Commits に従う。
- PR タイトルとコミット本文の言語: PR タイトルは Conventional Commits 形式（英語推奨）。PR 本文は日本語。コミットは Conventional Commits 形式（description は日本語）。
- 日本語と英数字の間には半角スペースを入れる。

## プロジェクト概要
- 目的: [PeX](https://pex.jp/) の投資案件・定期預金案件を監視し、新規案件やステータス変更を Discord に通知するクローラーです。
- 主な機能: PeX の投資案件（`/investments`）と定期預金案件（`/time_deposit`）を定期的にクロール / 新規案件の追加を検知して Discord に通知 / 案件のステータス変更（受付中 ⇔ 受付終了）を検知して Discord に通知

## コーディング規約
- フォーマット: 既存設定（ESLint / Prettier / formatter）に従う。
- 命名規則: 既存のコード規約に従う。
- コメント言語: 日本語
- エラーメッセージ: 英語

## 開発コマンド
```bash
# 依存関係のインストール
pnpm install

# 開発
pnpm dev

# テスト
pnpm test

# Lint
pnpm lint
```

## 注意事項
- 認証情報やトークンはコミットしない。
- ログに機密情報を出力しない。
- 既存のプロジェクトルールがある場合はそれを優先する。

## リポジトリ固有