// Byul Resort — Version A: Home (객실 리스트)
const A_home = window.BYUL;

const AHome = ({ onNav, onSelectRoom, search, setSearch }) => {
  const [filter, setFilter] = React.useState('전체');
  const categories = ['전체', '스위트', '빌라', '디럭스', '패밀리'];

  return (
    <div style={{ background: A_home.color.cream, minHeight: '100%' }}>
      <ATopNav onNav={onNav} onLogoClick={() => onNav('home')} current="home"/>

      {/* 히어로 */}
      <div style={{ position: 'relative', height: 520, zIndex: 5 }}>
        <PlaceholderImage variant="ocean">
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,76,92,0.25) 0%, rgba(15,76,92,0.55) 100%)' }}/>
          <div style={{
            position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', color: A_home.color.white,
          }}>
            <div style={{ fontSize: 11, letterSpacing: 6, marginBottom: 16, opacity: 0.9 }}>BYUL RESORT · EAST SEA</div>
            <div style={{ fontFamily: A_home.font.display, fontSize: 56, fontWeight: 400, letterSpacing: 2, lineHeight: 1.15 }}>
              머무는 순간,<br/>바다가 된다.
            </div>
            <div style={{ marginTop: 20, fontSize: 15, opacity: 0.85, letterSpacing: 0.5 }}>
              동해의 가장 조용한 해변에서 맞이하는 나의 리트릿.
            </div>
          </div>
        </PlaceholderImage>

        {/* 예약 검색 박스 */}
        <div style={{
          position: 'absolute', bottom: -52, left: '50%', transform: 'translateX(-50%)',
          zIndex: 50,
        }}>
          <ASearchBox state={search} setState={setSearch} onSubmit={() => onNav('rooms')}/>
        </div>
      </div>

      {/* 섹션 — 객실 */}
      <div style={{ padding: '160px 48px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: A_home.color.gold, marginBottom: 10, fontWeight: 500 }}>ACCOMMODATION</div>
          <div style={{ fontFamily: A_home.font.display, fontSize: 40, color: A_home.color.ink, letterSpacing: 0.5 }}>
            객실 안내
          </div>
          <div style={{ width: 40, height: 1, background: A_home.color.gold, margin: '20px auto' }}/>
          <div style={{ fontSize: 14, color: A_home.color.slate, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            바다와 가장 가까운 자리, 섬세하게 설계된 객실이 준비되어 있습니다.
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 40, borderBottom: `1px solid ${A_home.color.line}` }}>
          {categories.map((c) => (
            <div key={c} onClick={() => setFilter(c)} style={{
              padding: '14px 4px', cursor: 'pointer', fontSize: 14, letterSpacing: 0.5,
              color: filter === c ? A_home.color.ocean : A_home.color.slate,
              fontWeight: filter === c ? 600 : 400,
              borderBottom: filter === c ? `2px solid ${A_home.color.ocean}` : '2px solid transparent',
              marginBottom: -1,
            }}>{c}</div>
          ))}
        </div>

        {/* 객실 그리드 */}
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {window.ROOMS.map((r) => (
            <ARoomCard key={r.id} room={r} onClick={() => onSelectRoom(r.id)}/>
          ))}
        </div>
      </div>

      {/* 푸터 */}
      <AFooter/>
    </div>
  );
};

const ARoomCard = ({ room, onClick }) => (
  <div onClick={onClick} style={{ cursor: 'pointer', background: A_home.color.white, transition: 'transform .25s, box-shadow .25s' }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = A_home.shadow.md}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
    <div style={{ position: 'relative', aspectRatio: '4/3' }}>
      <PlaceholderImage variant={room.variant}>
        {room.badge && (
          <div style={{
            position: 'absolute', top: 16, left: 16, background: A_home.color.white,
            color: A_home.color.ocean, padding: '5px 12px', fontSize: 11, letterSpacing: 1.5, fontWeight: 600,
          }}>{room.badge}</div>
        )}
      </PlaceholderImage>
    </div>
    <div style={{ padding: '24px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: A_home.font.display, fontSize: 22, color: A_home.color.ink, fontWeight: 500 }}>{room.name}</div>
          <div style={{ fontSize: 11, color: A_home.color.slate, letterSpacing: 2, marginTop: 2 }}>{room.en.toUpperCase()}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: A_home.color.slate }}>
          <Icon name="star" size={13} color={A_home.color.gold}/>
          <span style={{ fontWeight: 600, color: A_home.color.ink }}>{room.rating}</span>
          <span>({room.reviews})</span>
        </div>
      </div>
      <div style={{ fontSize: 13, color: A_home.color.slate, lineHeight: 1.6, marginBottom: 16, minHeight: 42 }}>
        {room.desc}
      </div>
      <div style={{ display: 'flex', gap: 14, fontSize: 12, color: A_home.color.slate, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="bed" size={13}/> {room.bed}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="users" size={13}/> 최대 {room.capacity}인
        </div>
        <div>{room.size}m²</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 16, borderTop: `1px solid ${A_home.color.line}` }}>
        <div>
          <div>
            <span style={{ fontFamily: A_home.font.display, fontSize: 22, fontWeight: 600, color: A_home.color.ocean }}>
              {room.price.toLocaleString()}
            </span>
            <span style={{ fontSize: 12, color: A_home.color.slate, marginLeft: 4 }}>원~ / 1박</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: A_home.color.ocean, letterSpacing: 1, fontWeight: 500 }}>
          자세히 보기 →
        </div>
      </div>
    </div>
  </div>
);

const AFooter = () => (
  <div style={{ background: A_home.color.ocean, color: A_home.color.white, padding: '56px 48px 32px' }}>
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48 }}>
      <div>
        <div style={{ fontFamily: A_home.font.display, fontSize: 20, marginBottom: 16, letterSpacing: 1 }}>BYUL RESORT</div>
        <div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.8 }}>
          강원도 양양군 현남면 바다로 123<br/>
          대표번호 1588-0000<br/>
          contact@byulresort.kr
        </div>
      </div>
      {['고객센터', '리조트', '정책'].map((t) => (
        <div key={t}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, letterSpacing: 1 }}>{t}</div>
          <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 2 }}>
            <div>이용안내</div>
            <div>자주 묻는 질문</div>
            <div>문의하기</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ maxWidth: 1280, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.15)',
      fontSize: 11, opacity: 0.5, letterSpacing: 0.5 }}>
      © 2026 Byul Resort. All rights reserved.
    </div>
  </div>
);

window.AHome = AHome;
window.AFooter = AFooter;
