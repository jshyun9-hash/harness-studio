# 빌드 로그 — resort-reservation v1

- **일시**: 2026-04-17 13:45 ~ 14:25
- **명세 파일**: specs/resort-reservation/resort-reservation.v1.yml
- **생성 방식**: 신규 생성
- **이전 버전**: 없음 (신규)
- **총 소요시간**: 약 40분
- **총 토큰 사용량 (추정)**: 입력: ~180K / 출력: ~110K

---

## 단계별 실행 기록

### Step 0: 사전 환경 체크
- **사용 스킬**: skills/precheck.md
- **참조 하네스**: (없음)
- **판단/행동**: 이전 로그(2026-04-16)에 통과 확인 (Java 21.0.10, Node 22.12.0, npm 10.9.0, curl 8.8.0, unzip 6.00). 재확인 스킵.
- **소요시간**: 0초 (스킵)

### Step 1: 백엔드 초기 셋팅
- **사용 스킬**: skills/init-backend.md
- **참조 하네스**: stack.md, structure.md, naming.md, coding.md, architecture.md
- **판단/행동**: projects/resort-reservation/backend 없음 → Spring Initializr(기본 bootVersion) + 공통 클래스 생성
- **적용 교훈**: lessons-learned #2(bootVersion 생략), #4(properties→yml), #5(GlobalExceptionHandler), #6(프록시 127.0.0.1), #7(Gradle 버전 주의)
- **신규 교훈 발생**: #12 Java toolchain 버전 미스매치 (아래 Step 4 참고)
- **생성 파일**:
  - application.yml
  - global/common/ApiResponse.java
  - global/common/PageResponse.java
  - global/config/CorsConfig.java (allowCredentials=true)
  - global/config/GlobalExceptionHandler.java
- **소요시간**: 약 2분

### Step 2: 프론트엔드 초기 셋팅
- **사용 스킬**: skills/init-frontend.md
- **참조 하네스**: stack.md, structure.md, style-guide.md, ux.md, coding.md
- **판단/행동**: projects/resort-reservation/frontend 없음 → Vite + Tailwind v4 + react-router-dom + 레이아웃 컴포넌트 생성
- **생성 파일**:
  - vite.config.ts (port 5176, proxy 127.0.0.1:8081)
  - src/index.css (@import tailwindcss)
  - src/components/layout/Layout.tsx, Header.tsx, Footer.tsx, ProtectedRoute.tsx
  - src/types/common.ts (ApiResponse, PageResponse)
- **소요시간**: 약 3분

### Step 3: 기능 구현 (CRUD + 비즈니스 로직)
- **사용 스킬**: skills/crud-page.md
- **참조 하네스**: 전체 (naming.md, coding.md, architecture.md, ux.md, style-guide.md, spec-format.md)
- **참조 교훈**: #9(authLoading 체크), #10(모바일 메뉴), #11(활성 메뉴 표시)
- **판단/행동**: 5개 엔티티(Member, Room, RoomPrice, RoomPermission, Reservation), 7개 API, 6개 페이지 모두 생성
- **생성 파일 (백엔드 약 25개)**:
  - domain/member/: Member.java, MemberType.java, MemberRepository.java, SignupRequest.java, LoginRequest.java, MemberResponse.java, CheckIdResponse.java, MemberService.java, MemberController.java
  - domain/room/: Room.java, RoomPrice.java, RoomPermission.java, RoomRepository.java, RoomPriceRepository.java, RoomPermissionRepository.java, RoomResponse.java, RoomDetailResponse.java, RoomService.java, RoomController.java
  - domain/reservation/: Reservation.java, ReservationStatus.java, ReservationRepository.java, ReservationRequest.java, ReservationResponse.java, ReservationService.java, ReservationController.java
  - global/init/RoomDataInitializer.java (mock 객실 4종 시드)
- **생성 파일 (프론트 약 20개)**:
  - types/: common.ts, member.ts, room.ts, reservation.ts
  - api/: apiClient.ts, memberApi.ts, roomApi.ts, reservationApi.ts
  - hooks/: useSession.tsx, useAsync.ts
  - components/: layout/(Layout, Header, Footer, ProtectedRoute), room/RoomCard
  - pages/: home/HomePage, member/(SignupPage, LoginPage), room/RoomDetailPage, reservation/(ReservationPage, MyReservationsPage)
  - App.tsx (BrowserRouter + SessionProvider + 6개 라우트 + ProtectedRoute)
- **소요시간**: 약 25분

### Step 4: 검증
- **backend**: `./gradlew build` → 1차 실패 (Java toolchain 17 요구 vs 로컬 21) → build.gradle.kts toolchain 21 로 수정 → **성공**
- **frontend**: `npx tsc -b` → 통과, `npx vite build` → **성공** (41 modules, 254KB/ gzip 79KB)
- **소요시간**: 약 2분 (toolchain 수정 포함)

### Step 5: 하네스 피드백
- **lessons-learned.md 추가**:
  - #12 Gradle toolchain 버전은 로컬 JDK와 일치시키기 (Java 17 지정했는데 21만 있어서 실패한 케이스)
  - #13 Java record 의 static factory method 이름은 component 이름과 겹치면 안 된다 (`available()` 충돌 → `ofAvailable()`)
- **재검증**: 위 수정 후 전체 빌드 통과
- **소요시간**: 약 3분

### Step 6: projects/resort-reservation/schema.md 업데이트
- **추가/변경 테이블**: member, room, room_price, room_permission, reservation
- **판단/행동**: 기존에 이관해둔 schema.md가 이미 v1 YML과 일치 → 내용 변경 없음
- **소요시간**: 0분 (확인만)

### Step 7: specs/resort-reservation/log.md
- **판단/행동**: v1 changelog 이미 존재. 새로 재생성된 것이 아닌 같은 v1 YML로의 최초 코드 생성이므로 changelog는 그대로.
- **소요시간**: 0분

### Step 8: 완료 보고
- **생성 파일 총 수**: 백엔드 약 25개 + 프론트엔드 약 20개 = **약 45개**
- **실행 방법**:
  - 백엔드: `cd projects/resort-reservation/backend && ./gradlew bootRun` → http://localhost:8081
    - H2 콘솔: http://localhost:8081/h2-console
  - 프론트: `cd projects/resort-reservation/frontend && npm run dev` → http://localhost:5176

---

## 요약

| 항목 | 값 |
|------|-----|
| 프로젝트 ID | resort-reservation |
| 버전 | v1 |
| 생성 방식 | 신규 생성 |
| 총 소요시간 | 약 40분 |
| 총 토큰 사용량 (추정) | 입력: ~180K / 출력: ~110K |
| 백엔드 파일 수 | 약 25개 |
| 프론트엔드 파일 수 | 약 20개 |
| 검증 재시도 횟수 | 1회 (백엔드 toolchain) |
| 하네스 피드백 | 2건 (lessons-learned #12, #13) |
| 사용 스킬 | precheck(스킵), init-backend, init-frontend, crud-page, build-log |
| 참조 하네스 | stack, structure, spec-format, naming, coding, architecture, style-guide, ux, schema |
