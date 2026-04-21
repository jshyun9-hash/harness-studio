// Byul Resort — Version A: 객실 상세
const A_detail = window.BYUL;

const ARoomDetail = ({ onNav, roomId, onBook }) => {
  const room = window.ROOMS.find((r) => r.id === roomId) || window.ROOMS[0];
  const [tab, setTab] = React.useState('소개');

  return (
    <div style={{ background: A_detail.color.cream, minHeight: '100%' }}>
      <ATopNav onNav={onNav} onLogoClick={() => onNav('home')}/>

      {/* 브레드크럼 */}
      <div style={{ padding: '20px 48px', fontSize: 12, color: A_detail.color.slate, letterSpacing: 0.5 }}>
        <span onClick={() => onNav('home')} style={{ cursor: 'pointer' }}>홈</span>
        <span style={{ margin: '0 8px', color: A_detail.color.mist }}>/</span>
        <span onClick={() => onNav('home')} style={{ cursor: 'pointer' }}>객실</span>
        <span style={{ margin: '0 8px', color: A_detail.color.mist }}>/</span>
        <span style={{ color: A_detail.color.ink }}>{room.name}</span>
      </div>

      {/* 갤러리 */}
      <div style={{ padding: '0 48px', marginBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '260px 260px', gap: 8, maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ gridRow: 'span 2' }}><PlaceholderImage variant={room.variant}/></div>
          <div><PlaceholderImage variant="dawn"/></div>
          <div><PlaceholderImage variant="sunset"/></div>
          <div><PlaceholderImage variant="pool"/></div>
          <div style={{ position: 'relative' }}>
            <PlaceholderImage variant="night"/>
            <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff',
              padding: '6px 12px', fontSize: 11, letterSpacing: 0.5, cursor: 'pointer' }}>+ 12장 더보기</div>
          </div>
        </div>
      </div>

      {/* 메인 */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px 80px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 56 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: A_detail.color.gold, marginBottom: 8, fontWeight: 500 }}>
            {room.en.toUpperCase()}
          </div>
          <div style={{ fontFamily: A_detail.font.display, fontSize: 42, color: A_detail.color.ink, fontWeight: 500, marginBottom: 12 }}>
            {room.name}
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 28, fontSize: 13, color: A_detail.color.slate }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="star" size={14} color={A_detail.color.gold}/>
              <span style={{ color: A_detail.color.ink, fontWeight: 600 }}>{room.rating}</span>
              <span>· 리뷰 {room.reviews}개</span>
            </div>
            <div style={{ width: 1, height: 14, background: A_detail.color.line }}/>
            <div>{room.view}</div>
            <div style={{ width: 1, height: 14, background: A_detail.color.line }}/>
            <div>{room.size}m²</div>
          </div>

          {/* 탭 */}
          <div style={{ display: 'flex', gap: 32, borderBottom: `1px solid ${A_detail.color.line}`, marginBottom: 28 }}>
            {['소개', '시설', '리뷰', '정책'].map((t) => (
              <div key={t} onClick={() => setTab(t)} style={{
                padding: '12px 2px', cursor: 'pointer', fontSize: 14, letterSpacing: 0.5,
                color: tab === t ? A_detail.color.ocean : A_detail.color.slate,
                fontWeight: tab === t ? 600 : 400,
                borderBottom: tab === t ? `2px solid ${A_detail.color.ocean}` : '2px solid transparent',
                marginBottom: -1,
              }}>{t}</div>
            ))}
          </div>

          {tab === '소개' && (
            <div>
              <div style={{ fontSize: 15, color: A_detail.color.ink, lineHeight: 1.9, marginBottom: 32 }}>
                {room.desc} 동해의 수평선을 담아내는 통창과 고요한 톤의 인테리어로 완성되었습니다.
                밤에는 파도 소리를 곁에, 아침에는 가장 먼저 해를 맞이합니다.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                  { icon: 'bed', label: '침구', value: room.bed },
                  { icon: 'users', label: '정원', value: `최대 ${room.capacity}인` },
                  { icon: 'mapPin', label: '전망', value: room.view },
                ].map((x) => (
                  <div key={x.label} style={{ padding: '18px 20px', background: A_detail.color.white, border: `1px solid ${A_detail.color.line}` }}>
                    <Icon name={x.icon} size={18} color={A_detail.color.ocean}/>
                    <div style={{ fontSize: 11, color: A_detail.color.slate, marginTop: 8, letterSpacing: 1 }}>{x.label}</div>
                    <div style={{ fontSize: 14, color: A_detail.color.ink, fontWeight: 500, marginTop: 2 }}>{x.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === '시설' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {room.amenities.map((a) => {
                const info = window.AMENITY_LABELS[a];
                return (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: A_detail.color.white, border: `1px solid ${A_detail.color.line}` }}>
                    <Icon name={info.icon} size={18} color={A_detail.color.ocean}/>
                    <span style={{ fontSize: 14, color: A_detail.color.ink }}>{info.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {tab === '리뷰' && (
            <div>
              {window.REVIEWS.map((r, i) => (
                <div key={i} style={{ padding: '20px 0', borderBottom: i < window.REVIEWS.length - 1 ? `1px solid ${A_detail.color.line}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: A_detail.color.ink }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: A_detail.color.slate }}>{r.date}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Icon key={j} name="star" size={13} color={j < r.rating ? A_detail.color.gold : A_detail.color.line}/>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: A_detail.color.slate, lineHeight: 1.7 }}>{r.text}</div>
                </div>
              ))}
            </div>
          )}

          {tab === '정책' && (
            <div style={{ fontSize: 13, color: A_detail.color.slate, lineHeight: 1.9 }}>
              <div style={{ marginBottom: 12 }}><strong style={{ color: A_detail.color.ink }}>체크인</strong> 15:00 / <strong style={{ color: A_detail.color.ink }}>체크아웃</strong> 11:00</div>
              <div style={{ marginBottom: 12 }}><strong style={{ color: A_detail.color.ink }}>취소 정책</strong> 체크인 7일 전까지 전액 환불, 3일 전 50%.</div>
              <div><strong style={{ color: A_detail.color.ink }}>반려동물</strong> 지정 객실에 한해 가능.</div>
            </div>
          )}
        </div>

        {/* 사이드 예약 박스 */}
        <div>
          <div style={{ position: 'sticky', top: 24, background: A_detail.color.white, padding: 28, borderTop: `3px solid ${A_detail.color.gold}`, boxShadow: A_detail.shadow.md }}>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontFamily: A_detail.font.display, fontSize: 32, fontWeight: 600, color: A_detail.color.ocean }}>
                {room.price.toLocaleString()}
              </span>
              <span style={{ fontSize: 13, color: A_detail.color.slate, marginLeft: 4 }}>원~ / 1박</span>
            </div>

            <div style={{ border: `1px solid ${A_detail.color.line}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${A_detail.color.line}` }}>
                <div style={{ padding: '12px 14px', borderRight: `1px solid ${A_detail.color.line}` }}>
                  <div style={{ fontSize: 10, color: A_detail.color.slate, letterSpacing: 1 }}>체크인</div>
                  <div style={{ fontSize: 14, color: A_detail.color.ink, fontWeight: 500, marginTop: 2 }}>5월 12일</div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: A_detail.color.slate, letterSpacing: 1 }}>체크아웃</div>
                  <div style={{ fontSize: 14, color: A_detail.color.ink, fontWeight: 500, marginTop: 2 }}>5월 14일</div>
                </div>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: A_detail.color.slate, letterSpacing: 1 }}>인원</div>
                <div style={{ fontSize: 14, color: A_detail.color.ink, fontWeight: 500, marginTop: 2 }}>성인 2명</div>
              </div>
            </div>

            <div style={{ margin: '20px 0', paddingTop: 16, borderTop: `1px dashed ${A_detail.color.line}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: A_detail.color.slate, marginBottom: 6 }}>
                <span>{room.price.toLocaleString()}원 × 2박</span>
                <span>{(room.price * 2).toLocaleString()}원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: A_detail.color.ink, fontWeight: 600, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${A_detail.color.line}` }}>
                <span>총 금액</span>
                <span>{(room.price * 2).toLocaleString()}원</span>
              </div>
            </div>

            <AButton variant="primary" size="lg" style={{ width: '100%' }} onClick={() => onBook(room.id)}>
              예약하기
            </AButton>
            <div style={{ fontSize: 11, color: A_detail.color.mist, textAlign: 'center', marginTop: 10 }}>
              지금 예약해도 카드는 바로 결제되지 않습니다.
            </div>
          </div>
        </div>
      </div>

      <AFooter/>
    </div>
  );
};

window.ARoomDetail = ARoomDetail;
