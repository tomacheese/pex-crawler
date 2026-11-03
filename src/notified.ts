import fs from 'node:fs'

/**
 * 通知済み案件の状態(案件パス → ステータス)をファイルに永続化するクラス。
 */
export class Notified {
  private path: string
  private notified: Record<string, string> = {}

  constructor(path: string) {
    this.path = path

    if (fs.existsSync(path)) {
      this.load()
    }
  }

  /** 指定した案件が通知済み状態に記録されているか。 */
  public isExists(key: string): boolean {
    return Object.hasOwn(this.notified, key)
  }

  /** 指定した案件が、同じステータスで通知済みか。 */
  public isNotified(key: string, value: string): boolean {
    return this.notified[key] === value
  }

  /** 指定した案件の通知済みステータスを返す。未記録なら undefined。 */
  public getNotified(key: string): string | undefined {
    return this.notified[key]
  }

  /** 指定した案件の通知済みステータスをメモリ上に記録する。保存は `save` で行う。 */
  public setNotified(key: string, value: string): void {
    this.notified[key] = value
  }

  /** 通知済みファイルが未作成の初回実行かどうか。 */
  public isFirst(): boolean {
    return !fs.existsSync(this.path)
  }

  /** 通知済みファイルを読み込む。 */
  public load(): void {
    this.notified = JSON.parse(fs.readFileSync(this.path, 'utf8'))
  }

  /** 通知済み状態をファイルに書き出す。 */
  public save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.notified, null, 2))
  }
}
