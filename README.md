# pex-crawler

[PeX](https://pex.jp/) の投資案件・定期預金案件を監視し、新規案件やステータス変更を Discord に通知するクローラーです。

## 機能

- PeX の投資案件（`/investments`）と定期預金案件（`/time_deposit`）を定期的にクロール
- 新規案件の追加を検知して Discord に通知
- 案件のステータス変更（受付中 ⇔ 受付終了）を検知して Discord に通知

## 必要要件

- Node.js（`.node-version` 参照）
- pnpm

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/tomacheese/pex-crawler.git
cd pex-crawler

# 依存関係のインストール
pnpm install
```

## 設定

`data/config.json` を作成し、Discord の通知設定を行います。

### Webhook URL を使用する場合

```json
{
  "discord": {
    "webhookUrl": "https://discord.com/api/webhooks/..."
  }
}
```

### Bot Token を使用する場合

```json
{
  "discord": {
    "token": "your-bot-token",
    "channelId": "channel-id"
  }
}
```

## 使用方法

```bash
# 実行
pnpm start

# 開発モード（ファイル変更を監視）
pnpm dev
```

## Docker での実行

```bash
docker compose up -d
```

## ライセンス

このプロジェクトは [MIT](LICENSE) ライセンスの下で公開されています。
