// Byul Resort 디자인 토큰 & 공통 컴포넌트
// 두 가지 버전(A: 보수적 / B: 과감한)이 공유하는 베이스

const BYUL = {
  // 오션 블루/그린 팔레트, 따뜻한 뉴트럴과 조합
  color: {
    // 브랜드 컬러
    ocean: '#0F4C5C',       // 딥 오션 (A 주조색)
    teal: '#2A7F87',        // 미드 틸
    seafoam: '#86B8B1',     // 연한 틸
    sand: '#F4EFE6',        // 따뜻한 모래
    cream: '#FBF8F2',       // 배경 크림
    coral: '#E8826B',       // 액센트 (노을)
    gold: '#C8A165',        // 럭셔리 골드
    // 중립
    ink: '#1A2A2E',         // 진한 텍스트
    slate: '#5A6A6E',       // 본문 그레이
    mist: '#A9B4B6',        // 보조 텍스트
    line: '#E4DED2',        // 구분선
    white: '#FFFFFF',
    // 상태
    success: '#4A8B6F',
    warn: '#D4A556',
    danger: '#B64848',
  },
  // 반응형 토큰
  radius: { sm: 4, md: 8, lg: 14, xl: 22, pill: 999 },
  space: (n) => n * 4,
  shadow: {
    sm: '0 1px 2px rgba(15,76,92,0.06), 0 1px 3px rgba(15,76,92,0.04)',
    md: '0 4px 16px rgba(15,76,92,0.08), 0 2px 6px rgba(15,76,92,0.04)',
    lg: '0 20px 50px rgba(15,76,92,0.12), 0 8px 24px rgba(15,76,92,0.06)',
  },
  font: {
    // Noto Serif KR (로고/디스플레이) + Pretendard (본문/UI)
    display: '"Noto Serif KR", "Nanum Myeongjo", serif',
    body: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  },
};

// ────────────────────────────────────────────────────
// 공통 Icon (간단한 인라인 SVG)
// ────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 1.6 }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-7 8-7s7 2.5 8 7"/></>,
    users: <><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.8"/><path d="M3 20c.8-3.6 3.3-5.5 6-5.5s5.2 1.9 6 5.5M15 20c.5-2.5 2.2-4 4-4s3.5 1.5 4 4"/></>,
    mapPin: <><path d="M12 22s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z"/><circle cx="12" cy="10" r="2.5"/></>,
    bed: <><path d="M3 18V8M3 18h18M21 18v-5a4 4 0 00-4-4H3M7 12h4"/></>,
    star: <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 16.8 6.6 19.6l1-6L3.3 9.4l6-.9z" fill={color} stroke="none"/>,
    arrowRight: <path d="M5 12h14M13 6l6 6-6 6"/>,
    arrowLeft: <path d="M19 12H5M11 18l-6-6 6-6"/>,
    check: <path d="M4 12l5 5 11-11"/>,
    chevronDown: <path d="M6 9l6 6 6-6"/>,
    chevronLeft: <path d="M15 18l-6-6 6-6"/>,
    chevronRight: <path d="M9 18l6-6-6-6"/>,
    heart: <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>,
    menu: <path d="M3 6h18M3 12h18M3 18h18"/>,
    close: <path d="M5 5l14 14M19 5L5 19"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    minus: <path d="M5 12h14"/>,
    wifi: <><path d="M2 9a16 16 0 0120 0M5 13a11 11 0 0114 0M8.5 16.5a6 6 0 017 0"/><circle cx="12" cy="20" r="1" fill={color}/></>,
    car: <><path d="M3 13l2-5a2 2 0 012-1h10a2 2 0 012 1l2 5v5h-3v-2H6v2H3v-5z"/><circle cx="7" cy="16" r="1.5"/><circle cx="17" cy="16" r="1.5"/></>,
    pool: <path d="M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5S16 18 18 18s2-1.5 4-1.5M2 14c2 0 2-1.5 4-1.5S8 14 10 14s2-1.5 4-1.5S16 14 18 14s2-1.5 4-1.5M6 11V5a2 2 0 014 0M14 11V5a2 2 0 014 0"/>,
    coffee: <><path d="M4 8h13v6a5 5 0 01-10 0V8zM17 10h2a2 2 0 010 4h-2M8 2v3M12 2v3"/></>,
    spa: <path d="M12 3c0 4-3 5-3 9s3 5 3 5 3-1 3-5-3-5-3-9zM6 12c-2 1-3 3-3 5 3 0 5-1 6-3M18 12c2 1 3 3 3 5-3 0-5-1-6-3"/>,
    wave: <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>,
    sparkle: <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z" fill={color} stroke="none"/>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
    phone: <path d="M5 4h3l2 5-2 1a12 12 0 006 6l1-2 5 2v3a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z"/>,
    filter: <path d="M3 5h18M6 12h12M10 19h4"/>,
    sort: <path d="M3 6h13M3 12h9M3 18h5M17 4v16M14 17l3 3 3-3"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
};

// ────────────────────────────────────────────────────
// 플레이스홀더 이미지 (그라디언트 + 파도 SVG)
// 실제 프로덕트에서는 실제 이미지로 교체
// ────────────────────────────────────────────────────
const PlaceholderImage = ({ variant = 'ocean', label, children, style, overlay }) => {
  const gradients = {
    ocean: 'linear-gradient(135deg, #0F4C5C 0%, #2A7F87 55%, #86B8B1 100%)',
    sunset: 'linear-gradient(135deg, #2A7F87 0%, #E8826B 60%, #F4D5A6 100%)',
    dawn: 'linear-gradient(160deg, #86B8B1 0%, #F4EFE6 100%)',
    night: 'linear-gradient(160deg, #0A2A33 0%, #1E4A55 100%)',
    sand: 'linear-gradient(180deg, #F4EFE6 0%, #E4DED2 100%)',
    pool: 'linear-gradient(160deg, #2A7F87 0%, #86B8B1 70%, #D4E8E0 100%)',
    forest: 'linear-gradient(160deg, #1E4A55 0%, #4A8B6F 100%)',
  };
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: gradients[variant] || gradients.ocean,
      overflow: 'hidden',
      ...style,
    }}>
      {/* 파도 텍스처 */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}
        viewBox="0 0 400 300" preserveAspectRatio="none">
        <path d="M0 220 Q100 200 200 215 T400 210 L400 300 L0 300 Z" fill="rgba(255,255,255,0.35)"/>
        <path d="M0 240 Q100 225 200 235 T400 232 L400 300 L0 300 Z" fill="rgba(255,255,255,0.25)"/>
        <path d="M0 265 Q120 250 240 262 T400 260 L400 300 L0 300 Z" fill="rgba(255,255,255,0.4)"/>
      </svg>
      {overlay && <div style={{ position: 'absolute', inset: 0, background: overlay }}/>}
      {label && (
        <div style={{
          position: 'absolute', top: 12, left: 12,
          fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.85)',
          padding: '3px 8px', background: 'rgba(0,0,0,0.18)', borderRadius: 3,
          letterSpacing: 0.5, textTransform: 'uppercase',
        }}>{label}</div>
      )}
      {children}
    </div>
  );
};

Object.assign(window, { BYUL, Icon, PlaceholderImage });
