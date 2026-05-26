import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Design Vortex — Premium TTRPG & Character Art Commissions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#1A130C',
          color: '#F4EAD3',
          padding: '80px',
          position: 'relative',
          fontFamily: 'serif',
        }}
      >
        {/* Background gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -150,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: '#C9A04A',
            opacity: 0.18,
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: '#6B1F2A',
            opacity: 0.18,
            filter: 'blur(80px)',
          }}
        />

        {/* Brand mark — DV monogram (cream + gold reverse palette for the dark
            OG background) + wordmark. Inline SVG so it renders in the
            edge ImageResponse without a font dependency. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="78" height="78" viewBox="0 0 100 100" style={{ display: 'block' }}>
            {/* D in cream for contrast against the dark OG background */}
            <path
              d="M16 13 H50 C70 13, 82 30, 82 50 C82 70, 70 87, 50 87 H16 V13 Z M29 24 V76 H50 C62 76, 70 64, 70 50 C70 36, 62 24, 50 24 H29 Z"
              fill="#F4EAD3"
              fillRule="evenodd"
            />
            <path
              d="M12 13 H22 V18 H16 V20 H12 Z M12 87 H22 V82 H16 V80 H12 Z"
              fill="#F4EAD3"
            />
            {/* V + illuminated dot stay gold */}
            <path d="M36 35 L48 67 L60 35 L55 35 L48 56 L41 35 Z" fill="#D4A24C" />
            <circle cx="48" cy="29" r="2" fill="#D4A24C" />
          </svg>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: '#F4EAD3',
            }}
          >
            Design Vortex
          </div>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#D4A24C',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ width: 36, height: 1, background: '#D4A24C' }} />
          {`Premium Art Commissions · Since 2024`}
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 92,
            fontWeight: 600,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            color: '#F4EAD3',
            marginTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          Painterly portraits for&nbsp;
          <span style={{ fontStyle: 'italic', color: '#D4A24C', fontWeight: 500 }}>
            your character.
          </span>
        </div>

        {/* Trust strip */}
        <div
          style={{
            marginTop: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            color: '#C8B89A',
            fontSize: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 600, color: '#D4A24C' }}>200+</span>
            commissions
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 600, color: '#D4A24C' }}>4.9★</span>
            247 reviews
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 600, color: '#D4A24C' }}>48h</span>
            response
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
