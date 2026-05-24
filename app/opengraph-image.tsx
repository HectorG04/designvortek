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

        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '2px solid #D4A24C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4A24C',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            DV
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
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
          Premium Art Commissions · Since 2024
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
