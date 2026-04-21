# resort-reservation 변경 이력

**현재 최신 버전: v3**

## v3 (2026-04-21)

- **생성 방식**: 증분 수정 (버그 패치 + 하네스 규칙 추가 + UI 디자인 정렬)
- **변경 파일**:
  - 코드 수정: [projects/resort-reservation/frontend/user/src/pages/SignupPage.tsx](../../projects/resort-reservation/frontend/user/src/pages/SignupPage.tsx)
  - 코드 재작성: [projects/resort-reservation/frontend/user/src/components/SearchBox.tsx](../../projects/resort-reservation/frontend/user/src/components/SearchBox.tsx)
  - 신규: [projects/resort-reservation/frontend/user/src/components/DualCalendar.tsx](../../projects/resort-reservation/frontend/user/src/components/DualCalendar.tsx)
  - utils 확장: [projects/resort-reservation/frontend/user/src/utils/dates.ts](../../projects/resort-reservation/frontend/user/src/utils/dates.ts) (`formatKoCompact`, `dowLabel`)
  - 하네스: [harness/coding.md](../../harness/coding.md), [skills/lessons-learned.md](../../skills/lessons-learned.md) (#21 신설)
  - 명세: [resort-reservation.v3.yml](resort-reservation.v3.yml) `shared_components.SearchBox` / `DualCalendar` 섹션 신설 + 메인·객실 리스트 페이지에 `components: [SearchBox]` 명시
- **변경 내용**:
  - **버그 패치**: `/signup` 페이지에서 input 한 글자 입력 시 포커스 손실 (한글 IME 합성 중단). 원인은 SignupPage 함수 본문 안에 보조 컴포넌트 `Field` 정의 — 매 렌더마다 새 컴포넌트 type 으로 인식되어 자식 `<input>` unmount/remount. → `Field` 와 `inputClass` 를 모듈 최상위로 추출.
  - **하네스 #21 신설**: "다른 컴포넌트 내부에 컴포넌트를 정의하지 않는다" 규칙 — 재현 코드 + 정답 코드 + 관련 anti-pattern (`useMemo` 안 컴포넌트, props 로 컴포넌트 타입 동적 전달) 정리. 재현 프로젝트로 resort-reservation v2 명시.
  - **coding.md React 패턴 섹션 갱신**: 동일 규칙 한 줄 추가 + ❌/✅ 코드 예시 보강.
  - **SearchBox 디자인 정렬**: v2 의 `<input type="date">` 4 칸 구현을 design_handoff_byul_resort/versionA-search.jsx 의 ASearchBox + ACalendar 패턴(popover + 듀얼 캘린더 + 인원 카운터) 으로 전면 재작성. 닫힌 4 셀(체크인/체크아웃/인원/객실 검색) → 셀 클릭 시 popover, 외부 클릭/ESC/확인 버튼으로 닫힘. 날짜 선택 규칙(1~7박 클램프, 오늘 이전/+6개월 초과 disabled) 그대로 보존.
  - **예약 Step 1 디자인 정렬**: design_handoff_byul_resort/versionA-flow.jsx 기준으로 BookingPage 전면 재작성. 상단 풀폭 StepIndicator 띠 + 좌측 임베디드 DualCalendar 카드 + 별도 "투숙 인원" 카드 + 우측 sticky YourStayCard. **Step 1 에서는 우측 가격 영역 미노출 (좌측 selection 변경은 실시간 반영, 가격 계산은 Step 2 진입 validation 시점에)**. 우측 정렬 "다음 단계 →" 버튼.
  - **체크박스 ocean 테마 정렬**: 네이티브 `<input type=checkbox>` 가 브라우저 기본 파란색으로 표시되어 ocean 테마와 충돌. hidden native input(`sr-only`) + 시각적 박스(체크 시 `bg-ocean border-ocean`) + SVG 체크 마크 패턴(ThemedCheckbox) 으로 교체. "예약자와 동일" 라벨 컨테이너도 체크 시 `border-ocean bg-ocean/5 text-ocean` 으로 강조.
  - **YML 보강**: v3.yml 에 `shared_components` 섹션 신설 — `SearchBox`, `DualCalendar`, **`ThemedCheckbox`**, **`YourStayCard`**, **`ConfirmDialog`** 의 props/동작/스타일/제약 전부 명시. 페이지 description 에 사용 의도("단순 `<input type=date>` 로 구현하지 말 것", "Step 1 가격 미노출", "ThemedCheckbox 강제 사용") 명시. **향후 재생성 시 자동으로 디자인 정렬된 UI 가 만들어지도록 보장**.
  - **마이페이지 본인 예약 취소 기능 추가**: 신규 API `PUT /api/reservations/by-no/{reservationNo}/cancel` (user 모듈). 백엔드 검증 — 소유자 일치 + status=CONFIRMED + checkInDate >= today (위반 시 4xx + 한글 메시지). 성공 시 status=CANCELLED + 해당 기간 RoomInventory.stock_count += 1. 프론트는 마이페이지 카드 하단에 "상세 보기" + (조건부) "예약 취소" 버튼 — 노출 조건은 백엔드와 동일. 신규 ConfirmDialog 컴포넌트 (사용자 측 첫 dialog, gold 상단 라인 + danger=coral / primary=ocean). MyPage 카드 구조 변경 — 카드 전체 `<Link>` → 카드 `<div>` + 객실명/예약번호만 `<Link>` (버튼과 링크 중첩 회피).
  - **business_rules 추가**: "예약 취소 권한" 섹션 — 본인 취소 (CONFIRMED + checkInDate >= today) vs 관리자 취소 (시점 제약 없음, 운영 목적) 구분 명시.
  - 엔티티/페이지(라우트)/권한/seed 변경 없음. API 1개 추가. DB 스키마 영향 없음.

## v2 (2026-04-21)

- **생성 방식**: 완전 재생성 (v1 → v2)
- **관련 빌드 로그**: [log/2026-04-21_resort-reservation_v2.md](../../log/2026-04-21_resort-reservation_v2.md)
- **관련 자료**: [spec-requests/resort-reservation/design_handoff_byul_resort/](../../spec-requests/resort-reservation/design_handoff_byul_resort/) (Byul Resort Version A)
- **변경 내용**:
  - 어드민 모듈 신규 추가 (Case 3 — split backend + shared DB, shared_owner=user)
  - 사용자/관리자 테이블 분리 — role 컬럼 제거, Member(user) / AdminUser(admin) + 세션 쿠키 분리(USER_SID/ADMIN_SID)
  - 사용자 프론트 디자인 리뉴얼 (Byul Resort Version A, Tailwind 재구성)
  - 일자별 재고(RoomInventory), 일자별 + 회원유형별 요금(RoomDailyPrice) 도입
  - Room.default_stock / Room.default_price (회원유형 무관 단일값) — 미지정 일자 fallback
  - 예약 다박 허용 (1~7박), 오늘 ~ +6개월, 성인/어린이 인원 분리, 1실 고정 유지
  - 예약 일자별 요금 스냅샷 (ReservationDailyPrice)
  - 예약 플로우 2-step (날짜·인원 → 투숙객). 결제 Step 없음
  - 객실 이미지 확장 — 썸네일 1장(Room.thumbnail_file_id) + 갤러리 최대 5장(RoomImage), 공통 파일업로드
  - 공지사항(Notice) 신규 — user 조회 / admin CRUD
  - 객실 메타 확장 — 카테고리/영문명/설명/침대/크기/인원/전망/뱃지/어메니티
  - 메인(/) public 유지. 검색 제출·객실 카드 클릭 시 비로그인이면 /login 으로(redirectTo 보존)
  - v1 의 RoomPrice(회원유형별 고정가) 폐기 → default_price + RoomDailyPrice 로 대체

## v1 (2026-04-16)

- **생성 방식**: 신규 생성
- **관련 빌드 로그**: [log/2026-04-16_resort-reservation_v1.md](../../log/2026-04-16_resort-reservation_v1.md)
- **변경 내용**:
  - 초기 버전
  - 회원가입, 로그인, 객실 조회, 객실 예약, 예약 확인 기능
  - 회원 유형(일반/분양) 분기 및 회원별 객실/요금 차등 규칙
