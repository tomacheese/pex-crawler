import { spawnSync } from 'node:child_process'
import path from 'node:path'

describe('CLI の終了状態', () => {
  it.each([
    ['success', 0],
    ['partial', 1],
    ['all-fail', 1],
    ['invalid', 1],
  ])('%s の終了コードは %i', (scenario, exitCode) => {
    const result = spawnSync(
      process.execPath,
      [
        '--import',
        path.resolve('test/fixtures/cli-mocks.mjs'),
        '--import',
        'tsx',
        'src/main.ts',
      ],
      { env: { ...process.env, TEST_SCENARIO: scenario }, encoding: 'utf8' }
    )

    expect(result.error).toBeUndefined()
    expect(result.stderr).toBe('')
    expect(result.status).toBe(exitCode)
  })
})
