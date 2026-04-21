// Byul Resort — Version A: 예약 진행 + 예약 확인 + 마이페이지
const A_b = window.BYUL;

// ────────────────────────────────────────────────────
// 간단 캘린더
// ────────────────────────────────────────────────────
const ACalendar = ({ checkIn, checkOut, onSelect, monthOffset = 0 }) => {
  // 기준: 2026년 5월
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
      <div style={{ textAlign: 'center', fontFamily: A_b.font.display, fontSize: 18, color: A_b.color.ink, marginBottom: 16, fontWeight: 500 }}>
        {monthName}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontSize: 11, color: A_b.color.slate, marginBottom: 6 }}>
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div key={d} style={{ textAlign: 'center', padding: 6, color: i === 0 ? A_b.color.coral : i === 6 ? A_b.color.ocean : A_b.color.slate, fontWeight: 500, letterSpacing: 0.5 }}>{d}</div>
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
              color: active ? (start || end ? A_b.color.white : A_b.color.ocean) : A_b.color.ink,
              background: between ? A_b.color.seafoam + '55' : 'transparent',
              borderRadius: start ? '50% 0 0 50%' : end ? '0 50% 50% 0' : 0,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: (start || end) ? A_b.color.ocean : 'transparent',
                fontWeight: active ? 600 : 400,
              }}>{d}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────
// 예약 진행 (날짜 / 인원 / 결제 3단계)
// ────────────────────────────────────────────────────
const ABooking = ({ onNav, roomId, onComplete }) => {
  const room = window.ROOMS.find((r) => r.id === roomId) || window.ROOMS[0];
  const [step, setStep] = React.useState(1);
  const [checkIn, setCheckIn] = React.useState({ day: 12, month: 4 });
  const [checkOut, setCheckOut] = React.useState({ day: 14, month: 4 });
  const [selecting, setSelecting] = React.useState('in'); // 'in' | 'out'
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);

  const handleSelect = (d) => {
    if (selecting === 'in') {
      setCheckIn(d);
      setCheckOut(null);
      setSelecting('out');
    } else {
      if (d.day > checkIn.day) {
        setCheckOut(d);
        setSelecting('in');
      } else {
        setCheckIn(d);
      }
    }
  };

  const nights = checkOut && checkIn ? checkOut.day - checkIn.day : 2;
  const user = window.CURRENT_USER || { membership: 'member' };
  const isOwner = user.membership === 'owner';
  const unitPrice = isOwner && room.priceOwner ? room.priceOwner : room.price;
  const originalTotal = room.price * (nights || 1);
  const total = unitPrice * (nights || 1);
  const discount = originalTotal - total;

  return (
    <div style={{ background: A_b.color.cream, minHeight: '100%' }}>
      <ATopNav onNav={onNav} onLogoClick={() => onNav('home')}/>

      {/* 스텝 인디케이터 */}
      <div style={{ padding: '32px 48px', borderBottom: `1px solid ${A_b.color.line}`, background: A_b.color.white }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 60 }}>
          {['날짜·인원', '투숙객 정보', '결제'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step > i + 1 ? A_b.color.ocean : step === i + 1 ? A_b.color.ocean : A_b.color.white,
                color: step >= i + 1 ? A_b.color.white : A_b.color.slate,
                border: `1px solid ${step >= i + 1 ? A_b.color.ocean : A_b.color.line}`,
                fontSize: 13, fontWeight: 600, fontFamily: A_b.font.display,
              }}>
                {step > i + 1 ? <Icon name="check" size={14}/> : i + 1}
              </div>
              <div style={{ fontSize: 13, color: step === i + 1 ? A_b.color.ocean : A_b.color.slate, fontWeight: step === i + 1 ? 600 : 400, letterSpacing: 0.3 }}>{s}</div>
              {i < 2 && <div style={{ width: 60, height: 1, background: A_b.color.line, marginLeft: 12 }}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 48px 80px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48 }}>
        <div>
          {step === 1 && (
            <div>
              <div style={{ fontFamily: A_b.font.display, fontSize: 30, color: A_b.color.ink, marginBottom: 6, fontWeight: 500 }}>
                머무실 날짜를 선택하세요
              </div>
              <div style={{ fontSize: 13, color: A_b.color.slate, marginBottom: 32 }}>
                {selecting === 'in' ? '체크인 날짜를 선택해주세요.' : '체크아웃 날짜를 선택해주세요.'}
              </div>

              <div style={{ background: A_b.color.white, padding: 32, border: `1px solid ${A_b.color.line}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 32 }}>
                <ACalendar checkIn={checkIn} checkOut={checkOut} onSelect={handleSelect} monthOffset={0}/>
                <ACalendar checkIn={checkIn} checkOut={checkOut} onSelect={handleSelect} monthOffset={1}/>
              </div>

              <div style={{ background: A_b.color.white, padding: 24, border: `1px solid ${A_b.color.line}` }}>
                <div style={{ fontFamily: A_b.font.display, fontSize: 20, color: A_b.color.ink, marginBottom: 20, fontWeight: 500 }}>투숙 인원</div>
                {[
                  { label: '성인', sub: '만 13세 이상', value: adults, set: setAdults, min: 1 },
                  { label: '어린이', sub: '만 2~12세', value: children, set: setChildren, min: 0 },
                ].map((g) => (
                  <div key={g.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${A_b.color.line}` }}>
                    <div>
                      <div style={{ fontSize: 15, color: A_b.color.ink, fontWeight: 500 }}>{g.label}</div>
                      <div style={{ fontSize: 12, color: A_b.color.slate, marginTop: 2 }}>{g.sub}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <button onClick={() => g.set(Math.max(g.min, g.value - 1))} style={{
                        width: 32, height: 32, border: `1px solid ${A_b.color.line}`, background: A_b.color.white, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                      }}><Icon name="minus" size={14} color={A_b.color.ocean}/></button>
                      <div style={{ minWidth: 20, textAlign: 'center', fontFamily: A_b.font.display, fontSize: 18 }}>{g.value}</div>
                      <button onClick={() => g.set(g.value + 1)} style={{
                        width: 32, height: 32, border: `1px solid ${A_b.color.line}`, background: A_b.color.white, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                      }}><Icon name="plus" size={14} color={A_b.color.ocean}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ fontFamily: A_b.font.display, fontSize: 30, color: A_b.color.ink, marginBottom: 6, fontWeight: 500 }}>투숙객 정보</div>
              <div style={{ fontSize: 13, color: A_b.color.slate, marginBottom: 32 }}>체크인 시 확인되는 대표 투숙객 정보를 입력해주세요.</div>
              <div style={{ background: A_b.color.white, padding: 28, border: `1px solid ${A_b.color.line}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <AInput label="성" placeholder="홍"/>
                  <AInput label="이름" placeholder="길동"/>
                </div>
                <AInput label="이메일" icon="mail" placeholder="name@email.com"/>
                <AInput label="휴대전화" icon="phone" placeholder="010-0000-0000"/>
                <AInput label="요청사항 (선택)" placeholder="알러지, 늦은 체크인 등 요청사항이 있으시다면 적어주세요."/>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ fontFamily: A_b.font.display, fontSize: 30, color: A_b.color.ink, marginBottom: 6, fontWeight: 500 }}>결제 수단</div>
              <div style={{ fontSize: 13, color: A_b.color.slate, marginBottom: 32 }}>예약 확정을 위해 결제 수단을 선택해주세요.</div>
              <div style={{ background: A_b.color.white, padding: 28, border: `1px solid ${A_b.color.line}` }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  {['신용/체크카드', '간편결제', '계좌이체'].map((m, i) => (
                    <div key={m} style={{
                      flex: 1, padding: '14px 12px', textAlign: 'center', fontSize: 13, cursor: 'pointer',
                      border: `1px solid ${i === 0 ? A_b.color.ocean : A_b.color.line}`,
                      background: i === 0 ? A_b.color.ocean + '08' : A_b.color.white,
                      color: i === 0 ? A_b.color.ocean : A_b.color.slate, fontWeight: i === 0 ? 600 : 400,
                    }}>{m}</div>
                  ))}
                </div>
                <AInput label="카드번호" placeholder="1234 - 5678 - 9012 - 3456"/>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <AInput label="유효기간" placeholder="MM / YY"/>
                  <AInput label="CVC" placeholder="•••"/>
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12, fontSize: 13, color: A_b.color.slate, lineHeight: 1.6 }}>
                  <input type="checkbox" defaultChecked style={{ marginTop: 3, accentColor: A_b.color.ocean }}/>
                  <span>취소 정책 및 이용 약관에 동의합니다. 체크인 7일 전까지 전액 환불됩니다.</span>
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            {step > 1 ? (
              <AButton variant="outline" icon="arrowLeft" onClick={() => setStep(step - 1)}>이전</AButton>
            ) : <div/>}
            <AButton variant="primary" onClick={() => step < 3 ? setStep(step + 1) : onComplete()}>
              {step < 3 ? '다음 단계' : '예약 확정'} <Icon name="arrowRight" size={14}/>
            </AButton>
          </div>
        </div>

        {/* 요약 */}
        <div>
          <div style={{ position: 'sticky', top: 24, background: A_b.color.white, padding: 24, borderTop: `3px solid ${A_b.color.gold}`, boxShadow: A_b.shadow.sm }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: A_b.color.gold, fontWeight: 500, marginBottom: 6 }}>YOUR STAY</div>
            {isOwner && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: A_b.color.gold + '18', color: A_b.color.gold, padding: '6px 12px', fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 14 }}>
                <Icon name="star" size={11} color={A_b.color.gold}/> 분양회원 전용가 적용
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${A_b.color.line}` }}>
              <div style={{ width: 80, height: 80 }}><PlaceholderImage variant={room.variant}/></div>
              <div>
                <div style={{ fontFamily: A_b.font.display, fontSize: 17, color: A_b.color.ink, fontWeight: 500 }}>{room.name}</div>
                <div style={{ fontSize: 12, color: A_b.color.slate, marginTop: 4 }}>{room.view}</div>
                <div style={{ fontSize: 12, color: A_b.color.slate }}>{room.bed}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: A_b.color.slate }}>체크인</span>
              <span style={{ color: A_b.color.ink, fontWeight: 500 }}>{checkIn ? `2026.05.${String(checkIn.day).padStart(2, '0')}` : '-'}</span>
            </div>
            <div style={{ fontSize: 13, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: A_b.color.slate }}>체크아웃</span>
              <span style={{ color: A_b.color.ink, fontWeight: 500 }}>{checkOut ? `2026.05.${String(checkOut.day).padStart(2, '0')}` : '-'}</span>
            </div>
            <div style={{ fontSize: 13, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: A_b.color.slate }}>인원</span>
              <span style={{ color: A_b.color.ink, fontWeight: 500 }}>성인 {adults}{children > 0 ? ` · 어린이 ${children}` : ''}</span>
            </div>
            <div style={{ paddingTop: 16, borderTop: `1px dashed ${A_b.color.line}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: A_b.color.slate, marginBottom: 6 }}>
                <span>{room.price.toLocaleString()}원 × {nights}박</span>
                <span style={{ textDecoration: isOwner ? 'line-through' : 'none', color: isOwner ? A_b.color.mist : A_b.color.slate }}>{originalTotal.toLocaleString()}원</span>
              </div>
              {isOwner && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: A_b.color.gold, marginBottom: 6, fontWeight: 600 }}>
                    <span>분양회원 할인</span>
                    <span>-{discount.toLocaleString()}원</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: A_b.color.slate, marginBottom: 6 }}>
                    <span>분양회원가 {unitPrice.toLocaleString()}원 × {nights}박</span>
                    <span>{total.toLocaleString()}원</span>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, color: A_b.color.ink, fontWeight: 600, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${A_b.color.line}`, fontFamily: A_b.font.display }}>
                <span>총 결제 금액</span>
                <span style={{ color: A_b.color.ocean }}>{total.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AFooter/>
    </div>
  );
};

// ────────────────────────────────────────────────────
// 예약 확인 화면
// ────────────────────────────────────────────────────
const AConfirm = ({ onNav, roomId }) => {
  const room = window.ROOMS.find((r) => r.id === roomId) || window.ROOMS[0];
  const user = window.CURRENT_USER || { membership: 'member' };
  const isOwner = user.membership === 'owner';
  const unitPrice = isOwner && room.priceOwner ? room.priceOwner : room.price;
  return (
    <div style={{ background: A_b.color.cream, minHeight: '100%' }}>
      <ATopNav onNav={onNav} onLogoClick={() => onNav('home')}/>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: A_b.color.seafoam + '40',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <Icon name="check" size={30} color={A_b.color.ocean} strokeWidth={2}/>
          </div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: A_b.color.gold, marginBottom: 10, fontWeight: 500 }}>RESERVATION CONFIRMED</div>
          <div style={{ fontFamily: A_b.font.display, fontSize: 36, color: A_b.color.ink, fontWeight: 500, marginBottom: 12 }}>
            예약이 확정되었습니다
          </div>
          <div style={{ fontSize: 14, color: A_b.color.slate }}>
            예약 번호 <strong style={{ color: A_b.color.ocean, letterSpacing: 1 }}>BR-20260512-8274</strong>
          </div>
          <div style={{ fontSize: 13, color: A_b.color.slate, marginTop: 8 }}>
            확인 메일을 hongkildong@email.com로 전송해드렸습니다.
          </div>
        </div>

        <div style={{ background: A_b.color.white, padding: 32, borderTop: `3px solid ${A_b.color.gold}`, boxShadow: A_b.shadow.sm }}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 28, paddingBottom: 28, borderBottom: `1px solid ${A_b.color.line}` }}>
            <div style={{ width: 140, height: 100 }}><PlaceholderImage variant={room.variant}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: A_b.color.gold, marginBottom: 4 }}>{room.en.toUpperCase()}</div>
              <div style={{ fontFamily: A_b.font.display, fontSize: 24, color: A_b.color.ink, fontWeight: 500 }}>{room.name}</div>
              <div style={{ fontSize: 13, color: A_b.color.slate, marginTop: 8 }}>{room.view} · {room.bed} · {room.size}m²</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {[
              { label: '체크인', value: '2026. 05. 12 (화)', sub: '15:00 이후' },
              { label: '체크아웃', value: '2026. 05. 14 (목)', sub: '11:00 이전' },
              { label: '투숙 기간', value: '2박 3일', sub: null },
              { label: '인원', value: '성인 2명', sub: null },
            ].map((x) => (
              <div key={x.label}>
                <div style={{ fontSize: 11, letterSpacing: 1, color: A_b.color.slate, marginBottom: 4 }}>{x.label}</div>
                <div style={{ fontFamily: A_b.font.display, fontSize: 18, color: A_b.color.ink, fontWeight: 500 }}>{x.value}</div>
                {x.sub && <div style={{ fontSize: 12, color: A_b.color.mist, marginTop: 2 }}>{x.sub}</div>}
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 20, borderTop: `1px dashed ${A_b.color.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: A_b.color.slate }}>
              결제 금액
              {isOwner && <span style={{ marginLeft: 8, fontSize: 11, background: A_b.color.gold + '20', color: A_b.color.gold, padding: '3px 8px', fontWeight: 600, letterSpacing: 0.5 }}>분양회원가</span>}
            </span>
            <span style={{ fontFamily: A_b.font.display, fontSize: 22, color: A_b.color.ocean, fontWeight: 600 }}>
              {(unitPrice * 2).toLocaleString()}원
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <AButton variant="outline" size="lg" style={{ flex: 1 }} onClick={() => onNav('mypage')}>내 예약 보기</AButton>
          <AButton variant="primary" size="lg" style={{ flex: 1 }} onClick={() => onNav('home')}>홈으로</AButton>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────
// 마이페이지
// ────────────────────────────────────────────────────
const AMyPage = ({ onNav }) => {
  return (
    <div style={{ background: A_b.color.cream, minHeight: '100%' }}>
      <ATopNav onNav={onNav} onLogoClick={() => onNav('home')}/>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 48px 80px' }}>
        {/* 프로필 */}
        <div style={{ background: A_b.color.white, padding: 32, borderTop: `3px solid ${A_b.color.gold}`, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: `linear-gradient(135deg, ${A_b.color.ocean}, ${A_b.color.teal})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: A_b.color.white, fontFamily: A_b.font.display, fontSize: 24,
            }}>홍</div>
            <div>
              <div style={{ fontFamily: A_b.font.display, fontSize: 24, color: A_b.color.ink, fontWeight: 500 }}>홍길동 님</div>
              <div style={{ fontSize: 13, color: A_b.color.slate, marginTop: 4 }}>
                <span style={{ color: A_b.color.gold, fontWeight: 600, letterSpacing: 1 }}>GOLD</span> · 2024년 가입
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            {[['3', '예약 완료'], ['1', '예정된 여정'], ['48,200', '보유 포인트']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: A_b.font.display, fontSize: 22, color: A_b.color.ocean, fontWeight: 600 }}>{v}</div>
                <div style={{ fontSize: 11, color: A_b.color.slate, letterSpacing: 1, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: 32, borderBottom: `1px solid ${A_b.color.line}`, marginBottom: 24 }}>
          {['예정된 예약', '지난 예약', '즐겨찾기', '포인트'].map((t, i) => (
            <div key={t} style={{
              padding: '12px 2px', cursor: 'pointer', fontSize: 14, letterSpacing: 0.3,
              color: i === 0 ? A_b.color.ocean : A_b.color.slate,
              fontWeight: i === 0 ? 600 : 400,
              borderBottom: i === 0 ? `2px solid ${A_b.color.ocean}` : '2px solid transparent',
              marginBottom: -1,
            }}>{t}</div>
          ))}
        </div>

        {/* 예약 카드 */}
        {[
          { id: 'ocean-suite', status: '예약 확정', inDate: '05.12', outDate: '05.14', days: 'D-21' },
        ].map((b) => {
          const r = window.ROOMS.find((x) => x.id === b.id);
          return (
            <div key={b.id} style={{ background: A_b.color.white, marginBottom: 16, display: 'grid', gridTemplateColumns: '240px 1fr auto', gap: 28, padding: 0, borderTop: `1px solid ${A_b.color.line}`, borderBottom: `1px solid ${A_b.color.line}` }}>
              <PlaceholderImage variant={r.variant}/>
              <div style={{ padding: '24px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ padding: '3px 10px', background: A_b.color.ocean, color: A_b.color.white, fontSize: 11, letterSpacing: 0.5 }}>{b.status}</div>
                  <div style={{ fontSize: 12, color: A_b.color.coral, fontWeight: 600, letterSpacing: 0.5 }}>{b.days}</div>
                </div>
                <div style={{ fontFamily: A_b.font.display, fontSize: 22, color: A_b.color.ink, fontWeight: 500 }}>{r.name}</div>
                <div style={{ fontSize: 13, color: A_b.color.slate, marginTop: 6 }}>{r.view} · {r.bed}</div>
                <div style={{ marginTop: 14, display: 'flex', gap: 40 }}>
                  <div>
                    <div style={{ fontSize: 11, color: A_b.color.slate, letterSpacing: 1 }}>체크인</div>
                    <div style={{ fontFamily: A_b.font.display, fontSize: 16, color: A_b.color.ink, fontWeight: 500, marginTop: 2 }}>2026.{b.inDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: A_b.color.slate, letterSpacing: 1 }}>체크아웃</div>
                    <div style={{ fontFamily: A_b.font.display, fontSize: 16, color: A_b.color.ink, fontWeight: 500, marginTop: 2 }}>2026.{b.outDate}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '24px 24px 24px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: 12, color: A_b.color.slate, letterSpacing: 0.5 }}>예약번호 BR-20260512-8274</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <AButton variant="ghost" size="sm">예약 변경</AButton>
                  <AButton variant="outline" size="sm">상세 보기</AButton>
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ background: A_b.color.white, padding: 40, textAlign: 'center', border: `1px dashed ${A_b.color.line}`, marginTop: 16 }}>
          <div style={{ fontSize: 14, color: A_b.color.slate, marginBottom: 16 }}>다음 여정이 궁금하신가요?</div>
          <AButton variant="primary" onClick={() => onNav('home')}>객실 둘러보기</AButton>
        </div>
      </div>
      <AFooter/>
    </div>
  );
};

window.ABooking = ABooking;
window.AConfirm = AConfirm;
window.AMyPage = AMyPage;
