# GitHub Copilot Instructions

## プロジェクト概要

- 目的: PeX の投資案件および定期預金案件をクロールし、更新があれば Discord に通知する
- 主な機能: PeX 案件のスクレイピング、前回の状態との比較、Discord への通知
- 対象ユーザー: 開発者（セルフホスト）

## 共通ルール

- 会話は日本語で行う。
- コミットメッセージおよび PR タイトルは [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う。
  - `<type>(<scope>): <description>` 形式
  - `<description>` は日本語で記載
- ブランチ命名は [Conventional Branch](https://conventional-branch.github.io) に従う。
  - `<type>/<description>` 形式。`<type>` は短縮形（feat, fix）を使用。
- 日本語と英数字の間には半角スペースを入れる。

## 技術スタック

- 言語: TypeScript
- パッケージマネージャー: pnpm
- 主要ライブラリ:
  - axios: HTTP クライアント
  - cheerio: HTML 解析
  - @book000/node-utils: 各種ユーティリティ（Discord 通知、設定管理、ロガーなど）
  - jest: テストフレームワーク

## 開発コマンド

```bash
# 依存関係のインストール
pnpm install

# 実行
pnpm start

# 開発（ウォッチモード）
pnpm dev

# テスト
pnpm test

# Lint / 型チェック
pnpm lint

# 自動修正
pnpm fix

# 設定スキーマの生成
# ※ 実行前に schema ディレクトリを作成しておくこと（例: mkdir -p schema）
pnpm generate-schema
```

## コーディング規約

- フォーマット: Prettier
- Linter: ESLint
- 型チェック: TypeScript (`skipLibCheck` の使用は禁止)
- 関数やインターフェースには docstring (JSDoc) を日本語で記載する。

## テスト方針

- テストフレームワーク: Jest
- テスト追加の方針: 新機能追加時やバグ修正時にテストを追加する。

## セキュリティ / 機密情報

- `data/config.json` に含まれる Discord の Webhook URL やトークンなどの機密情報は、絶対にコミットしない。
- ログに機密情報を出力しない。

## ドキュメント更新

- `README.md`

## リポジトリ固有

- 設定は `data/config.json` で管理される。
- 通知済み案件は `data/notified.json` で管理される。
- `PexConfiguration` クラスを通じて設定の検証を行っている。
