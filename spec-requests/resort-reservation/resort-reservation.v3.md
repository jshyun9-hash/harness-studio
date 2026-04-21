# 리조트 예약 시스템 — v3 변경 요청 (버그 패치 + 하네스 규칙 추가)

## 개요

v2 운영 중 발견한 **회원가입 페이지 input focus 손실** 버그를 수정하고, 동일 패턴이 재발하지 않도록 **하네스 규칙(coding.md + lessons-learned)** 에 React 안티패턴을 명문화한다.

기능/엔티티/API/페이지/권한/디자인 토큰 변경 없음. **코드 1파일 수정 + 하네스 문서 2개 갱신**이 전부.

---

## 발견된 버그

### 증상

`/signup` 페이지에서 어떤 input(아이디/이름/연락처/이메일/비밀번호 등)이든 **한 글자만 입력하면 포커스가 빠지고** 그 다음 입력이 안 됨. 한글 IME 입력 시 합성 중단까지 발생.

### 원인 (React 안티패턴)

[SignupPage.tsx](projects/resort-reservation/frontend/user/src/pages/SignupPage.tsx) 함수 본문 안에서 보조 컴포넌트 `Field` 를 정의:

```tsx
export default function SignupPage() {
  // ...
  const Field = ({ label, children }) => (    // ❌ 매 렌더마다 새 함수 객체
    <div><label>{label}</label>{children}</div>
  );
  return (<form>
    <Field label="아이디"><input value={loginId} onChange={...} /></Field>
  </form>);
}
```

키 입력 → 부모 state 변경 → 부모 리렌더 → `Field` 함수 객체가 매번 새로 만들어짐 → React reconciler 가 **다른 컴포넌트 type 으로 인식** → 기존 DOM 트리 unmount + 새 트리 mount → `<input>` 도 새로 만들어져 포커스 손실.

### 적용한 수정

`Field` 와 `inputClass` 를 SignupPage **함수 외부 (모듈 최상위)** 로 이동. 한 번만 정의되어 같은 컴포넌트 type 으로 유지됨.

---

## 하네스 규칙 추가

### 1. [harness/coding.md](harness/coding.md) — React 패턴 섹션

신규 규칙 추가:

> **컴포넌트 정의는 모듈 최상위에서만 (다른 컴포넌트 내부에 정의 금지)**
> 렌더 함수 본문에서 새 컴포넌트를 정의하면 매 렌더마다 새 컴포넌트 타입이 만들어져 자식 DOM 이 unmount/remount → input focus 손실 / 자식 state 초기화 발생.
> 보조 컴포넌트는 페이지 함수 **밖**으로 추출. 작은 마크업 조각이면 컴포넌트로 만들지 않고 JSX 인라인.

코드 예시 추가 (❌ 금지 / ✅ 허용 두 패턴 비교).

### 2. [skills/lessons-learned.md](skills/lessons-learned.md) — #21 신설

번호 #21 로 전체 사례 + 재현 코드 + 수정 코드 + 관련 안티패턴(`useMemo` 안 컴포넌트 정의, props 로 컴포넌트 타입 동적 전달) 모두 정리.

재현 프로젝트로 `resort-reservation v2 (2026-04-21 SignupPage)` 명시.

---

## 적용 범위 검증

수정 후 `frontend/user/src/pages/` 전체에 같은 안티패턴이 더 있는지 grep:

```bash
grep -r "^\s\+\(const\|function\)\s\+\w\+\s*=\?\s*([^)]*children" frontend/user/src/pages/
```

→ 매치 없음. SignupPage 만 영향.

---

---

## SearchBox UI 재구현 (디자인 정렬)

### 배경

v2 의 `frontend/user/src/components/SearchBox.tsx` 는 **단순 `<input type="date">` 4 칸**으로 구현되어 있어, [design_handoff_byul_resort/versionA-search.jsx](spec-requests/resort-reservation/design_handoff_byul_resort/versionA-search.jsx) 의 ASearchBox + ACalendar 패턴(popover + 듀얼 캘린더 + 인원 카운터)과 큰 차이가 있었다. 사용자 요청으로 디자인 의도에 맞게 전면 재구현.

### 변경 후 동작

- **닫힌 상태**: 4 셀 가로 배치 (체크인 / 체크아웃 / 인원 / 객실 검색 버튼). 각 셀은 한글 라벨 + `5월 12일 화` 형식의 값.
- **체크인·체크아웃 셀 클릭** → 하단 popover 열림 (`날짜` 탭). 듀얼 캘린더 (현재월 + 다음월).
- **인원 셀 클릭** → popover 의 `인원` 탭. 성인(만 13세 이상) / 어린이(만 2~12세) 카운터.
- **popover 내부 탭 토글** 가능 (`날짜` ↔ `인원`).
- **외부 클릭 / ESC / "확인" 버튼** → popover 닫힘.
- **"초기화" 버튼** → 현재 탭만 reset (date → 오늘+내일, people → 성인 2 / 어린이 0).
- **"객실 검색" 버튼** → popover 닫힘 + `onSubmit` 호출.

### 날짜 선택 규칙 (서버 제약 일치)

- 둘 다 비었거나 둘 다 있는 상태에서 클릭 → 새로 시작 (체크인만 설정, 체크아웃 클리어)
- 클릭 날짜 ≤ 기존 체크인 → 새 체크인으로 시작
- 클릭 날짜 > 체크인 → 체크아웃 설정. **nights 1~7 자동 클램프** (8박 이상이면 +7일로)
- 캘린더에서 `오늘 이전` / `오늘+6개월 초과` 일자는 disabled (text-mist + non-clickable)

### 신규 파일

- `frontend/user/src/components/DualCalendar.tsx` — 두 달 캘린더 컴포넌트
- `frontend/user/src/utils/dates.ts` 에 `formatKoCompact()`, `dowLabel()` 추가

### 적용 페이지

`HomePage`, `RoomListPage` 모두 동일 SearchBox 사용. 컴포넌트 props 변경 없으므로 호출 측 코드 수정 불필요.

### 명세 위치

[specs/resort-reservation/resort-reservation.v3.yml](specs/resort-reservation/resort-reservation.v3.yml) 의 `shared_components.SearchBox` / `shared_components.DualCalendar` 섹션에 props·동작·스타일 전부 명시. 다음 v3 (혹은 이후) 재생성 시 이 명세대로 자동 구현되어야 한다.

---

## 예약 Step 1 UI 재구현 + 체크박스 테마 정렬

### 배경

v2 의 [BookingPage.tsx](projects/resort-reservation/frontend/user/src/pages/BookingPage.tsx) Step 1 은 `<input type="date">` 두 칸 + 단순 카운터로 되어 있어 [design_handoff_byul_resort/versionA-flow.jsx](spec-requests/resort-reservation/design_handoff_byul_resort/versionA-flow.jsx) 의 임베디드 캘린더 + "YOUR STAY" 사이드바 레이아웃과 큰 차이. 또한 우측 사이드바가 Step 1 부터 가격 영역을 노출해 사용자 흐름이 어색했다.

추가로, "예약자와 동일" 체크박스가 브라우저 기본 파란색으로 표시되어 ocean 테마와 충돌.

### 변경 후 동작

- **상단 풀폭 StepIndicator 띠**: `●1 날짜·인원 ─── ○2 투숙객 정보` (활성 step 은 ocean filled, 비활성은 mist 보더)
- **Step 1 좌측**:
  - 큰 세리프 타이틀 "머무실 날짜를 선택하세요" + 동적 서브타이틀 (선택 단계에 따라 안내 문구 변화)
  - 임베디드 DualCalendar 카드 (popover 아님, 항상 펼쳐진 상태)
  - 별도 "투숙 인원" 카드 (성인/어린이 CounterRow)
  - 우측 정렬 "다음 단계 →" 버튼 (px-8 py-3, 풀너비 아님)
- **Step 1 우측 (YourStayCard)**:
  - gold 3px 상단 라인 + 흰 배경 카드, sticky
  - 객실 썸네일 + 객실명/뷰/침대
  - 체크인 / 체크아웃 / 인원 (좌측 selection 변경이 실시간 반영)
  - **가격 영역 미노출** — Step 2 진입 시 validation 응답이 들어와야 노출
- **Step 2 좌측**:
  - "투숙객 정보를 입력하세요" 타이틀
  - 예약자 정보 요약 + ThemedCheckbox "예약자와 동일" + 투숙자명/연락처/요청사항
  - 좌측 "← 이전" / 우측 "예약 확정" 버튼
- **Step 2 우측 (YourStayCard)**:
  - validation 응답 기반 가격 breakdown 노출
  - 일반회원: 단일가 × 박수 → 총 결제 금액
  - 분양회원: 일반가 취소선 + "분양회원 할인 -X원" (gold) + 분양회원가 × 박수 + 총 결제 금액

### ThemedCheckbox 패턴

브라우저 기본 파란색 회피를 위해 hidden native input + 시각적 박스 + SVG 체크 마크 패턴:
- 컨테이너 라벨: 체크 시 `border-ocean bg-ocean/5 text-ocean`, 미체크 시 `border-line text-slateBrand`
- 체크 박스: 체크 시 `bg-ocean border-ocean` + 흰색 SVG 체크, 미체크 시 `border-mist`
- 네이티브 `<input>` 은 `sr-only` 로 숨김 (접근성용)

### 명세 위치 (BookingPage)

- v3.yml `shared_components.ThemedCheckbox` / `YourStayCard` 신설
- 같은 파일의 "예약" 페이지 description 에 Step 1/2 레이아웃 + Step 1 가격 미노출 제약 명시 + `components: [DualCalendar, ThemedCheckbox, YourStayCard]` 표시

---

## 마이페이지 본인 예약 취소 기능

### 배경

마이페이지에서 본인의 예약 내역을 볼 수만 있고 취소할 수 없었음. 사용자 요청으로 **투숙일 미경과 + 확정 상태**의 예약에 한해 본인이 직접 취소할 수 있도록 추가.

### 신규 API

`PUT /api/reservations/by-no/{reservationNo}/cancel` (user 모듈)

**서버 검증** (위반 시 4xx + 한글 메시지):
1. 소유자 일치 — 세션 memberId == reservation.member_id 가 아니면 → "본인 예약만 취소할 수 있습니다."
2. 상태 — status === CONFIRMED 가 아니면 → "이미 취소된 예약입니다."
3. 시점 — checkInDate >= today (오늘 포함, 그 이전이면 거부) → "이미 지난 일정의 예약은 취소할 수 없습니다."

**처리**:
- `reservation.status = CANCELLED`
- 해당 기간 (`checkInDate ~ checkOutDate-1`) 각 일자의 `RoomInventory.stock_count += 1` (행이 있는 경우만; 없는 경우는 default_stock fallback 으로 다음 예약 시 자연 복원)

### 프론트 변경

[MyPage.tsx](projects/resort-reservation/frontend/user/src/pages/MyPage.tsx)

- 카드 구조 변경 — 기존엔 카드 전체가 `<Link>` 였으나 내부에 버튼을 두기 위해 카드는 `<div>` 로, 객실번호·객실명만 `<Link>` 로 분리
- 카드 하단에 "상세 보기" + (조건부) "예약 취소" 버튼
- **"예약 취소" 노출 조건**: `status === 'CONFIRMED' && checkInDate >= today` (이미 취소됐거나 투숙일이 지난 예약은 버튼 자체가 보이지 않음)
- 취소 버튼 스타일 — coral 보더/텍스트 + 호버 시 coral 채움. 사이트 테마와 일치
- 클릭 시 [ConfirmDialog](projects/resort-reservation/frontend/user/src/components/common/ConfirmDialog.tsx) 노출 (gold 상단 라인, danger variant)
- 확인 시 `reservationApi.cancel(reservationNo)` 호출 → 성공 시 toast + 리스트 reload

### 신규 컴포넌트

**ConfirmDialog** — 모달 확인 대화상자 (사용자 측 첫 dialog). admin 측에는 이미 있던 패턴을 사용자 테마(ocean/coral/gold)로 포팅.

### 명세 위치

- v3.yml `apis` 섹션에 신규 cancel 엔드포인트 추가
- v3.yml `shared_components.ConfirmDialog` 신설
- v3.yml "마이페이지" 페이지 description 에 카드 하단 액션 + 취소 버튼 노출 조건 + ConfirmDialog 사용 + 스타일 제약 명시
- v3.yml `business_rules` 에 "예약 취소 권한" 섹션 신설 (본인 취소 vs 관리자 취소 차이)

---

## 변경 사항 / 비변경 사항

| 항목 | v2 → v3 |
|------|---------|
| 엔티티 / 테이블 | **변경 없음** |
| API | **신규 1개** — `PUT /api/reservations/by-no/{reservationNo}/cancel` (user 본인 예약 취소) |
| 페이지 / 라우트 | **변경 없음** (마이페이지에 액션 추가, 라우트 자체는 동일) |
| 권한 / 인증 | **변경 없음** |
| 디자인 토큰 | **변경 없음** |
| seed 데이터 | **변경 없음** |
| **코드 수정** | `frontend/user/src/pages/SignupPage.tsx` — Field/inputClass 를 모듈 최상위로 추출 |
| **코드 재작성** | `frontend/user/src/components/SearchBox.tsx` — popover 패턴<br>`frontend/user/src/pages/BookingPage.tsx` — Step 1 임베디드 캘린더 + StepIndicator + YourStayCard (Step 1 가격 미노출) + ThemedCheckbox<br>`frontend/user/src/pages/MyPage.tsx` — 카드 구조 분리 + 취소 버튼 + ConfirmDialog |
| **신규 컴포넌트** | `frontend/user/src/components/DualCalendar.tsx` (SearchBox + BookingPage Step 1 양쪽 재사용)<br>`frontend/user/src/components/common/ConfirmDialog.tsx` (사용자 측 첫 dialog) |
| **백엔드 추가** | `ReservationService.cancelMyReservation()` + `PUT /api/reservations/by-no/{reservationNo}/cancel` (소유 검증 + status·시점 가드 + 재고 복원) |
| **utils 확장** | `frontend/user/src/utils/dates.ts` — `formatKoCompact`, `dowLabel` |
| **명세 보강** | v3.yml 에 `shared_components` 섹션 신설 — `SearchBox`, `DualCalendar`, **`ThemedCheckbox`**, **`YourStayCard`**. 메인·객실 리스트 → `components: [SearchBox]`. 예약 → `components: [DualCalendar, ThemedCheckbox, YourStayCard]` + Step 1/2 레이아웃 상세 명시 |
| **하네스 추가** | `harness/coding.md` React 패턴 + `skills/lessons-learned.md` #21 |

---

## 브레인스토밍 결정 사항 (v3, 2026-04-21)

- 버전 처리: **증분 수정 (버그 패치)** — 완전 재생성 불필요. DB/seed/스키마 영향 없음.
- 같은 안티패턴이 **다른 프로젝트의 미래 v1 생성 시점에도 자동 차단** 되도록 하네스(coding.md) 에 규칙 명문화 + lessons-learned 에 사례 등록.
- prototype v2 의 패턴(증분 수정 + 하네스 규칙 변경 changelog) 을 그대로 따른다.
