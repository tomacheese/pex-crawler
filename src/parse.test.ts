import { ItemStatus } from './notify'
import { parseList } from './parse'

describe('parseList', () => {
  test('accepts an empty listing when the list structure exists', () => {
    expect(parseList('<ul class="anken-list"></ul>')).toEqual([])
  })

  test('rejects pages without a listing structure', () => {
    expect(() => parseList('<main>別のページ</main>')).toThrow(
      'anken-list is not found'
    )
  })

  test.each([
    ['s1', ItemStatus.s1],
    ['s2', ItemStatus.s2],
  ])('parses status class %s', (statusClass, status) => {
    const html = `<ul class="anken-list"><a href="/item"><div class="status ${statusClass}"></div><h2>案件</h2></a></ul>`
    expect(parseList(html)).toEqual([{ status, title: '案件', path: '/item' }])
  })

  test.each(['pending', 's10', 's1 s2'])(
    'rejects unknown status classes: %s',
    (classes) => {
      const html = `<ul class="anken-list"><a href="/item"><div class="status ${classes}"></div><h2>案件</h2></a></ul>`
      expect(() => parseList(html)).toThrow('status class is invalid')
    }
  )
})
