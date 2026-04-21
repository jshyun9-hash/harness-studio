// Byul Resort — Version A: 공용 검색 박스 (캘린더 + 인원 팝오버)
const A_s = window.BYUL;

// ────────────────────────────────────────────
// 미니 캘린더 (booking 페이지 ACalendar와 동일 스타일)
// ────────────────────────────────────────────
const ASearchCalendar = ({ checkIn, checkOut, onSelect, monthOffset = 0 }) => {
  const base = new Date(2026, 4 + monthOffset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = `${year}년 ${month + 1}월`;
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isBetween = (d) => {
    if (!checkIn || !checkOut || !d) return false;
    return d > checkIn.day && d < checkOut.day && checkIn.month === month && checkOut.month === month;
  };
  const isStart = (d) => checkIn && d === checkIn.day && month === checkIn.month;
  const isEnd = (d) => checkOut && d === checkOut.day && month === checkOut.month;

  return (
    <div>
      <div style={{ textAlign: 'center', fontFamily: A_s.font.display, fontSize: 17, color: A_s.color.ink, marginBottom: 14, fontWeight: 500 }}>
        {monthName}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontSize: 11, color: A_s.color.slate, marginBottom: 4 }}>
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div key={d} style={{ textAlign: 'center', padding: 6,
            color: i === 0 ? A_s.color.coral : i === 6 ? A_s.color.ocean : A_s.color.slate,
            fontWeight: 500, letterSpacing: 0.5 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i}/>;
          const start = isStart(d), end = isEnd(d), between = isBetween(d);
          const active = start || end || between;
          return (
            <div key={i} onClick={() => onSelect && onSelect({ day: d, month })} style={{
              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 13, position: 'relative',
              color: active ? (start || end ? A_s.color.white : A_s.color.ocean) : A_s.color.ink,
              background: between ? A_s.color.seafoam + '55' : 'transparent',
              borderRadius: start ? '50% 0 0 50%' : end ? '0 50% 50% 0' : 0,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: (start || end) ? A_s.color.ocean : 'transparent',
                fontWeight: active ? 600 : 400,
              }}>{d}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────
// 메인 히어로 검색 박스 (4칸: 체크인 / 체크아웃 / 인원 / 검색버튼)
// 어디를 눌러도 아래 팝오버가 열려 캘린더+인원을 같이 설정
// ────────────────────────────────────────────
const ASearchBox = ({ state, setState, onSubmit }) => {
  const [open, setOpen] = React.useState(false);
  const [focus, setFocus] = React.useState('dates'); // 'dates' | 'guests'
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    const h = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openWith = (f) => {
    // 체크인/체크아웃 필드는 모두 '날짜' 탭으로
    const target = (f === 'in' || f === 'out') ? 'dates' : f;
    setFocus(target);
    setOpen(true);
  };

  const handleSelect = (d) => {
    if (!state.checkIn || (state.checkIn && state.checkOut)) {
      // 첫 선택 또는 이미 범위 완료된 상태에서 새로 시작
      setState({ ...state, checkIn: d, checkOut: null });
    } else {
      // 체크인만 있는 상태에서 두번째 선택
      if ((d.month > state.checkIn.month) || (d.month === state.checkIn.month && d.day > state.checkIn.day)) {
        setState({ ...state, checkOut: d });
      } else {
        setState({ ...state, checkIn: d, checkOut: null });
      }
    }
  };

  const fmt = (x) => {
    if (!x) return '날짜 선택';
    const dow = ['일','월','화','수','목','금','토'];
    const dt = new Date(2026, x.month, x.day);
    return `${x.month + 1}월 ${x.day}일 ${dow[dt.getDay()]}`;
  };

  const totalGuests = state.adults + state.children;

  const Field = ({ id, label, value, active }) => (
    <div onClick={() => openWith(id)} style={{
      flex: 1, padding: '18px 22px', cursor: 'pointer',
      borderRight: `1px solid ${A_s.color.line}`,
      background: open && ((id === 'in' || id === 'out') ? focus === 'dates' : focus === id) ? A_s.color.cream : 'transparent',
      transition: 'background .2s',
    }}>
      <div style={{ fontSize: 11, color: A_s.color.slate, letterSpacing: 1.2, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: A_s.font.display, fontSize: 20, color: value ? A_s.color.ink : A_s.color.mist, fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );

  return (
    <div ref={rootRef} style={{ position: 'relative', width: 920, zIndex: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'stretch',
        background: A_s.color.white, boxShadow: A_s.shadow.lg,
        borderTop: `3px solid ${A_s.color.gold}`,
      }}>
        <Field id="in" label="체크인" value={fmt(state.checkIn)}/>
        <Field id="out" label="체크아웃" value={fmt(state.checkOut)}/>
        <Field id="guests" label="인원"
          value={totalGuests > 0 ? `성인 ${state.adults}${state.children > 0 ? ` · 어린이 ${state.children}` : ''}` : '인원 선택'}/>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px' }}>
          <AButton variant="primary" size="lg" icon="search" onClick={() => { setOpen(false); onSubmit && onSubmit(); }}
            style={{ padding: '14px 28px' }}>객실 검색</AButton>
        </div>
      </div>

      {/* 팝오버 */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0,
          background: A_s.color.white, boxShadow: A_s.shadow.lg, padding: 28,
          borderTop: `3px solid ${A_s.color.gold}`, zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { k: 'dates', t: '날짜' },
                { k: 'guests', t: '인원' },
              ].map(b => (
                <div key={b.k} onClick={() => setFocus(b.k)} style={{
                  padding: '6px 14px', fontSize: 12, cursor: 'pointer', letterSpacing: 0.3,
                  color: focus === b.k ? A_s.color.ocean : A_s.color.slate,
                  fontWeight: focus === b.k ? 700 : 400,
                  borderBottom: focus === b.k ? `2px solid ${A_s.color.ocean}` : '2px solid transparent',
                }}>{b.t}</div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: A_s.color.slate }}>
              {focus === 'dates' && (!state.checkIn ? '체크인 날짜를 선택하세요' : !state.checkOut ? '체크아웃 날짜를 선택하세요' : '날짜를 다시 고르려면 원하는 날짜를 클릭하세요')}
              {focus === 'guests' && '투숙 인원을 선택하세요'}
            </div>
          </div>

          {focus === 'dates' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
              <ASearchCalendar checkIn={state.checkIn} checkOut={state.checkOut} onSelect={handleSelect} monthOffset={0}/>
              <ASearchCalendar checkIn={state.checkIn} checkOut={state.checkOut} onSelect={handleSelect} monthOffset={1}/>
            </div>
          ) : (
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              {[
                { label: '성인', sub: '만 13세 이상', value: state.adults, set: (v) => setState({ ...state, adults: v }), min: 1 },
                { label: '어린이', sub: '만 2~12세', value: state.children, set: (v) => setState({ ...state, children: v }), min: 0 },
              ].map((g) => (
                <div key={g.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${A_s.color.line}` }}>
                  <div>
                    <div style={{ fontSize: 15, color: A_s.color.ink, fontWeight: 500 }}>{g.label}</div>
                    <div style={{ fontSize: 12, color: A_s.color.slate, marginTop: 2 }}>{g.sub}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => g.set(Math.max(g.min, g.value - 1))} style={{
                      width: 32, height: 32, border: `1px solid ${A_s.color.line}`, background: A_s.color.white, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                    }}><Icon name="minus" size={14} color={A_s.color.ocean}/></button>
                    <div style={{ minWidth: 24, textAlign: 'center', fontFamily: A_s.font.display, fontSize: 18 }}>{g.value}</div>
                    <button onClick={() => g.set(g.value + 1)} style={{
                      width: 32, height: 32, border: `1px solid ${A_s.color.line}`, background: A_s.color.white, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                    }}><Icon name="plus" size={14} color={A_s.color.ocean}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${A_s.color.line}` }}>
            <AButton variant="ghost" size="sm" onClick={() => setState({ checkIn: null, checkOut: null, adults: 2, children: 0 })}>초기화</AButton>
            <AButton variant="primary" size="sm" onClick={() => setOpen(false)}>확인</AButton>
          </div>
        </div>
      )}
    </div>
  );
};

window.ASearchBox = ASearchBox;
