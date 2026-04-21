# Handoff: Byul Resort 예약 사이트

## Overview
Byul Resort는 동해안 해변 기반의 **프리미엄 리조트 예약 사이트**입니다.
본 핸드오프는 **Version A (클래식 럭셔리)** 디자인 기준으로 실제 웹앱을 구현하기 위한 자료입니다.

- **플랫폼**: 반응형 웹 (데스크톱 우선, 모바일 대응 필요)
- **언어**: 한국어 (일부 영문 레이블 병행)
- **무드**: 소노 호텔 앤 리조트 / 아만 리조트 톤. 차분하고 정제된 럭셔리.
- **핵심 차별점**: 회원 등급(일반회원 / 분양회원)에 따라 **예약 단계에서만** 가격이 달라지는 구조

---

## About the Design Files
이 번들에 포함된 파일들은 **HTML/React(JSX)로 제작된 디자인 레퍼런스**입니다.
그대로 프로덕션 코드로 붙여넣는 용도가 아니라, **의도된 룩앤필과 인터랙션을 보여주는 프로토타입**입니다.

개발자는:
- 대상 코드베이스가 이미 존재한다면 → 해당 코드베이스의 기존 패턴/컴포넌트/라이브러리를 사용해 재구성
- 신규 프로젝트라면 → 아래 "기술 스택 제안" 참고해서 Next.js + Tailwind 기반으로 구현 권장

프로토타입은 `<script type="text/babel">`로 React를 브라우저에서 즉석 컴파일하는 구조이므로,
**실제 앱에서는 이 방식을 쓰지 말고** Vite/Next.js 등 표준 번들러 기반으로 재작성해주세요.

---

## Fidelity
**High-fidelity (Hi-fi)** — 색상, 타이포그래피, 간격, 인터랙션까지 최종 의도에 가까운 디자인입니다.
구현 시 픽셀 단위로 가깝게 재현하되, 대상 코드베이스의 기존 컴포넌트 시스템이 있다면 그 위에 맞춰주세요.

---

## 기술 스택 제안 (신규 프로젝트일 경우)

```
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS + CSS Variables (디자인 토큰 매핑)
- Forms: React Hook Form + Zod
- Date: date-fns
- State: React Context or Zustand (예약 상태, 사용자 세션)
- Icons: lucide-react
- Fonts: Noto Serif KR + Pretendard (Google Fonts / pretendard CDN)
```

---

## 라우트 / 화면 구조

| 경로 | 화면 | 역할 | 참고 컴포넌트 파일 |
|---|---|---|---|
| `/login` | 로그인/회원가입 | 탭 전환형, 소셜 로그인 자리 포함 | `versionA-common.jsx` (ALogin) |
| `/` | 홈 | 히어로 + 검색박스 + 추천 객실 그리드 | `versionA-home.jsx` (AHome) |
| `/rooms` | 객실 리스트 | 카테고리 필터 + 전체 객실 카드 | `versionA-pages.jsx` (ARoomsList) |
| `/rooms/[id]` | 객실 상세 | 갤러리 + 탭(소개/시설/리뷰/정책) + sticky 예약 박스 | `versionA-detail.jsx` (ARoomDetail) |
| `/booking?roomId=` | 예약 진행 (3단계) | 날짜·인원 → 투숙객 정보 → 결제 | `versionA-flow.jsx` (ABooking) |
| `/booking/complete` | 예약 확인 | 예약 번호 + 요약 | `versionA-flow.jsx` (AConfirm) |
| `/notices` | 공지사항 리스트 | 카테고리 필터 + 검색 + 페이지네이션 | `versionA-pages.jsx` (ANotices) |
| `/mypage` | 마이페이지 | 프로필 + 예약/포인트/찜 탭 | `versionA-pages.jsx` (AMyPage) |

### 네비게이션 흐름
```
[login] ────────────────────────────────────────┐
                                                │
[home] ─┬─ 검색박스 submit ──► [rooms] ─────────┤
        │                        │              │
        └─ 객실카드 클릭 ────────┴─► [rooms/:id]├─ "예약하기" ──► [booking]
                                                │                    │
                                                │                    ▼
[mypage] ◄── 마이페이지 링크 ────────────────── ┘            [booking/complete]
```

---

## 디자인 토큰

### 컬러 (프로젝트 전역, `tokens.jsx`의 `BYUL.color`에 대응)
```css
/* 브랜드 */
--ocean:   #0F4C5C;   /* 딥 오션 — 주조색 (CTA, 강조) */
--teal:    #2A7F87;   /* 미드 틸 */
--seafoam: #86B8B1;   /* 연한 틸 */
--sand:    #F4EFE6;   /* 따뜻한 모래 */
--cream:   #FBF8F2;   /* 페이지 배경 */
--coral:   #E8826B;   /* 액센트 (노을) */
--gold:    #C8A165;   /* 럭셔리 골드 (상단 라인, 뱃지) */

/* 중립 */
--ink:   #1A2A2E;   /* 본문 강조 텍스트 */
--slate: #5A6A6E;   /* 본문 일반 텍스트 */
--mist:  #A9B4B6;   /* 보조 / 비활성 텍스트 */
--line:  #E4DED2;   /* 구분선 */
--white: #FFFFFF;

/* 상태 */
--success: #4A8B6F;
--warn:    #D4A556;
--danger:  #B64848;
```

### 타이포그래피
```css
--font-display: "Noto Serif KR", "Nanum Myeongjo", serif;   /* 타이틀 / 숫자 */
--font-body:    "Pretendard", -apple-system, system-ui, sans-serif;  /* 본문 / UI */
```

**사용 원칙**
- 섹션 타이틀, 객실명, 큰 숫자(가격) → `--font-display`, weight 400–600, letter-spacing 0.5–2px
- 버튼 / 본문 / 레이블 → `--font-body`
- 작은 영문 레이블 ("ACCOMMODATION", "YOUR STAY") → 11px, letter-spacing 4–6px, uppercase
- 한글 줄간격 기본 1.6–1.8

### 간격 / 레이아웃
```
- 최대 컨테이너 폭: 1280px
- 페이지 좌우 패딩: 48px (desktop), 24px (mobile)
- 섹션 세로 패딩: 80–120px (넉넉하게)
- 컴포넌트 내부 패딩: 24–32px
- 카드 간 gap: 32px
```

### Border Radius (중요 — 각진 느낌이 핵심)
```css
--radius-sm: 2px;   /* 입력, 버튼 */
--radius-md: 4px;   /* 카드 */
--radius-pill: 999px;  /* 뱃지만 */
```
둥근 카드 사용 금지. 직각에 가까운 형태가 Byul Resort의 시그니처입니다.

### Shadow
```css
--shadow-sm: 0 1px 2px rgba(15,76,92,0.06), 0 1px 3px rgba(15,76,92,0.04);
--shadow-md: 0 4px 16px rgba(15,76,92,0.08), 0 2px 6px rgba(15,76,92,0.04);
--shadow-lg: 0 20px 50px rgba(15,76,92,0.12), 0 8px 24px rgba(15,76,92,0.06);
```

---

## 시각 규칙 (꼭 지켜주세요)

1. **골드 상단 라인** — 예약/강조 카드(상세 페이지의 sticky 박스, 예약 요약 카드, 예약 완료 카드)는 `border-top: 3px solid var(--gold)` 적용
2. **세리프 + 산세리프 혼용** — 타이틀은 Noto Serif KR, 나머지는 Pretendard. 절대 Inter/Roboto 사용 금지
3. **각진 모서리** — Border radius 2–4px. 버튼, 입력, 카드 모두
4. **넉넉한 여백** — 섹션 간 80px 이상, 타이틀 아래 "gold hairline"(40×1px 골드 실선) 구분선 패턴 빈번히 사용
5. **영문 라벨 강조** — 한글 타이틀 위 "ACCOMMODATION", "YOUR STAY" 같은 `letter-spacing: 4–6px` 영문 레이블 사용
6. **이미지는 그라디언트 플레이스홀더** — 현재는 `PlaceholderImage` 컴포넌트로 그라디언트+파도 SVG 처리. 실제 구현 시 실사 이미지 교체 (세부: "자산" 섹션)

---

## 데이터 모델

### Room
```ts
type Room = {
  id: string;              // slug, e.g. 'ocean-suite'
  name: string;            // 한글명, e.g. '오션 스위트'
  en: string;              // 영문명, e.g. 'Ocean Suite'
  desc: string;            // 한 줄 설명
  bed: string;             // e.g. '킹베드 1 + 소파베드'
  size: number;            // m²
  capacity: number;        // 최대 인원
  view: string;            // e.g. '오션 프론트'
  price: number;           // 일반회원가 (기준가) — 원/박
  priceOwner?: number;     // 분양회원가 (할인가) — 원/박
  rating: number;          // 0–5
  reviews: number;         // 리뷰 개수
  images: string[];        // 갤러리 이미지 URL
  amenities: ('free-wifi'|'pool'|'spa'|'parking'|'breakfast')[];
  badge?: string;          // '베스트', '시그니처' 등
  variant: string;         // 플레이스홀더 이미지 variant (ocean/sunset/...)
};
```

### User
```ts
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membership: 'guest' | 'member' | 'owner';
  // - guest: 비로그인
  // - member: 일반회원
  // - owner: 분양회원 (할인 혜택 대상)
  membershipLabel: string;   // UI 표기용, e.g. '분양회원'
  points: number;
};
```

### Booking
```ts
type Booking = {
  id: string;              // 'BR-YYYYMMDD-NNNN', e.g. 'BR-20260512-8274'
  userId: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  nights: number;
  unitPrice: number;       // 적용된 단가 (일반가 또는 분양회원가)
  totalPrice: number;      // unitPrice × nights
  discount: number;        // 분양회원 할인 금액 (0이면 할인 없음)
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
};
```

---

## 🔑 핵심 비즈니스 로직: 회원 등급별 가격 노출

**이 프로젝트의 가장 중요한 규칙입니다.**

### 원칙
- **홈 / 객실 리스트 / 객실 상세** → 회원 등급과 무관하게 **일반회원가만** 표시, `520,000원~ / 1박` 형태 (`~` 기호로 "최저가부터" 뉘앙스)
- **예약 진행(/booking) / 예약 확인(/booking/complete)** → 로그인 상태 + 회원 등급에 따라 실제 적용될 가격을 계산해 표시
  - `membership === 'owner'` → 분양회원가 적용, 일반가에 취소선 + "분양회원 할인 -XX원" 라인 + 최종가 강조
  - `membership !== 'owner'` → 일반회원가 그대로, 할인 UI 미노출

### 가격 계산 로직 (의사코드)
```ts
const unitPrice = user.membership === 'owner' && room.priceOwner
  ? room.priceOwner
  : room.price;
const originalTotal = room.price * nights;
const total = unitPrice * nights;
const discount = originalTotal - total;
const isOwner = discount > 0;
```

### UI 상세
- 예약 요약 카드 상단에 `분양회원 전용가 적용` 배지 (골드 배경 15%, 골드 텍스트, star 아이콘)
- 예약 확인 화면 "결제 금액" 레이블 옆에 `분양회원가` 작은 뱃지

### ⚠️ 세금/수수료 처리
- 초기 디자인에는 10% 세금이 있었으나 **제거됨**
- 현재는 단순하게 `unitPrice × nights` 만 표시
- 백엔드에서 별도 수수료 처리 필요 시 UI와 별개로 협의

---

## 화면별 상세

### 1. 홈 (`/`)

**레이아웃**
- Top Nav (logo 좌, 메뉴 중앙, 로그인/마이페이지 우)
- Hero (520px 높이, 오션 그라디언트 풀블리드, 중앙 정렬 텍스트)
  - 영문 tagline "BYUL RESORT · EAST SEA" (letter-spacing 6px)
  - 메인 카피 (세리프, 56px): "머무는 순간,<br/>바다가 된다."
  - 부카피 (15px, opacity 85%): "동해의 가장 조용한 해변에서 맞이하는 나의 리트릿."
- 검색박스 (Hero 하단에 반쯤 걸치게 — `bottom: -52px`, z-index 50)
  - 체크인 / 체크아웃 / 인원 / 검색 버튼 (가로 배치, 각 필드 클릭 시 팝오버)
- 객실 섹션 (padding-top 160px, 배경 cream)
  - "ACCOMMODATION" 작은 영문 레이블 (골드, 11px, letter-spacing 5px)
  - "객실 안내" 대형 세리프 타이틀 (40px)
  - 40×1px 골드 수평선 구분자
  - 부연 설명 문구
  - 카테고리 탭 바 (전체 / 스위트 / 빌라 / 디럭스 / 패밀리) — 활성 탭은 하단 ocean 보더 2px
  - 3열 그리드 객실 카드 (최대 6개)
- Footer (ocean 배경, 4열 그리드)

**객실 카드**
- 이미지 (4:3 비율, 호버 시 shadow-md)
- 좌측: 한글명(22px 세리프) + 영문명(11px 레터스페이싱)
- 우측: 별점 (gold star + rating + review count)
- 설명 (13px slate, 2줄)
- 메타: 침대 / 최대 인원 / m² (12px)
- 하단: 가격 `520,000원~ / 1박` (세리프 22px ocean) + "자세히 보기 →" 링크

### 2. 객실 리스트 (`/rooms`)

- Top Nav → 페이지 헤더 (가운데 정렬, "ACCOMMODATION" 레이블 → "객실 안내" 타이틀)
- 검색 박스 (상단에 다시 노출, 홈에서 넘겨받은 검색조건 유지)
- 검색 조건 요약 바: `2026.05.12 (화) — 2026.05.14 (목) · 2박 · 성인 2 · 어린이 0 | 총 6개의 객실`
- 카테고리 탭 (전체 / 스위트 / 빌라 / 디럭스 / 패밀리 / 스탠다드)
- 3열 객실 그리드 (홈과 동일 카드)
- 정렬 드롭다운 **없음** (의도적으로 제거됨)

### 3. 객실 상세 (`/rooms/[id]`)

**레이아웃**
- 갤러리 그리드 (큰 메인 이미지 1 + 4컷 서브, 우측 상단 "사진 모두 보기" 버튼)
- 2컬럼: 좌측(본문) 2fr / 우측(sticky 예약 박스) 1fr
- 좌측
  - 객실명 (세리프 44px) + 영문명
  - 별점 + 리뷰 수 + 위치(view)
  - 메타 아이콘들 (침대/인원/m²/전망)
  - 탭: 소개 / 시설 / 리뷰 / 정책
  - 설명 본문 (line-height 1.8)
- 우측 sticky 예약 박스 (골드 상단 라인 3px, shadow-md)
  - 가격 큰 숫자 (세리프 32px ocean) + `원~ / 1박`
  - 체크인/체크아웃/인원 필드 (읽기 전용 요약)
  - 요금 내역 (박수 × 단가, 총 금액) — **할인 미표시, 세금 미포함**
  - "예약하기" CTA (풀와이드, ocean primary)
  - 안내 문구 "지금 예약해도 카드는 바로 결제되지 않습니다."

### 4. 예약 진행 (`/booking?roomId=`)

**공통 레이아웃** — 2컬럼 (본문 1fr / sticky 요약카드 380px)

**Step Indicator** (상단)
- 날짜·인원 → 투숙객 정보 → 결제 (3단계, 진행된 스텝은 ocean 채움, 체크 아이콘)

**Step 1: 날짜·인원**
- 듀얼 캘린더 (현재 달 + 다음 달 가로로)
  - 날짜 셀 호버 강조
  - 체크인/체크아웃 선택 상태 ocean 배경
  - 중간 날짜 seafoam 배경
- 인원 카운터 (성인 / 어린이) — 원형 +/- 버튼

**Step 2: 투숙객 정보**
- 성 / 이름 / 이메일 / 휴대전화 / 요청사항 (선택)
- Input 스타일: 하단 보더 강조, 포커스 시 ocean 보더

**Step 3: 결제**
- 결제수단 탭 (신용/체크카드 · 간편결제 · 계좌이체)
- 카드번호 / 유효기간 / CVC
- 약관 동의 체크박스 (ocean accent)

**우측 Sticky 요약 카드**
- "YOUR STAY" 영문 레이블 (골드)
- **분양회원인 경우**: "분양회원 전용가 적용" 뱃지 (골드 배경 15%, star 아이콘)
- 객실 썸네일 + 이름 + 전망 + 침대
- 체크인 / 체크아웃 / 인원 요약
- 요금 내역 (아래 로직 참고)
  - 일반가 × 박수 → 원금 (분양회원이면 취소선)
  - (분양회원만) 분양회원 할인 -XX원 (골드 컬러, 600 weight)
  - (분양회원만) 분양회원가 × 박수 → 할인 적용가
  - 총 결제 금액 (ocean 강조, 큰 글씨)

### 5. 예약 확인 (`/booking/complete`)

- 체크 아이콘 원형 (seafoam 배경 40% + ocean 체크)
- "RESERVATION CONFIRMED" 영문 레이블 (골드)
- "예약이 확정되었습니다" 세리프 36px
- 예약번호 `BR-20260512-8274` (ocean, letter-spacing 1px)
- 확인 이메일 안내
- 예약 카드 (골드 상단 라인)
  - 객실 썸네일 + 이름 + 전망/침대/m²
  - 체크인 / 체크아웃 / 투숙 기간 / 인원 (2×2 그리드, 세리프 18px)
  - 결제 금액 (세리프 22px ocean) + **분양회원이면 옆에 "분양회원가" 뱃지**
- 하단 CTA 2개 ("내 예약 보기" outline / "홈으로" primary)

### 6. 마이페이지 (`/mypage`)
- 프로필 헤더 (이름 / 멤버십 레벨 / 포인트)
- 탭: 예정된 예약 / 지난 예약 / 즐겨찾기 / 포인트 내역
- 예약 카드 + D-day 표시 (체크인까지 남은 일수)

### 7. 공지사항 (`/notices`)
- 카테고리 필터 (전체 / 공지 / 이벤트 / 시설)
- 검색창
- Pinned 공지 먼저 (고정 아이콘 + seafoam 배경)
- 일반 공지 리스트 + 페이지네이션 (페이지당 8개)

---

## 컴포넌트 공통 인벤토리

`versionA-common.jsx`, `tokens.jsx`에 정의된 공통 컴포넌트:

| 컴포넌트 | 설명 |
|---|---|
| `Icon` | 인라인 SVG 아이콘 (lucide와 유사한 라이브러리로 교체 권장) |
| `PlaceholderImage` | 그라디언트 + 파도 SVG 이미지 플레이스홀더. 실이미지 교체 필요 |
| `AButton` | Primary / Outline / Ghost, size sm/md/lg |
| `AInput` | Label + Input (+ 선택 아이콘). 하단 보더 스타일 |
| `ATopNav` | 상단 네비게이션 |
| `AFooter` | 푸터 (ocean 배경) |
| `ASearchBox` | 체크인/체크아웃/인원/검색 통합 박스. 팝오버 기반 |
| `ACalendar` | 월 단위 캘린더 (예약 Step 1에서 듀얼로 사용) |

---

## 인터랙션 & 상태 디테일

### 검색 박스 (`ASearchBox`)
- 필드 클릭 시 팝오버 오픈 (날짜 필드 → 듀얼 캘린더, 인원 필드 → 카운터)
- 팝오버 외부 클릭 시 닫힘
- 검색 제출 → 홈에서는 `/rooms`로 이동 (조건 유지), 리스트 페이지에서는 단순 필터 갱신
- 상태 객체: `{ checkIn: {day, month}, checkOut: {day, month}, adults, children }`

### 검색 조건 전파
- 홈 → 객실 리스트: `search` 상태를 URL query 또는 context로 전달
- 객실 리스트 → 객실 상세 → 예약: 동일한 `checkIn/checkOut`이 자동 채워져야 함 (현재 프로토타입은 메모리 state로 처리)

### 예약 Step 네비게이션
- "다음 단계" 버튼 → step++
- "이전" 버튼 (Step 2, 3에서만 표시) → step--
- Step 3에서 "예약 확정" → `/booking/complete` 라우팅
- Step별 유효성 검증: Step 1은 checkIn/checkOut 둘 다 선택 필수, Step 2는 이름/이메일/전화 필수, Step 3은 카드번호 + 약관 동의 필수

### 애니메이션
- 카드 호버: `transform: scale(1.01)` + shadow 전환 (250ms)
- 팝오버: opacity + translateY 150ms
- 예약 확정 화면의 체크 아이콘: 진입 시 scale 0 → 1 + fade

### 반응형
- 1024px 미만: Hero 텍스트 축소, 그리드 2열
- 768px 미만: 단일 컬럼, TopNav를 햄버거 메뉴로, 검색박스 세로 스택
- 듀얼 캘린더 → 모바일은 단일 달 스크롤 방식 권장

---

## 이미지 / 자산

### 현재 상태
- 모든 객실/배경 이미지는 `PlaceholderImage` 그라디언트 SVG로 처리
- 7가지 variant: `ocean`, `sunset`, `dawn`, `night`, `sand`, `pool`, `forest`

### 실제 구현 시 필요
- 객실 6종 × 각 5–10장 (대표 이미지 + 상세 갤러리)
- 히어로 이미지 3–5장 (계절별 로테이션 선택)
- 시설(스파, 수영장, 다이닝) 이미지 10장 내외
- 스톡 추천: Unsplash (검색어: "luxury resort ocean", "minimal hotel suite", "hanok beach")
  - 예: `https://images.unsplash.com/photo-XXX?w=1600&q=80`
- 아이콘은 `lucide-react`로 교체 권장 (현재 인라인 SVG와 스트로크 1.6으로 톤이 일치)

### 폰트 로드
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet">
```

---

## 파일 목록 (이 번들에 포함된 디자인 레퍼런스)

| 파일 | 내용 |
|---|---|
| `Byul Resort A.html` | **메인 프로토타입 엔트리**. 로컬에서 열어 전체 플로우 확인 가능 |
| `tokens.jsx` | 디자인 토큰 (`BYUL` 오브젝트) + 공통 아이콘/플레이스홀더 |
| `data.jsx` | 샘플 ROOMS, CURRENT_USER, NOTICES, REVIEWS |
| `versionA-common.jsx` | TopNav, Footer, Button, Input, Login 등 공통 컴포넌트 |
| `versionA-search.jsx` | ASearchBox, ACalendar |
| `versionA-home.jsx` | Home 레이아웃 |
| `versionA-pages.jsx` | 객실 리스트 / 공지사항 / 마이페이지 |
| `versionA-detail.jsx` | 객실 상세 페이지 |
| `versionA-flow.jsx` | 예약 진행 3-step + 예약 확인 |

### 프로토타입 실행 방법
`Byul Resort A.html`을 로컬 static 서버(예: `python -m http.server`)로 서빙하면 즉시 확인 가능.
단순 `file://` 오픈 시 module 로딩 이슈가 날 수 있으니 반드시 HTTP로 서빙할 것.

---

## Claude Code 프롬프트 예시

```
이 폴더의 README.md와 versionA-*.jsx 디자인 레퍼런스를 기반으로
Byul Resort 예약 사이트를 Next.js 14 (App Router) + Tailwind CSS로 구현해줘.

핵심 요구사항:
1. README.md의 라우트 구조를 그대로 페이지로 생성
2. tokens.jsx의 컬러/폰트를 tailwind.config.ts의 theme.extend로 매핑
3. versionA-*.jsx의 레이아웃과 시각 디테일(세리프 타이틀, 골드 상단 라인,
   각진 카드, 넉넉한 여백)을 픽셀 단위로 재현
4. data.jsx의 ROOMS를 초기 mock 데이터로 사용 (app/_data/rooms.ts)
5. **회원 등급별 가격 노출 규칙(README.md의 "핵심 비즈니스 로직" 참고)을
   예약 플로우에서 반드시 구현**
6. 공통 컴포넌트는 app/_components/에 정리 (Button, Input, SearchBox,
   Calendar, RoomCard, Nav, Footer 등)
7. 아이콘은 lucide-react로 교체
8. 백엔드는 mock API (app/api/)로 일단 처리

먼저 tailwind.config.ts + 폴더 구조 + 공통 컴포넌트 인터페이스를
제안해주고, 확인 후 페이지별로 구현하자.
```

---

## 다음 단계 체크리스트

- [ ] 실제 리조트 이미지 확보 (6객실 × 5~10장 + 히어로 + 시설)
- [ ] 결제 게이트웨이 선정 (토스페이먼츠 / 아임포트 권장)
- [ ] 인증/회원 시스템 (NextAuth / Supabase Auth / 자체)
- [ ] 회원 등급 로직 백엔드 연동 (분양회원 판별 + priceOwner 서빙)
- [ ] 관리자 페이지 요구사항 정의 (예약 관리, 객실 관리, 회원 관리)
- [ ] 다국어 지원 여부 (현재는 한국어만 - 필요 시 next-intl)
- [ ] 이메일 전송 (예약 확인 메일)
- [ ] 캘린더 실시간 재고 API 연동

---

## 변경 이력 (프로토타입 주요 반영 사항)

- 검색 조건을 홈 → 리스트 → 상세 → 예약까지 전파
- 객실 리스트에서 정렬 드롭다운 제거, 검색조건 요약 바 단순화
- "6가지 객실 타입" 류의 카운트 문구 모두 제거
- 세금/수수료 10% 로직 제거, 단순 `unitPrice × nights`로 통일
- **회원 등급(일반/분양)에 따른 가격 분기 도입** — 리스트/상세는 일반가만, 예약 단계에서만 할인 적용
