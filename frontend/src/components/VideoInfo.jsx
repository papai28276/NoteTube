import { ExternalLink, Clock, Play } from 'lucide-react';
import TiltCard from './TiltCard';

export default function VideoInfo({ video }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.25rem',
        padding: '1.25rem',
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: '1rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Thumbnail */}
      {video.thumbnail_url && (
        <TiltCard style={{ position: 'relative', width: '140px', height: '79px', flexShrink: 0, cursor: 'pointer' }}>
          <img
            src={video.thumbnail_url}
            alt={video.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.5rem',
              background: 'var(--surface-2)',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) translateZ(20px)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <Play size={16} fill="white" color="white" style={{ marginLeft: '2px' }} />
          </div>
        </TiltCard>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: '200px' }}>
        <h1
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 0.4rem',
            lineHeight: 1.3,
          }}
        >
          {video.title}
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: '#ff0000',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            <Play size={15} fill="#ff0000" />
            {video.channel || 'YouTube'}
          </span>

          {video.duration && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
              }}
            >
              <Clock size={13} />
              {video.duration}
            </span>
          )}

          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--brand-600)',
              fontSize: '0.82rem',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <ExternalLink size={13} />
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
