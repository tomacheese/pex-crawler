import { load } from 'cheerio'
import { Notified } from './notified'
import { Discord, Logger } from '@book000/node-utils'
import { PexConfiguration } from './config'

const ItemStatus = {
  s1: '受付中',
  s2: '受付終了',
} as const

interface Item {
  status: string
  title: string
  path: string
}

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
    }

    notified.setNotified(item.path, item.status)
  }

  notified.save()
  logger.info('📝 Save notified')

  logger.info('🎉 Done')
}

;(async () => {
  await main()
})()
