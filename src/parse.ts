import { load } from 'cheerio'
import { Item, ItemStatus } from './notify'

/** 案件一覧の HTML を解析する。一覧構造や案件情報が不正な場合は例外を送出する。 */
export function parseList(html: string): Item[] {
  const $ = load(html)
  const list = $('ul.anken-list')
  if (list.length === 0) {
    throw new Error('anken-list is not found')
  }

  const items: Item[] = []
  list.children('a').each((_, element) => {
    const classes =
      $(element).find('div.status').attr('class')?.split(/\s+/) ?? []
    const statuses = classes.filter(
      (className) => className === 's1' || className === 's2'
    )
    if (statuses.length !== 1) {
      throw new Error('status class is invalid')
    }
    const status = statuses[0] === 's1' ? ItemStatus.s1 : ItemStatus.s2

    const title = $(element).find('h2').text()
    if (!title) {
      throw new Error('title is not found')
    }
    const url = $(element).attr('href')
    if (!url) {
      throw new Error('url is not found')
    }

    items.push({ status, title, path: url })
  })

  return items
}
