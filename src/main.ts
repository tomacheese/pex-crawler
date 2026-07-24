import { load } from 'cheerio'
import { Notified } from './notified'
import { Discord, Logger } from '@book000/node-utils'
import { PexConfiguration } from './config'
import { Item, ItemStatus, notifyItems } from './notify'

async function getList(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`)
  const html = await res.text()
  const $ = load(html)

  // ul.anken-list > a
  // div.status のクラスが s1, s2 で状況を判別
  // div.info h2 で案件名
  // aタグのhrefで案件のURL

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
