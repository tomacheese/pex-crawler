import { Notified } from './notified'
import { Discord, Logger } from '@book000/node-utils'

export const ItemStatus = {
  s1: '受付中',
  s2: '受付終了',
} as const

export interface Item {
  status: string
  title: string
  path: string
}

/**
 * Discord API のレート制限を避けるための送信間隔(ミリ秒)
 */
export const DISCORD_SEND_INTERVAL_MS = 1000

/**
 * 指定したミリ秒だけ待機する。
 * @param ms - 待機時間(ミリ秒)
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 未通知の案件を Discord に通知し、送信に成功するたびに通知結果を保存する。
 * 送信に失敗した案件は通知済みとして記録せず、次回実行時に再送を試みる。
 * @param items - 通知対象の候補となる案件一覧
 * @param discord - 送信に使用する Discord クライアント
 * @param notified - 通知済み状態の永続化を管理するインスタンス
 * @param logger - ログ出力に使用するロガー
 * @param isFirst - 初回実行かどうか(true の場合、通知は送信せず状態のみ記録する)
 */
export async function notifyItems(
  items: Item[],
  discord: Discord,
  notified: Notified,
  logger: Logger,
  isFirst: boolean
): Promise<void> {
  let hasSentMessage = false
  for (const item of items) {
    if (notified.isNotified(item.path, item.status)) {
      continue
    }
    const isNew = !notified.isExists(item.path)

    const log = isNew ? `New item` : `Status changed`
    logger.info(`${log}: ${item.title} (${item.status})`)

    const title = isNew
      ? `:new:${item.title}`
      : `:arrows_counterclockwise:${item.title}`
    const previousStatus = notified.getNotified(item.path)
    const description = isNew
      ? `New item: \`${item.status}\``
      : `Status changed: \`${previousStatus}\` -> \`${item.status}\``

    if (!isFirst) {
      // Discord API のレート制限 (429) を避けるため、連続送信の間隔を空ける
      if (hasSentMessage) {
        await sleep(DISCORD_SEND_INTERVAL_MS)
      }
      hasSentMessage = true

      try {
        await discord.sendMessage({
          embeds: [
            {
              title,
              description,
              url: `https://pex.jp${item.path}`,
              color: item.status === ItemStatus.s1 ? 0x00_ff_00 : 0xff_00_00,
              timestamp: new Date().toISOString(),
            },
          ],
        })
      } catch (error) {
        // 送信に失敗した場合は通知未済のままにし、次回実行時に再送を試みる
        logger.error(
          `❌ Failed to send Discord message: ${item.title}`,
          error as Error
        )
        continue
      }
    }

    // クラッシュ時の重複通知を防ぐため、1件処理するごとに即時保存する
    notified.setNotified(item.path, item.status)
    notified.save()
  }
}
