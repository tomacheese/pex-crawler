import { ConfigFramework } from '@book000/node-utils'

/**
 * Discord 通知先の設定。Webhook URL、またはトークンとチャンネル ID のいずれかを指定する。
 */
interface Config {
  discord: {
    webhookUrl?: string
    token?: string
    channelId?: string
  }
}

/**
 * Discord 通知先の設定管理クラス。discord がオブジェクトであることと、各項目が文字列または未指定であることを検証する。
 */
export class PexConfiguration extends ConfigFramework<Config> {
  protected validates(): Record<string, (config: Config) => boolean> {
    return {
      'discord is required': (config) => !!config.discord,
      'discord is object': (config) => typeof config.discord === 'object',
      'discord.webhookUrl is string or undefined': (config) =>
        typeof config.discord.webhookUrl === 'string' ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        config.discord.webhookUrl === undefined,
      'discord.token is string or undefined': (config) =>
        typeof config.discord.token === 'string' ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        config.discord.token === undefined,
      'discord.channelId is string or undefined': (config) =>
        typeof config.discord.channelId === 'string' ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        config.discord.channelId === undefined,
    }
  }
}
