// Byul Resort — Version A: 보수적 / 클래식 럭셔리
// 정갈한 그리드, 세리프 타이틀, 절제된 여백. 소노 계열 레퍼런스.
// 하나의 viewport 내부에 여러 screen을 전환 (AScreen state로 관리)

const A = window.BYUL;

// ────────────────────────────────────────────────────
// 공통 UI
// ────────────────────────────────────────────────────
const aButtonStyle = (variant = 'primary', size = 'md') => {
  const sizes = {
    sm: { padding: '8px 14px', fontSize: 13 },
    md: { padding: '12px 20px', fontSize: 14 },
    lg: { padding: '15px 28px', fontSize: 15 },
  };
  const variants = {
    primary: { background: A.color.ocean, color: A.color.white, border: `1px solid ${A.color.ocean}` },
    outline: { background: 'transparent', color: A.color.ocean, border: `1px solid ${A.color.ocean}` },
    ghost: { background: 'transparent', color: A.color.ink, border: '1px solid transparent' },
    gold: { background: A.color.gold, color: A.color.white, border: `1px solid ${A.color.gold}` },
  };
  return {
    ...sizes[size], ...variants[variant],
    fontFamily: A.font.body, fontWeight: 500, letterSpacing: 0.2,
    cursor: 'pointer', borderRadius: 2, transition: 'all .15s',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  };
};

const AButton = ({ variant, size, children, icon, style, ...props }) => (
  <button style={{ ...aButtonStyle(variant, size), ...style }} {...props}>
    {icon && <Icon name={icon} size={15}/>}
    {children}
  </button>
);

const AInput = ({ label, icon, error, style, ...props }) => (
  <label style={{ display: 'block', marginBottom: 16 }}>
    {label && (
      <div style={{ fontSize: 12, color: A.color.slate, marginBottom: 6, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 500 }}>
        {label}
      </div>
    )}
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      border: `1px solid ${error ? A.color.danger : A.color.line}`,
      padding: '12px 14px', background: A.color.white, borderRadius: 2,
      transition: 'border .15s',
    }}>
      {icon && <Icon name={icon} size={16} color={A.color.slate}/>}
      <input {...props} style={{
        flex: 1, border: 'none', outline: 'none', background: 'transparent',
        fontSize: 14, fontFamily: A.font.body, color: A.color.ink,
        ...style,
      }}/>
    </div>
    {error && <div style={{ fontSize: 12, color: A.color.danger, marginTop: 4 }}>{error}</div>}
  </label>
);

// ────────────────────────────────────────────────────
// Top Nav (공통)
// ────────────────────────────────────────────────────
const ATopNav = ({ current, onNav, onLogoClick }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 48px', background: A.color.white,
    borderBottom: `1px solid ${A.color.line}`,
  }}>
    <div onClick={onLogoClick} style={{
      fontFamily: A.font.display, fontSize: 22, fontWeight: 500,
      color: A.color.ocean, letterSpacing: 1, cursor: 'pointer',
    }}>
      BYUL <span style={{ fontSize: 10, letterSpacing: 3, marginLeft: 2, color: A.color.gold }}>RESORT</span>
    </div>
    <div style={{ display: 'flex', gap: 36, fontSize: 13, letterSpacing: 0.5 }}>
      {[
        { key: 'rooms', label: '객실' },
        { key: 'notices', label: '공지사항' },
      ].map((t) => (
        <div key={t.key} onClick={() => onNav(t.key)} style={{
          color: current === t.key ? A.color.ocean : A.color.ink,
          cursor: 'pointer', fontWeight: current === t.key ? 700 : 500,
          borderBottom: current === t.key ? `2px solid ${A.color.gold}` : '2px solid transparent',
          paddingBottom: 4,
        }}>{t.label}</div>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: 13 }}>
      <div onClick={() => onNav('mypage')} style={{ color: A.color.slate, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="user" size={14}/> 내 예약
      </div>
      <AButton variant="primary" size="sm" onClick={() => onNav('home')}>예약하기</AButton>
    </div>
  </div>
);

// ════════════════════════════════════════════════════
// 1. 로그인
// ════════════════════════════════════════════════════
const ALogin = ({ onNav }) => {
  const [mode, setMode] = React.useState('login');
  return (
    <div style={{ minHeight: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', background: A.color.cream }}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <PlaceholderImage variant="ocean">
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(15,76,92,0.3) 0%, rgba(15,76,92,0.6) 100%)',
          }}/>
          <div style={{
            position: 'absolute', bottom: 48, left: 48, right: 48, color: A.color.white,
          }}>
            <div style={{ fontFamily: A.font.display, fontSize: 38, fontWeight: 400, letterSpacing: 1, lineHeight: 1.25 }}>
              고요한 바다,<br/>깊어지는 시간.
            </div>
            <div style={{ marginTop: 16, fontSize: 14, opacity: 0.8, letterSpacing: 0.5 }}>
              Byul Resort — East Sea, Gangwon
            </div>
          </div>
        </PlaceholderImage>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ fontFamily: A.font.display, fontSize: 14, letterSpacing: 4, color: A.color.gold, marginBottom: 8 }}>BYUL RESORT</div>
          <div style={{ fontFamily: A.font.display, fontSize: 30, fontWeight: 500, color: A.color.ink, letterSpacing: 0.5, marginBottom: 8 }}>
            {mode === 'login' ? '로그인' : '회원가입'}
          </div>
          <div style={{ fontSize: 13, color: A.color.slate, marginBottom: 32 }}>
            {mode === 'login' ? '예약 관리와 멤버십 혜택을 이용하세요.' : '멤버 전용 혜택을 받아보세요.'}
          </div>

          {mode === 'signup' && <AInput label="이름" icon="user" placeholder="홍길동"/>}
          <AInput label="이메일" icon="mail" placeholder="name@email.com"/>
          <AInput label="비밀번호" icon="lock" type="password" placeholder="••••••••"/>
          {mode === 'signup' && <AInput label="휴대전화" icon="phone" placeholder="010-0000-0000"/>}

          {mode === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: A.color.slate, marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: A.color.ocean }}/>
                로그인 상태 유지
              </label>
              <span style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>비밀번호 찾기</span>
            </div>
          )}

          <AButton variant="primary" size="lg" style={{ width: '100%', marginBottom: 12 }}
            onClick={() => onNav('home')}>
            {mode === 'login' ? '로그인' : '가입하기'}
          </AButton>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: A.color.mist, fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: A.color.line }}/>
            또는
            <div style={{ flex: 1, height: 1, background: A.color.line }}/>
          </div>

          <AButton variant="outline" size="lg" style={{ width: '100%', marginBottom: 8 }}>카카오로 계속하기</AButton>
          <AButton variant="outline" size="lg" style={{ width: '100%' }}>네이버로 계속하기</AButton>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: A.color.slate }}>
            {mode === 'login' ? '계정이 없으신가요? ' : '이미 회원이신가요? '}
            <span onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={{ color: A.color.ocean, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              {mode === 'login' ? '회원가입' : '로그인'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

window.ALogin = ALogin;
window.ATopNav = ATopNav;
window.AButton = AButton;
window.AInput = AInput;
