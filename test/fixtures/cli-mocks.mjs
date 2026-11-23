import Module from 'node:module'
const originalLoad = Module._load
const scenario = process.env.TEST_SCENARIO
let sent = 0

Module._load = function (request, parent, isMain) {
  if (request === '@book000/node-utils') {
    return {
      Logger: { configure: () => ({ info() {}, error() {} }) },
      Discord: class {
        async sendMessage() {
          sent++
          if (
            scenario === 'all-fail' ||
            (scenario === 'partial' && sent === 1)
          ) {
            throw new Error('send failed')
          }
        }
      },
    }
  }
  if (request === './config') {
    return {
      PexConfiguration: class {
        load() {}
        validate() {
          return scenario !== 'invalid'
        }
        getValidateFailures() {
          return ['invalid']
        }
        get() {
          return { webhookUrl: 'https://example.com' }
        }
      },
    }
  }
  if (request === './notified') {
    return {
      Notified: class {
        isFirst() {
          return false
        }
        isNotified() {
          return false
        }
        isExists() {
          return false
        }
        getNotified() {
          return undefined
        }
        setNotified() {}
        save() {}
      },
    }
  }
  if (request === './parse') {
    return {
      parseList: () => [{ title: 'item', status: '受付中', path: '/item' }],
    }
  }
  return originalLoad.call(Module, request, parent, isMain)
}
globalThis.fetch = async () => ({ ok: true, text: async () => '' })
