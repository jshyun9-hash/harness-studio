# 리조트 예약 시스템 — v2 변경 요청

## 개요

v1 (사용자 전용, 회원가입·객실조회·예약·예약확인) 을 기반으로 **관리자 모듈 추가**와 **디자인 리뉴얼**, **일자별 재고/요금 모델 도입**, **예약 플로우 확장**을 진행한다.

사용자 프론트의 UI 는 `design_handoff_byul_resort/` 의 Byul Resort Version A 디자인(Hi-fi JSX 프로토타입) 을 참고하여 Tailwind 로 재구성한다.

---

## v1 에서 유지되는 것

- user 모듈 기본 기능 (회원가입 / 로그인 / 객실 조회 / 예약 / 예약 확인)
- 회원 유형(일반/분양) 자동 구분 규칙 — `parcel_member_no` 유무로 결정
- 객실별 예약 가능 회원 유형 규칙 (`RoomPermission`)
- 예약 1실 고정 (1예약 = 1객실)

---

## v2 에서 새로 추가되는 것

### 1. 관리자 모듈 추가 (신규)

- 관리자 계정은 **Member 와 별도 테이블** (`AdminUser`) 로 관리
- **user / admin 백엔드를 split** (별도 앱, 별도 포트)
- DB 는 shared (한 파일 공유)
- 세션 쿠키 분리 (`USER_SID` / `ADMIN_SID`) — 같은 브라우저에서 두 모듈 동시 로그인 가능
- user / admin 모두 role 컬럼 없음 (테이블 분리로 권한 경계 확보)

### 2. 일자별 재고 및 회원유형별 요금

- `RoomInventory` (객실 + 일자별 재고) 도입
- `RoomDailyPrice` (객실 + 일자 + 회원유형별 요금) 도입
- `Room.default_stock` / `Room.default_price` (회원유형 무관 단일 기본가) 도입 — 해당 일자에 지정된 값이 없을 때 **fallback**
- 관리자가 기간(from~to) 을 선택해 **일괄로 재고·요금 셋팅** 가능

### 3. 예약 모델 확장

- 체크인/체크아웃 분리 → **다박(N박)** 허용
- 박수 제약: **1 ~ 7박**
- 날짜 제약: **오늘 ~ 6개월 이내**, 과거 날짜 비활성
- 인원 분리: **성인 / 어린이 개별 입력**, `adults + children ≤ Room.capacity`
- 1실 고정 유지
- 다박인 경우 **일자별 요금** 을 UI 에 노출
- 예약 시 일자별 요금을 **ReservationDailyPrice 에 스냅샷 저장** (후일 가격 변경되어도 예약 이력에 영향 없음)

### 4. 예약 플로우 변경

- **결제 Step 없음** (결제가 목적 아님, 카드정보 수집/저장 X)
- 예약은 **2-step**:
  - **Step 1**: 날짜·인원 (기본값 프리셋) → "다음 단계" 클릭 시 **재검증 + 요금 재계산**
  - **Step 2**: 투숙객 정보 입력 → "예약 확정" 버튼 → 최종 검증 + 예약 insert

### 5. 메인 ↔ 리스트 ↔ 상세 전환 규칙

- **메인 (`/`) 은 public** — 객실 리스트를 `default_price` 기준으로 보여줌
- 기본 검색조건 프리셋: **오늘 체크인 / 내일 체크아웃 / 성인 2 / 어린이 0**
- 메인에서 검색 제출 또는 객실 카드 클릭 시
  - **비로그인** → `/login` 리다이렉트 (원래 가려던 경로 + 검색조건 보존) → 로그인 후 원래 페이지로 복귀
  - **로그인** → `/rooms` (검색조건 + 회원타입 반영) 또는 `/rooms/:id` 로 이동
- 조건(`checkIn` / `checkOut` / `adults` / `children`) 은 URL query 로 모든 화면 간 전파
- 리스트는 해당 조건에 대해 **예약 불가 객실을 필터링** (재고 부족·가격 없음·권한 없음)
- 상세 진입 시 조건 불충족이면 `"예약 할 수 없는 객실입니다"` 알림 후 **메인 복귀**

### 6. 공지사항 (신규)

- `Notice` 엔티티 (category: 공지 / 이벤트 / 시설, is_pinned, view_count)
- user: 리스트 + 상세 (public)
- admin: CRUD

### 7. 마이페이지 (축소)

- 프로필 + 내 예약 내역만
- 포인트 / 리뷰 / 찜 **제외** (범위 밖)

### 8. 객실 이미지

- 공통 파일업로드 (`StoredFile`) 사용
- **썸네일 1장** (리스트 노출용, `Room.thumbnail_file_id`) + **갤러리 최대 5장** (`RoomImage` 서브 엔티티)
- 실제 파일 업로드 (placeholder variant 방식 폐기)

### 9. 어드민 대시보드

- 간단한 요약 카드: **오늘 체크인 건수 / 이번 달 예약 건수 / 총 회원 수**

---

## 관리자 주요 화면

| 화면 | 설명 |
|------|------|
| `/admin/login` | 관리자 로그인 (AdminUser 계정) |
| `/admin` | 대시보드 (요약 카드 3개) |
| `/admin/rooms` | 객실 리스트 / 등록 / 수정 / 삭제 |
| `/admin/rooms/:id/calendar` | 일자별 재고 + 회원유형별 요금 일괄 설정 |
| `/admin/rooms/:id/permissions` | 예약 가능 회원유형 설정 |
| `/admin/members` | 회원 리스트 (읽기 + 검색) |
| `/admin/reservations` | 예약 리스트 (검색/필터/상태 변경/취소) |
| `/admin/notices` | 공지 CRUD |

---

## 디자인 토큰 (사용자 프론트)

`design_handoff_byul_resort/` README 및 `tokens.jsx` 참조. 주요 원칙:

- **폰트**: Noto Serif KR (타이틀/숫자) + Pretendard (본문/UI)
- **컬러**: ocean (#0F4C5C 주조), gold (#C8A165 강조), sand (#F4EFE6), cream (#FBF8F2 배경)
- **각진 모서리**: border-radius 2–4px (둥근 카드 금지)
- **골드 상단 라인**: 예약/강조 카드에 `border-top: 3px solid gold`
- **영문 라벨**: `letter-spacing: 4–6px` uppercase (`"ACCOMMODATION"` 등)

관리자 모듈은 하네스 admin 템플릿(Sidebar+Topbar) 기본 스타일 유지 (디자인 적용 대상 아님).

---

## 제외 범위

- 결제 게이트웨이 연동
- 포인트 / 리뷰 / 찜 기능
- 객실 이미지 자동 썸네일 생성
- 다국어 지원

---

## 브레인스토밍 결정 사항 (v2, 2026-04-21)

| 항목 | 결정 |
|------|------|
| 모듈 구성 | user + admin |
| 백엔드 전략 | **split** (user 8081, admin 8084) |
| DB 전략 | **shared**, shared_owner = user (DB 이름 `resortdb`) |
| 권한 모델 | **role 컬럼 없음** — Member(user) / AdminUser(admin) 테이블 분리 |
| 세션 | 쿠키 분리 (`USER_SID` / `ADMIN_SID`) |
| UI 소스 | user: `spec-requests/resort-reservation/design_handoff_byul_resort/` (Tailwind 재구성) · admin: 하네스 admin 템플릿 |
| 예약 박수 | 1 ~ 7박, 오늘 ~ +6개월 |
| 예약 인원 | 성인 / 어린이 분리, `≤ Room.capacity` |
| 예약 스텝 | 2-step (날짜·인원 → 투숙객, **결제 없음**) |
| 회원 표기 | DB: GENERAL/PARCEL · UI: 일반/분양 |
| 포인트 | 미도입 |
| 요금 fallback | `RoomDailyPrice` 없으면 → `Room.default_price` (회원유형 무관 단일값) |
| 재고 fallback | `RoomInventory` 없으면 → `Room.default_stock` |
| 어드민 일괄 설정 | 기간(from~to) 단위 (요일 선택은 미지원) |
| 공지사항 | 포함 (user 리스트+상세, admin CRUD) |
| 마이페이지 | 프로필 + 예약 내역만 |
| 객실 이미지 | 썸네일 1 + 갤러리 최대 5 (공통 파일업로드) |
| 어드민 대시보드 | 오늘 체크인 / 이번 달 예약 / 총 회원 수 카드 3개 |
