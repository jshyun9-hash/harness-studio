// Byul Resort — Version A: 객실 리스트 페이지 + 공지사항 페이지
const A_pages = window.BYUL;

// ════════════════════════════════════════════════════
// 객실 리스트 페이지 (필터/정렬)
// ════════════════════════════════════════════════════
const ARoomsList = ({ onNav, onSelectRoom, search, setSearch }) => {
  const [filter, setFilter] = React.useState('전체');

  const categories = ['전체', '스위트', '빌라', '디럭스', '패밀리', '스탠다드'];

  const filtered = React.useMemo(() => {
    let list = [...window.ROOMS];
    if (filter !== '전체') {
      const map = { '스위트': /스위트/, '빌라': /빌라/, '디럭스': /디럭스/, '패밀리': /패밀리/, '스탠다드': /스탠다드|트윈/ };
      list = list.filter(r => map[filter] && (map[filter].test(r.name)));
    }
    return list;
  }, [filter]);

  const dow = ['일','월','화','수','목','금','토'];
  const fmtDate = (x) => {
    if (!x) return '-';
    const dt = new Date(2026, x.month, x.day);
    return `2026.${String(x.month + 1).padStart(2,'0')}.${String(x.day).padStart(2,'0')} (${dow[dt.getDay()]})`;
  };
  const nights = (search.checkIn && search.checkOut)
    ? (search.checkOut.month - search.checkIn.month) * 30 + (search.checkOut.day - search.checkIn.day)
    : 0;

  return (
    <div style={{ background: A_pages.color.cream, minHeight: '100%' }}>
      <ATopNav onNav={onNav} onLogoClick={() => onNav('home')} current="rooms"/>

      {/* 페이지 헤더 */}
      <div style={{ padding: '72px 48px 40px', textAlign: 'center', background: A_pages.color.white, borderBottom: `1px solid ${A_pages.color.line}` }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: A_pages.color.gold, marginBottom: 10, fontWeight: 500 }}>ACCOMMODATION</div>
        <div style={{ fontFamily: A_pages.font.display, fontSize: 44, color: A_pages.color.ink, letterSpacing: 0.5 }}>
          객실 안내
        </div>
        <div style={{ width: 40, height: 1, background: A_pages.color.gold, margin: '20px auto' }}/>
        <div style={{ fontSize: 14, color: A_pages.color.slate, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          바다와 가장 가까운 자리, 섬세하게 설계된 객실을 한눈에 비교해보세요.
        </div>
      </div>

      {/* 검색 바 (날짜 & 인원) */}
      <div style={{ background: A_pages.color.white, borderBottom: `1px solid ${A_pages.color.line}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 48px', display: 'flex', justifyContent: 'center' }}>
          <ASearchBox state={search} setState={setSearch} onSubmit={() => { /* 이미 리스트에 있음 */ }}/>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 48px 0' }}>
        {/* 객실 타입 필터 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 28, borderBottom: `1px solid ${A_pages.color.line}` }}>
          {categories.map((c) => (
            <div key={c} onClick={() => setFilter(c)} style={{
              padding: '14px 4px', cursor: 'pointer', fontSize: 14, letterSpacing: 0.5,
              color: filter === c ? A_pages.color.ocean : A_pages.color.slate,
              fontWeight: filter === c ? 600 : 400,
              borderBottom: filter === c ? `2px solid ${A_pages.color.ocean}` : '2px solid transparent',
              marginBottom: -1,
            }}>{c}</div>
          ))}
        </div>

        {/* 검색 조건 요약 + 결과 카운트 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: A_pages.color.slate }}>
            <span style={{ color: A_pages.color.ink, fontWeight: 500 }}>{fmtDate(search.checkIn)}</span>
            <span style={{ margin: '0 8px', color: A_pages.color.mist }}>—</span>
            <span style={{ color: A_pages.color.ink, fontWeight: 500 }}>{fmtDate(search.checkOut)}</span>
            {nights > 0 && <span style={{ marginLeft: 6, color: A_pages.color.gold, fontWeight: 600 }}>· {nights}박</span>}
            <span style={{ margin: '0 10px', color: A_pages.color.mist }}>·</span>
            성인 {search.adults}{search.children > 0 ? ` · 어린이 ${search.children}` : ''}
          </div>
          <div style={{ fontSize: 14, color: A_pages.color.slate }}>
            총 <span style={{ color: A_pages.color.ocean, fontWeight: 700 }}>{filtered.length}</span>개의 객실
          </div>
        </div>

        {/* 객실 그리드 */}
        {filtered.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', background: A_pages.color.white, color: A_pages.color.slate, marginBottom: 80 }}>
            <div style={{ fontFamily: A_pages.font.display, fontSize: 20, marginBottom: 8, color: A_pages.color.ink }}>조건에 맞는 객실이 없습니다</div>
            <div style={{ fontSize: 13 }}>객실 타입을 변경해 다시 확인해 보세요.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, paddingBottom: 80 }}>
            {filtered.map(r => <ARoomCard key={r.id} room={r} onClick={() => onSelectRoom(r.id)}/>)}
          </div>
        )}
      </div>

      <AFooter/>
    </div>
  );
};

// ════════════════════════════════════════════════════
// 공지사항 페이지 (리스트 + 검색)
// ════════════════════════════════════════════════════
const ANotices = ({ onNav }) => {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('전체');
  const [page, setPage] = React.useState(1);
  const PER = 8;
  const cats = ['전체', '공지', '이벤트', '시설'];

  const filtered = React.useMemo(() => {
    let list = [...window.NOTICES];
    if (category !== '전체') list = list.filter(n => n.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(n => n.title.toLowerCase().includes(q));
    }
    // pinned 먼저
    list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return list;
  }, [query, category]);

  const pinned = filtered.filter(n => n.pinned);
  const normal = filtered.filter(n => !n.pinned);
  const totalPages = Math.max(1, Math.ceil(normal.length / PER));
  const pageItems = normal.slice((page - 1) * PER, page * PER);

  React.useEffect(() => { setPage(1); }, [query, category]);

  const catBadge = (c) => {
    const m = {
      '공지': { bg: A_pages.color.ocean, fg: A_pages.color.white },
      '이벤트': { bg: A_pages.color.coral, fg: A_pages.color.white },
      '시설': { bg: A_pages.color.sand, fg: A_pages.color.ink },
    };
    const s = m[c] || { bg: A_pages.color.line, fg: A_pages.color.ink };
    return <span style={{ background: s.bg, color: s.fg, padding: '3px 10px', fontSize: 11, letterSpacing: 0.5, fontWeight: 600 }}>{c}</span>;
  };

  return (
    <div style={{ background: A_pages.color.cream, minHeight: '100%' }}>
      <ATopNav onNav={onNav} onLogoClick={() => onNav('home')} current="notices"/>

      {/* 페이지 헤더 */}
      <div style={{ padding: '72px 48px 40px', textAlign: 'center', background: A_pages.color.white, borderBottom: `1px solid ${A_pages.color.line}` }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: A_pages.color.gold, marginBottom: 10, fontWeight: 500 }}>NOTICE</div>
        <div style={{ fontFamily: A_pages.font.display, fontSize: 44, color: A_pages.color.ink, letterSpacing: 0.5 }}>
          공지사항
        </div>
        <div style={{ width: 40, height: 1, background: A_pages.color.gold, margin: '20px auto' }}/>
        <div style={{ fontSize: 14, color: A_pages.color.slate, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          Byul Resort의 새로운 소식과 이벤트, 시설 운영 안내를 확인하세요.
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 48px 80px' }}>
        {/* 검색 + 카테고리 */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {cats.map(c => (
              <div key={c} onClick={() => setCategory(c)} style={{
                padding: '9px 18px', fontSize: 13, cursor: 'pointer', letterSpacing: 0.3,
                background: category === c ? A_pages.color.ocean : 'transparent',
                color: category === c ? A_pages.color.white : A_pages.color.slate,
                border: `1px solid ${category === c ? A_pages.color.ocean : A_pages.color.line}`,
                fontWeight: category === c ? 600 : 400,
                transition: 'all .2s',
              }}>{c}</div>
            ))}
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="제목으로 검색"
              style={{
                width: '100%', padding: '11px 16px 11px 42px', fontFamily: 'inherit', fontSize: 14,
                border: `1px solid ${A_pages.color.line}`, background: A_pages.color.white,
                color: A_pages.color.ink, outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = A_pages.color.ocean}
              onBlur={(e) => e.target.style.borderColor = A_pages.color.line}
            />
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: A_pages.color.slate }}>
              <Icon name="search" size={16}/>
            </div>
          </div>
        </div>

        {/* 결과 카운트 */}
        <div style={{ fontSize: 13, color: A_pages.color.slate, marginBottom: 12 }}>
          총 <span style={{ color: A_pages.color.ocean, fontWeight: 700 }}>{filtered.length}</span>건
          {query && <span> · &ldquo;{query}&rdquo; 검색 결과</span>}
        </div>

        {/* 테이블 */}
        <div style={{ background: A_pages.color.white, borderTop: `2px solid ${A_pages.color.ocean}` }}>
          {/* 헤더 */}
          <div style={{
            display: 'grid', gridTemplateColumns: '72px 110px 1fr 120px 90px',
            padding: '14px 24px', fontSize: 12, letterSpacing: 1, fontWeight: 600,
            color: A_pages.color.slate, borderBottom: `1px solid ${A_pages.color.line}`,
          }}>
            <div>번호</div>
            <div>분류</div>
            <div>제목</div>
            <div>작성일</div>
            <div style={{ textAlign: 'right' }}>조회</div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', color: A_pages.color.slate }}>
              <div style={{ fontFamily: A_pages.font.display, fontSize: 20, marginBottom: 8, color: A_pages.color.ink }}>검색 결과가 없습니다</div>
              <div style={{ fontSize: 13 }}>다른 검색어를 입력해 보세요.</div>
            </div>
          ) : (
            <>
              {/* 고정 공지 */}
              {pinned.map((n) => (
                <div key={n.id} style={{
                  display: 'grid', gridTemplateColumns: '72px 110px 1fr 120px 90px',
                  padding: '18px 24px', fontSize: 14, alignItems: 'center',
                  background: 'rgba(200,161,101,0.06)',
                  borderBottom: `1px solid ${A_pages.color.line}`, cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200,161,101,0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(200,161,101,0.06)'}>
                  <div style={{ color: A_pages.color.gold, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>NOTICE</div>
                  <div>{catBadge(n.category)}</div>
                  <div style={{ color: A_pages.color.ink, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {n.title}
                    <span style={{ fontSize: 10, color: A_pages.color.gold, letterSpacing: 1 }}>● 고정</span>
                  </div>
                  <div style={{ color: A_pages.color.slate, fontSize: 13 }}>{n.date}</div>
                  <div style={{ color: A_pages.color.slate, fontSize: 13, textAlign: 'right' }}>{n.views.toLocaleString()}</div>
                </div>
              ))}
              {/* 일반 */}
              {pageItems.map((n) => (
                <div key={n.id} style={{
                  display: 'grid', gridTemplateColumns: '72px 110px 1fr 120px 90px',
                  padding: '18px 24px', fontSize: 14, alignItems: 'center',
                  borderBottom: `1px solid ${A_pages.color.line}`, cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = A_pages.color.cream}
                onMouseLeave={(e) => e.currentTarget.style.background = A_pages.color.white}>
                  <div style={{ color: A_pages.color.slate, fontSize: 13 }}>{n.id}</div>
                  <div>{catBadge(n.category)}</div>
                  <div style={{ color: A_pages.color.ink, fontWeight: 500 }}>{n.title}</div>
                  <div style={{ color: A_pages.color.slate, fontSize: 13 }}>{n.date}</div>
                  <div style={{ color: A_pages.color.slate, fontSize: 13, textAlign: 'right' }}>{n.views.toLocaleString()}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 32 }}>
            <div onClick={() => setPage(Math.max(1, page - 1))} style={{
              padding: '8px 14px', fontSize: 13, cursor: page === 1 ? 'default' : 'pointer',
              border: `1px solid ${A_pages.color.line}`, color: page === 1 ? A_pages.color.mist : A_pages.color.slate,
            }}>‹ 이전</div>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <div key={p} onClick={() => setPage(p)} style={{
                padding: '8px 14px', fontSize: 13, cursor: 'pointer', minWidth: 36, textAlign: 'center',
                border: `1px solid ${page === p ? A_pages.color.ocean : A_pages.color.line}`,
                background: page === p ? A_pages.color.ocean : A_pages.color.white,
                color: page === p ? A_pages.color.white : A_pages.color.slate,
                fontWeight: page === p ? 700 : 400,
              }}>{p}</div>
            ))}
            <div onClick={() => setPage(Math.min(totalPages, page + 1))} style={{
              padding: '8px 14px', fontSize: 13, cursor: page === totalPages ? 'default' : 'pointer',
              border: `1px solid ${A_pages.color.line}`, color: page === totalPages ? A_pages.color.mist : A_pages.color.slate,
            }}>다음 ›</div>
          </div>
        )}
      </div>

      <AFooter/>
    </div>
  );
};

window.ARoomsList = ARoomsList;
window.ANotices = ANotices;
