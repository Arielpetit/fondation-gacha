import { describe, expect, it } from 'vitest'

import { slugify } from '@/fields/slug'
import { cleanDateLabel, originalUploadUrl, parseDateLabel, plain } from '@/scripts/wp/lib'

const day = (iso?: string) => iso?.slice(0, 10)

describe('parseDateLabel', () => {
  it('parses a single day', () => {
    const r = parseDateLabel('Le 19 Février 2020')
    expect(day(r.start)).toBe('2020-02-19')
    expect(r.end).toBeUndefined()
  })

  it('parses a range within one month', () => {
    const r = parseDateLabel('Du 13 au 20 Janvier 2025')
    expect([day(r.start), day(r.end)]).toEqual(['2025-01-13', '2025-01-20'])
  })

  it('parses a range across months, including English month names', () => {
    const r = parseDateLabel('Du 16 Novembre au 21 December 2023')
    expect([day(r.start), day(r.end)]).toEqual(['2023-11-16', '2023-12-21'])
  })

  it('puts the start in the previous year when the range crosses new year', () => {
    const r = parseDateLabel('Du 28 Décembre au 05 Janvier 2024')
    expect([day(r.start), day(r.end)]).toEqual(['2023-12-28', '2024-01-05'])
  })

  it('ignores empty or unknown labels', () => {
    expect(parseDateLabel('Le')).toEqual({})
    expect(parseDateLabel(null)).toEqual({})
  })
})

describe('cleanDateLabel', () => {
  it('lowercases French months and translates leaked English ones', () => {
    expect(cleanDateLabel('Du 01 au 31 December 2021')).toBe('Du 01 au 31 décembre 2021')
    expect(cleanDateLabel('Le')).toBeUndefined()
  })
})

describe('originalUploadUrl', () => {
  it('drops WordPress size suffixes and forces https', () => {
    expect(originalUploadUrl('http://www.fondationgacha.org/wp-content/uploads/2025/01/a-722x1024.jpg')).toBe(
      'https://www.fondationgacha.org/wp-content/uploads/2025/01/a.jpg',
    )
    expect(originalUploadUrl('//www.fondationgacha.org/x.png')).toBe('https://www.fondationgacha.org/x.png')
  })
})

describe('text helpers', () => {
  it('decodes entities and strips tags', () => {
    expect(plain('L&rsquo;ONG <b>Fondation</b>&nbsp;Gacha &#8211; 2020')).toBe('L’ONG Fondation Gacha – 2020')
  })

  it('slugifies French titles', () => {
    expect(slugify('Création de la Maison Gacha !')).toBe('creation-de-la-maison-gacha')
    expect(slugify('L’éducation pour tous')).toBe('l-education-pour-tous')
  })
})
