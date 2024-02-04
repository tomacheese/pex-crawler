import fs from 'node:fs'

export class Notified {
  private path: string
  private notified: {
    [key: string]: string
  } = {}

  constructor(path: string) {
    this.path = path

    if (fs.existsSync(path)) {
      this.load()
    }
  }

  public isExists(key: string): boolean {
    return key in this.notified
  }

  public isNotified(key: string, value: string): boolean {
    return this.notified[key] === value
  }

  public getNotified(key: string): string | undefined {
    return this.notified[key]
  }

  public setNotified(key: string, value: string): void {
    this.notified[key] = value
  }

  public isFirst(): boolean {
    return !fs.existsSync(this.path)
  }

  public load(): void {
    this.notified = JSON.parse(fs.readFileSync(this.path, 'utf8'))
  }

  public save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.notified, null, 2))
  }
}
