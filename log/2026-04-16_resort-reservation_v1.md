# 빌드 로그 — resort-reservation

- **일시**: 2026-04-16 15:35 ~ 15:45
- **명세 파일**: specs/resort-reservation.yml
- **총 소요시간**: 약 10분
- **총 토큰 사용량 (추정)**: 입력: ~120K / 출력: ~80K

---

## 단계별 실행 기록

### Step 0: 사전 환경 체크
- **사용 스킬**: skills/precheck.md
- **참조 하네스**: (없음)
- **판단/행동**: 이전 대화에서 이미 통과 확인 (Java 17.0.18, Node 22.12.0, npm 10.9.0, curl 8.8.0, unzip 6.00). 재확인 스킵.
- **소요시간**: 0초 (스킵)

### Step 1: 백엔드 초기 셋팅
- **사용 스킬**: skills/init-backend.md
- **참조 하네스**: stack.md, structure.md, naming.md, coding.md, architecture.md
- **판단/행동**: backend/ 없음 → Spring Initializr로 스캐폴딩 후 공통 클래스 생성
- **적용 교훈**: lessons-learned.md #2(bootVersion 생략), #4(properties→yml), #5(GlobalExceptionHandler 필수), #6(프록시 127.0.0.1), #7(Gradle 8.x)
- **생성 파일**:
  - application.yml
  - global/common/ApiResponse.java
  - global/common/PageResponse.java
  - global/config/CorsConfig.java (allowCredentials=true 추가 — 세션 기반)
  - global/config/GlobalExceptionHandler.java
- **소요시간**: 약 1분 30초 (Initializr 다운로드 + 빌드 포함)

### Step 2: 프론트엔드 초기 셋팅
- **사용 스킬**: skills/init-frontend.md
- **참조 하네스**: stack.md, structure.md, style-guide.md, ux.md, coding.md
- **판단/행동**: frontend/ 없음 → Vite 스캐폴딩 + Tailwind + react-router-dom 설치
- **적용 교훈**: lessons-learned.md #3(데모 파일 정리), #8(TypeScript 제네릭), #9(authLoading 체크), #10(풀스크린 서랍), #11(활성 표시)
- **생성 파일**:
  - vite.config.ts (프록시 127.0.0.1:8081)
  - src/index.css (@import tailwindcss)
  - src/main.tsx (BrowserRouter 포함)
  - src/context/AuthContext.tsx
  - src/components/layout/Header.tsx (풀스크린 서랍 + 활성 표시 + 하단 회원정보)
  - src/components/layout/Footer.tsx
  - src/components/layout/Layout.tsx
  - src/types/common.ts
- **소요시간**: 약 1분 (npm install 포함)

### Step 3: 기능 구현
- **사용 스킬**: skills/crud-page.md
- **참조 하네스**: naming.md (PK={table}_id, _count, _name), coding.md (Entity/Controller/Service 패턴), architecture.md (레이어 경계, ApiResponse 래핑), ux.md (로딩/에러/빈상태, 카드 그리드), style-guide.md (Indigo 테마)
- **참조 교훈**: #9(authLoading), #10(풀스크린 서랍), #11(활성 표시)
- **판단/행동**:
  - Member 도메인: Entity + MemberType enum + Repository + SignupRequest/LoginRequest/MemberResponse DTO + Service + Controller (세션 기반 인증)
  - Room 도메인: Entity + RoomPrice/RoomPermission 엔티티 + Repository + RoomResponse DTO + Service + Controller
  - Reservation 도메인: Entity + ReservationStatus enum + Repository + ReservationRequest/ReservationResponse DTO + Service (유형검증+재고검증+날짜검증) + Controller
  - DataInitializer: mock 데이터 4개 객실 + 6개 가격 + 6개 권한
  - 프론트엔드: 6개 페이지 (Home, Signup, Login, RoomDetail, Reservation, MyReservations)
  - API 레이어: memberApi, roomApi, reservationApi
  - 타입: member, room, reservation
- **생성 파일**: 백엔드 24개, 프론트엔드 15개
- **소요시간**: 약 5분

### Step 4: 검증
- **backend**: `./gradlew build` → BUILD SUCCESSFUL in 14s
- **frontend**: `npx tsc -b` → 통과 (에러 0), `npx vite build` → 통과 (424ms)
- **소요시간**: 약 30초

### Step 5: 수정 → 하네스 피드백
- **발견 문제**: 없음 (1회차 빌드 통과)
- **적용된 기존 피드백**: authLoading 체크, 풀스크린 서랍, 활성 표시 — 모두 이전 빌드에서 발견하여 하네스에 반영 완료된 규칙이므로 이번에는 처음부터 적용
- **소요시간**: 0초

### Step 6: schema.md 업데이트
- **추가 테이블**: member, room, room_price, room_permission, reservation
- **관계도**: member ──< reservation >── room, room ──< room_price, room ──< room_permission
- **소요시간**: 약 15초

### Step 7: 완료 보고
- **생성 파일 총 수**: 백엔드 24개 + 프론트엔드 15개 + 설정 5개 = 총 44개
- **소요시간**: 약 10초

---

## 요약

| 항목 | 값 |
|------|-----|
| 총 소요시간 | 약 10분 |
| 총 토큰 사용량 (추정) | 입력: ~120K / 출력: ~80K |
| 백엔드 파일 수 | 29개 (소스 24 + 설정 5) |
| 프론트엔드 파일 수 | 20개 (소스 15 + 설정 5) |
| 검증 재시도 횟수 | 0회 (1회차 통과) |
| 하네스 피드백 | 0건 (기존 규칙으로 충분) |
| 사용 스킬 | precheck(스킵), init-backend, init-frontend, crud-page |
| 참조 하네스 | stack, structure, naming, coding, architecture, style-guide, ux |
| 참조 교훈 | #2,#3,#4,#5,#6,#7,#8,#9,#10,#11 (11개 중 10개 적용) |
