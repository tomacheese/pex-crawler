import { load } from 'cheerio'
import { Notified } from './notified'
import { Discord, Logger } from '@book000/node-utils'
import { PexConfiguration } from './config'
import { Item, ItemStatus, notifyItems } from './notify'

/**
 * PeX の案件一覧ページを取得し、案件情報を抽出する。
 * @param url - 案件一覧ページの URL
 * @returns 抽出した案件一覧
 * @throws HTTP 取得に失敗した場合、または必要な要素が見つからない場合
 */
async function getList(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`)
  const html = await res.text()
  const $ = load(html)

  // ul.anken-list > a が 1 案件。href が案件の URL
  // div.status のクラス (s1 / s2) でステータスを判別
  // h2 が案件名

  const items: Item[] = []
  $('ul.anken-list > a').each((_, element) => {
    const statusClass = $(element).find('div.status').attr('class')
    if (!statusClass) {
      throw new Error('statusClass is not found')
    }
    const status = statusClass.includes('s1') ? ItemStatus.s1 : ItemStatus.s2

    const title = $(element).find('h2').text()
    if (!title) {
      throw new Error('title is not found')
    }
    const url = $(element).attr('href')
    if (!url) {
      throw new Error('url is not found')
    }

    items.push({
      status,
      title,
      path: url,
    })
  })

  return items
}

/**
 * 設定を読み込み、案件を取得して Discord に通知する。
 */
async function main() {
  const logger = Logger.configure('main')
  logger.info('✨ main()')

  const config = new PexConfiguration('./data/config.json')
  config.load()
  if (!config.validate()) {
    logger.error('❌ Config is invalid')
    for (const failure of config.getValidateFailures()) {
      logger.error('- ' + failure)
    }
    return
  }

  const discordConfig = config.get('discord')
  const discord = discordConfig.webhookUrl
    ? new Discord({
        webhookUrl: discordConfig.webhookUrl,
      })
    : discordConfig.token && discordConfig.channelId
      ? new Discord({
          token: discordConfig.token,
          channelId: discordConfig.channelId,
        })
      : null
  if (discord === null) {
    throw new Error('Discord config is invalid')
  }

  const notifiedPath = process.env.NOTIFIED_PATH ?? 'data/notified.json'
  const notified = new Notified(notifiedPath)
  const isFirst = notified.isFirst()
  if (isFirst) {
    logger.info('First run: Skip notification')
  }

  const investmentUrl = 'https://pex.jp/investments'
  const timeDepositUrl = 'https://pex.jp/time_deposit'

  const investmentList = await getList(investmentUrl)
  logger.info(`investmentList: ${investmentList.length} items`)
  const timeDepositList = await getList(timeDepositUrl)
  logger.info(`timeDepositList: ${timeDepositList.length} items`)

  // 新しく出てきたとき、ステータスに変化があったときに通知する
  const items = [...investmentList, ...timeDepositList]
  await notifyItems(items, discord, notified, logger, isFirst)

  logger.info('🎉 Done')
}

;(async () => {
  await main()
})()
