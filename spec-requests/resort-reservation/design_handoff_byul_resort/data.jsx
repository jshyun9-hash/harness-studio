// Byul Resort — 샘플 데이터 (객실, 예약)
const ROOMS = [
  {
    id: 'ocean-suite',
    name: '오션 스위트',
    en: 'Ocean Suite',
    desc: '탁 트인 바다 전망의 프리미엄 스위트. 프라이빗 테라스와 욕조.',
    bed: '킹베드 1 + 소파베드',
    size: 68,
    capacity: 4,
    view: '오션 프론트',
    price: 520000,
    priceOwner: 416000,
    rating: 4.9,
    reviews: 182,
    variant: 'ocean',
    amenities: ['free-wifi', 'pool', 'spa', 'parking', 'breakfast'],
    badge: '베스트',
  },
  {
    id: 'terrace-villa',
    name: '테라스 빌라',
    en: 'Terrace Villa',
    desc: '독립형 빌라 타입. 개별 수영장과 선베드가 마련된 프라이빗 공간.',
    bed: '킹베드 2',
    size: 92,
    capacity: 4,
    view: '프라이빗 풀',
    price: 820000,
    priceOwner: 656000,
    rating: 4.8,
    reviews: 96,
    variant: 'pool',
    amenities: ['free-wifi', 'pool', 'spa', 'parking', 'breakfast'],
    badge: '시그니처',
  },
  {
    id: 'sunset-room',
    name: '선셋 디럭스',
    en: 'Sunset Deluxe',
    desc: '서향 창으로 바라보는 석양이 아름다운 디럭스룸.',
    bed: '킹베드 1',
    size: 42,
    capacity: 2,
    view: '오션 사이드',
    price: 340000,
    priceOwner: 272000,
    rating: 4.7,
    reviews: 241,
    variant: 'sunset',
    amenities: ['free-wifi', 'breakfast', 'parking'],
  },
  {
    id: 'garden-room',
    name: '가든 트윈',
    en: 'Garden Twin',
    desc: '정원을 품은 조용한 트윈룸. 가족 여행객에게 인기.',
    bed: '트윈 베드',
    size: 38,
    capacity: 3,
    view: '가든 뷰',
    price: 280000,
    priceOwner: 224000,
    rating: 4.6,
    reviews: 318,
    variant: 'forest',
    amenities: ['free-wifi', 'parking', 'breakfast'],
  },
  {
    id: 'family-suite',
    name: '패밀리 스위트',
    en: 'Family Suite',
    desc: '거실이 분리된 2베드룸 구조. 최대 6인까지 편안하게.',
    bed: '킹베드 1 + 트윈 2',
    size: 78,
    capacity: 6,
    view: '오션 사이드',
    price: 620000,
    priceOwner: 496000,
    rating: 4.8,
    reviews: 127,
    variant: 'dawn',
    amenities: ['free-wifi', 'pool', 'parking', 'breakfast'],
  },
  {
    id: 'standard-room',
    name: '스탠다드',
    en: 'Standard',
    desc: '합리적인 가격의 편안한 스탠다드룸.',
    bed: '더블베드',
    size: 28,
    capacity: 2,
    view: '시티 뷰',
    price: 180000,
    priceOwner: 144000,
    rating: 4.4,
    reviews: 502,
    variant: 'sand',
    amenities: ['free-wifi', 'parking'],
  },
];

const AMENITY_LABELS = {
  'free-wifi': { icon: 'wifi', label: '무료 Wi-Fi' },
  'pool': { icon: 'pool', label: '수영장' },
  'spa': { icon: 'spa', label: '스파' },
  'parking': { icon: 'car', label: '무료 주차' },
  'breakfast': { icon: 'coffee', label: '조식 포함' },
};

const REVIEWS = [
  { name: '김수현', date: '2026.03.18', rating: 5, text: '직원분들이 정말 친절하셨고, 바다 전망이 말로 표현할 수 없이 아름다웠습니다. 기념일에 방문했는데 작은 선물까지 준비해주셔서 감동이었어요.' },
  { name: 'Jane L.', date: '2026.02.27', rating: 5, text: '조용하고 깨끗했습니다. 아이와 함께 갔는데 키즈 어메니티가 잘 준비되어 있어 편했습니다.' },
  { name: '박지우', date: '2026.01.12', rating: 4, text: '조식이 훌륭했습니다. 체크인이 조금 오래 걸린 것을 제외하면 모든 것이 완벽했어요.' },
];

// 공지사항
const NOTICES = [
  { id: 13, category: '이벤트', title: '봄맞이 얼리버드 · 최대 35% 할인 프로모션', date: '2026.04.15', views: 1842, pinned: true },
  { id: 12, category: '공지', title: '5월 종합 점검에 따른 수영장 이용 안내', date: '2026.04.10', views: 642, pinned: true },
  { id: 11, category: '이벤트', title: '기념일 투숙객을 위한 시그니처 패키지 출시', date: '2026.04.02', views: 1205 },
  { id: 10, category: '공지', title: '객실 내 금연 정책 강화 안내', date: '2026.03.28', views: 487 },
  { id: 9, category: '시설', title: '스파 센터 리뉴얼 오픈', date: '2026.03.20', views: 923 },
  { id: 8, category: '공지', title: '개인정보 처리방침 개정 안내 (시행일 4/1)', date: '2026.03.18', views: 312 },
  { id: 7, category: '이벤트', title: '봄의 다이닝 · 셰프 코스 한정 메뉴', date: '2026.03.10', views: 778 },
  { id: 6, category: '시설', title: '피트니스 센터 운영시간 변경 안내', date: '2026.03.05', views: 264 },
  { id: 5, category: '공지', title: '예약 취소 및 환불 규정 변경 안내', date: '2026.02.28', views: 1530 },
  { id: 4, category: '이벤트', title: '발렌타인 스테이 패키지', date: '2026.02.01', views: 892 },
  { id: 3, category: '시설', title: '키즈 라운지 리뉴얼 및 예약제 전환', date: '2026.01.22', views: 410 },
  { id: 2, category: '공지', title: '설 연휴 체크인·체크아웃 운영 안내', date: '2026.01.15', views: 687 },
  { id: 1, category: '공지', title: '2026 신년 인사말 · 대표 드림', date: '2026.01.02', views: 2341 },
];

// 현재 로그인 사용자 (데모) — 'guest' | 'member' | 'owner'
// - guest: 비로그인 (일반회원가)
// - member: 일반회원 (일반회원가)
// - owner: 분양회원 (분양회원가 = 20% 할인)
const CURRENT_USER = {
  name: '홍길동',
  email: 'hongkildong@email.com',
  membership: 'owner',
  membershipLabel: '분양회원',
  points: 48200,
};

window.ROOMS = ROOMS;
window.AMENITY_LABELS = AMENITY_LABELS;
window.REVIEWS = REVIEWS;
window.NOTICES = NOTICES;
window.CURRENT_USER = CURRENT_USER;
