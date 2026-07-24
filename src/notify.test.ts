import { Discord, Logger } from '@book000/node-utils'
import { Notified } from './notified'
import { Item, notifyItems } from './notify'

jest.mock('./notified')

describe('notifyItems', () => {
  const items: Item[] = [
    { status: '受付中', title: 'item1', path: '/item1' },
    { status: '受付中', title: 'item2', path: '/item2' },
    { status: '受付中', title: 'item3', path: '/item3' },
  ]

  function createNotifiedMock(): jest.Mocked<Notified> {
    return {
      isExists: jest.fn().mockReturnValue(false),
      isNotified: jest.fn().mockReturnValue(false),
      getNotified: jest.fn().mockReturnValue(undefined),
      setNotified: jest.fn(),
      isFirst: jest.fn().mockReturnValue(false),
      load: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Notified>
  }

  function createLoggerMock(): jest.Mocked<Logger> {
    return {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('saves the notified state immediately after each item is processed', async () => {
    const notified = createNotifiedMock()
    const logger = createLoggerMock()
    const discord = {
      sendMessage: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Discord>

    const promise = notifyItems(items, discord, notified, logger, false)
    await jest.runAllTimersAsync()
    await promise

    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock method reference
    expect(notified.save).toHaveBeenCalledTimes(items.length)
    expect(notified.setNotified.mock.invocationCallOrder[0]).toBeLessThan(
      notified.save.mock.invocationCallOrder[0]
    )
  })

  it('continues processing remaining items when sendMessage rejects, without marking the failed item as notified', async () => {
    const notified = createNotifiedMock()
    const logger = createLoggerMock()
    const discord = {
      sendMessage: jest
        .fn()
        .mockRejectedValueOnce(new Error('429: rate limited'))
        .mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Discord>

    const promise = notifyItems(items, discord, notified, logger, false)
    await jest.runAllTimersAsync()
    await expect(promise).resolves.toBeUndefined()

    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock method reference
    expect(discord.sendMessage).toHaveBeenCalledTimes(items.length)
    // 送信に失敗した item1 は次回実行時に再送されるよう、通知済みとして記録されない
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock method reference
    expect(notified.setNotified).toHaveBeenCalledTimes(items.length - 1)
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock method reference
    expect(notified.setNotified).not.toHaveBeenCalledWith(
      items[0].path,
      items[0].status
    )
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock method reference
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('item1'),
      expect.any(Error)
    )
  })

  it('waits between consecutive sendMessage calls', async () => {
    const notified = createNotifiedMock()
    const logger = createLoggerMock()
    const discord = {
      sendMessage: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Discord>

    const promise = notifyItems(items, discord, notified, logger, false)

    // 1件目の送信は待機なしで行われる
    await Promise.resolve()
    await Promise.resolve()
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock method reference
    expect(discord.sendMessage).toHaveBeenCalledTimes(1)

    // 2件目以降は送信間隔だけ待機してから送信される
    await jest.advanceTimersByTimeAsync(999)
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock method reference
    expect(discord.sendMessage).toHaveBeenCalledTimes(1)
    await jest.advanceTimersByTimeAsync(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock method reference
    expect(discord.sendMessage).toHaveBeenCalledTimes(2)

    await jest.runAllTimersAsync()
    await promise
  })

  it('does not send messages on the first run, but still records the state', async () => {
    const notified = createNotifiedMock()
    const logger = createLoggerMock()
    const discord = {
      sendMessage: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Discord>

    await notifyItems(items, discord, notified, logger, true)

    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock method reference
    expect(discord.sendMessage).not.toHaveBeenCalled()
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock method reference
    expect(notified.setNotified).toHaveBeenCalledTimes(items.length)
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock method reference
    expect(notified.save).toHaveBeenCalledTimes(items.length)
  })
})
