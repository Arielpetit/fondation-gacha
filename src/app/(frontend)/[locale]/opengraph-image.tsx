import { ImageResponse } from 'next/og'

export const alt = 'Fondation Jean-Félicien Gacha — Bangoulap, Cameroun'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Default social sharing image (pages with their own photo override it). */
export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const en = locale === 'en'
  const dots = Array.from({ length: 7 * 13 }, (_, i) => i)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#121933',
          color: '#f7f3ec',
          position: 'relative',
        }}
      >
        {/* Ndop dot grid */}
        <div style={{ position: 'absolute', right: 40, top: 40, display: 'flex', flexWrap: 'wrap', width: 520, gap: 28, opacity: 0.18 }}>
          {dots.map((i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 12, background: '#d9c7a3' }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 26, letterSpacing: 6, color: '#d9c7a3' }}>
          <div style={{ width: 56, height: 2, background: '#d9c7a3' }} />
          {en ? 'BANGOULAP · WEST CAMEROON' : 'BANGOULAP · OUEST-CAMEROUN'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 34, opacity: 0.8 }}>{en ? 'Jean-Félicien Gacha Foundation' : 'Fondation Jean-Félicien Gacha'}</div>
          <div style={{ fontSize: 76, lineHeight: 1.05, maxWidth: 980, fontFamily: 'serif' }}>
            {en ? 'Recognising others and their values' : 'La reconnaissance de l’autre et de ses valeurs'}
          </div>
        </div>
        <div style={{ display: 'flex', height: 10, width: '100%', background: '#b4532a' }} />
      </div>
    ),
    size,
  )
}
