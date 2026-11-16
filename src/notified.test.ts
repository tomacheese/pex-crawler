import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Notified } from './notified'

describe('Notified', () => {
  let dir: string
  let filePath: string

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'notified-test-'))
    filePath = path.join(dir, 'notified.json')
  })

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it('save 後は最終パスにファイルが存在し、一時ファイルは残らない', () => {
    const notified = new Notified(filePath)
    notified.setNotified('/item1', '受付中')
    notified.save()

    expect(fs.existsSync(filePath)).toBe(true)
    expect(fs.existsSync(`${filePath}.tmp`)).toBe(false)
  })

  it('save した内容を新しいインスタンスで読み込める', () => {
    const notified = new Notified(filePath)
    notified.setNotified('/item1', '受付中')
    notified.setNotified('/item2', '受付終了')
    notified.save()

    const reloaded = new Notified(filePath)
    expect(reloaded.isFirst()).toBe(false)
    expect(reloaded.getNotified('/item1')).toBe('受付中')
    expect(reloaded.getNotified('/item2')).toBe('受付終了')
  })

  it('save せずに破棄した場合、次回も初回扱いになる', () => {
    const notified = new Notified(filePath)
    notified.setNotified('/item1', '受付中')

    expect(new Notified(filePath).isFirst()).toBe(true)
  })

  it('書き込みに失敗した場合は例外を伝播し、最終パスを作らない', () => {
    const notified = new Notified(path.join(dir, 'missing', 'notified.json'))
    notified.setNotified('/item1', '受付中')

    expect(() => {
      notified.save()
    }).toThrow(/ENOENT/)
    expect(fs.existsSync(path.join(dir, 'missing', 'notified.json'))).toBe(
      false
    )
  })
})
