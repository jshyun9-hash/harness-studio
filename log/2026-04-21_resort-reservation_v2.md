# 빌드 로그 — resort-reservation v2

- **일시**: 2026-04-21 (오전 후반 ~ 오후 초반, 단일 멀티턴 세션)
- **명세 파일**: [specs/resort-reservation/resort-reservation.v2.yml](../specs/resort-reservation/resort-reservation.v2.yml)
- **생성 방식**: **완전 재생성** (v1 → v2)
- **이전 버전**: v1 (2026-04-16 생성, 단일 모듈 user)
- **총 경과 시간 (wall-clock, 파일 mtime)**: 약 50 분 (`first=12:02 → last=12:52` UTC)
- **순수 작업 시간**: 약 50 분 (활성 도구 호출 구간 거의 연속)
  - 12:02–12:10: backend init + 공통 클래스
  - 12:10–12:20: 14 entities + 14 repositories + 인증 인프라 (양쪽 백엔드)
  - 12:20–12:28: user 도메인 Service/Controller (Room/Reservation/Notice)
  - 12:28–12:35: admin 도메인 Service/Controller (Code/Dashboard/Room CRUD/Calendar/Member/Reservation/Notice)
  - 12:35–12:45: admin frontend (인프라 + 공통 컴포넌트 + 페이지)
  - 12:45–12:52: user frontend (Byul Resort 디자인 페이지 전부)
- **총 토큰 사용량 (추정)**: 입력 ~600K / 출력 ~150K
  - 추정 근거: 약 250개 파일 생성 × 평균 60줄 ≈ 15,000 줄 출력. 입력은 매 턴마다 누적된 컨텍스트(스펙·하네스·이전 파일 읽기)가 큼.

---

## 단계별 실행 기록

### Step 0: 사전 환경 체크 ✅
- **사용 스킬**: skills/precheck.md
- **결과**: Java 21 (Temurin) / Node 24 / npm 11 / curl 8 / unzip 6 — 모두 통과
- **소요시간**: ~1 분

### Step 1: 백엔드 초기 셋팅 ✅
- **사용 스킬**: skills/init-backend.md (split + shared DB 모드)
- **참조 하네스**: stack.md, structure.md, naming.md, coding.md
- **판단/행동**: split backend 두 앱 모두 Spring Initializr 다운로드 → Spring Boot 4.0.5 가 내려왔으므로 **3.5.4 로 다운그레이드** 후 의존성 표준화 (`spring-boot-starter-web`, `spring-security-crypto`, `h2 runtime`). Application 클래스도 `ResortReservationUserApplication` / `ResortReservationAdminApplication` 로 리네임. cookie 이름 `RESORT_USER_SID` / `RESORT_ADMIN_SID` 분리.
- **생성 파일**: 양쪽 backend × {build.gradle.kts, application.yml, Application.java, ApiResponse, PageResponse, BaseEntity, CorsConfig, GlobalExceptionHandler} = ~16개
- **소요시간**: ~8 분 (네트워크 + 다운그레이드)

### Step 2: 프론트엔드 초기 셋팅 ✅
- **사용 스킬**: skills/init-frontend.md
- **참조 하네스**: stack.md, style-guide.md, template-user.md, template-admin.md
- **판단/행동**: Vite + React 19 + TS + Tailwind v4 양쪽 앱 스캐폴딩. user 쪽은 Byul Resort 디자인 토큰을 `@theme` 로 매핑(`--color-ocean/gold/sand/cream`, Noto Serif KR + Pretendard 폰트 로드). admin 쪽은 표준 Slate 테마 + Sidebar/Topbar/Drawer 레이아웃.
- **생성 파일**: 양쪽 frontend × {vite.config.ts, index.css, main.tsx, App.tsx, layout/Header|Footer|Layout 또는 Sidebar/Topbar/SidebarDrawer/Layout} = ~16개
- **소요시간**: ~10 분 (npm install 시간 큼)

### Step 3: 기능 구현 (CRUD + 페이지)
- **사용 스킬**: skills/crud-page.md (도메인별 풀스택 생성)
- **참조 하네스**: 전체 (naming.md, coding.md, architecture.md, ux.md, files.md, common-code.md, spec-format.md)
- **참조 교훈**: lessons-learned.md #4 (yml 교체), #5 (GlobalExceptionHandler), #6 (proxy 127.0.0.1), #9 (authLoading 체크), #10 (모바일 풀스크린 drawer), #11 (네비 활성 표시), #12 (Java 17 → 21 toolchain 조정), #14 (Spring Boot 4.0 → 3.5.4 다운그레이드)
- **판단/행동**:
  - 엔티티: 14개 (Member, AdminUser, Room, RoomImage, RoomAmenity, RoomInventory, RoomDailyPrice, RoomPermission, Reservation, ReservationDailyPrice, Notice, StoredFile, CodeGroup, CodeItem) — user 쪽에 작성 후 `sed` 스크립트로 admin 쪽에 미러링 (패키지명 치환)
  - 인증 분리: `Member` (USER_SID, /api/members/*) vs `AdminUser` (ADMIN_SID, /api/admin/auth/*) — role 컬럼 폐기
  - 가격/재고 fallback: RoomDailyPrice → Room.default_price, RoomInventory → Room.default_stock
  - 예약: 2-step (validate → create), `BR-YYYYMMDD-NNNN` 예약번호, ReservationDailyPrice 스냅샷, RoomInventory upsert + decrement
  - admin Calendar: 기간 일괄 적용 (stock + 회원유형별 prices)
  - 공지: pinned 우선 정렬 + view_count 증가
  - DataInitializer: AdminUser(admin/admin1234) + 4 CodeGroup × 16 CodeItem + Room 6개 + RoomDailyPrice 90일치 + RoomPermission + RoomAmenity + Notice 5건
- **생성 파일**: 백엔드 ~146개, 프론트엔드 ~98개
- **소요시간**: ~30 분 (코드 작성이 대부분)

### Step 4: 검증 ✅
- **backend/user**: `./gradlew build -x test` → ✅ 성공 (10s, 14s on Java toolchain swap)
- **backend/admin**: `./gradlew build -x test` → ✅ 성공 (7s)
- **frontend/user**: `npx tsc -b && npx vite build` → ✅ 성공 (51 modules, 287 KB / gzip 87 KB, 328ms)
- **frontend/admin**: `npx tsc -b && npx vite build` → ✅ 성공 (70 modules, 283 KB / gzip 86 KB, 336ms)
- **소요시간**: ~3 분

### Step 5: 수정 → 하네스 피드백
- **발견 문제 1**: Spring Initializr 가 Spring Boot 4.0.5 + 비표준 starter 이름(`spring-boot-starter-webmvc`, `spring-boot-h2console`)을 내려줌 → 빌드 실패 위험
  - **수정**: build.gradle.kts 를 3.5.4 + 표준 starter 로 직접 재작성
  - **하네스 반영**: 이미 lessons-learned #14 에 기록되어 있음. 다음 init-backend 실행 시 Initializr 호출 직후 build.gradle.kts 버전 고정 자동화 후보.
- **발견 문제 2**: `JavaLanguageVersion.of(17)` 인데 시스템에 Java 21 만 설치 → toolchain auto-detection 실패
  - **수정**: 양쪽 build.gradle.kts → `JavaLanguageVersion.of(21)`
  - **하네스 반영**: lessons-learned #12 에 기록되어 있음. init-backend.md 에 "precheck 결과의 Java major version 을 build.gradle.kts 에 그대로 주입" 보강 후보.
- **발견 문제 3**: `RoomService.Availability` 가 package-private 이라 cross-package(`reservation.service`) 에서 접근 불가
  - **수정**: 클래스 + 메서드를 `public` 으로 승격
  - **하네스 반영**: 신규 교훈 #21 후보 — Service 간 공유 데이터 객체는 처음부터 public 으로
- **발견 문제 4**: 미러링 후 admin 쪽 `AdminUserRepository` 가 stub (existsByLoginId 없음) — DataInitializer 컴파일 실패
  - **수정**: admin AdminUserRepository 에 findByLoginId, existsByLoginId 추가. user 쪽도 동일 (DataInitializer 가 사용)
- **발견 문제 5**: 미러링 시 `ResortReservationUserApplication.java` 가 admin 쪽에도 복사되어 main class 충돌
  - **수정**: admin 쪽 잘못 복사된 파일 + DataInitializer 폴더 삭제

### Step 6: schema.md 작성 ✅
- **추가/변경 테이블**: 14개 (Member, AdminUser, Room, RoomImage, RoomAmenity, RoomInventory, RoomDailyPrice, RoomPermission, Reservation, ReservationDailyPrice, Notice, StoredFile, CodeGroup, CodeItem)
- **소요시간**: ~3 분

### Step 7: specs/.../log.md 갱신 ✅
- **추가된 changelog 엔트리**: v2 (완전 재생성). 빌드로그 링크 연결.
- **소요시간**: ~1 분

### Step 8: 완료 보고
- **생성/수정 파일 총 수**: 백엔드 ~146개 + 프론트엔드 ~98개 + 메타(schema/log) ~3개 = **약 250개**
- **실행 방법**:
  ```bash
  # 백엔드 user (먼저 기동 — DDL 주도권 + seed)
  cd projects/resort-reservation/backend/user && ./gradlew bootRun
  # 백엔드 admin
  cd projects/resort-reservation/backend/admin && ./gradlew bootRun
  # 프론트엔드 user
  cd projects/resort-reservation/frontend/user && npm run dev
  # 프론트엔드 admin
  cd projects/resort-reservation/frontend/admin && npm run dev
  ```
- **접속 URL**:
  - 사용자 사이트: http://localhost:5176
  - 어드민: http://localhost:5179 (계정 `admin / admin1234`)
  - H2 콘솔 (user): http://localhost:8081/h2-console (`jdbc:h2:file:../../data/resortdb`)

---

## 신규 교훈 후보 (lessons-learned 추가 검토)

### #21 Service 간 공유 데이터 객체는 public

```java
// ❌ package-private — 다른 도메인 패키지에서 접근 불가
class Availability { ... }

// ✅ public — Reservation Service 가 RoomService.Availability 를 import
public static class Availability { ... }
```

도메인 간 검증 결과를 공유하는 Result 객체는 처음부터 `public static class` 로.

### #22 멀티 백엔드 미러링 시 main class / 도메인 전용 파일 처리

`sed` 로 user → admin 패키지 치환 미러링 시:
- Application 클래스는 한 쪽에만 존재해야 한다 (다른 쪽에 복사되면 main class 두 개 → 빌드 실패)
- DataInitializer 같은 "한 쪽 책임" 파일도 미러링 후 다른 쪽에서 삭제 필요
- `find -name "ResortReservationXxxApplication.java" -not -name "ResortReservation{appKey}Application.java"` 로 안전하게 정리하는 패턴 권장

### #23 split backend + shared DB 일 때 entity scope

샘플 yml 의 `backend_scope: [user]` 같은 힌트는 **JPA 매핑** 수준에서는 무시되고, 실제로는 양쪽 백엔드에 **모든 엔티티가 매핑되어야** shared_owner=user 의 ddl-auto=update 가 admin 백엔드의 ddl-auto=validate 와 충돌하지 않는다 (admin_user 테이블이 user 백엔드에서도 매핑되어야 user 가 DDL 을 만들고 admin 이 validate 통과).
- 노출 차단은 Service/Controller 레이어에서만 (예: user 백엔드는 AdminUser 의 Repository 만 가지고, Controller 는 정의하지 않음)

---

## 요약

| 항목 | 값 |
|------|-----|
| 프로젝트 ID | resort-reservation |
| 버전 | v2 |
| 생성 방식 | 완전 재생성 |
| 모듈 구성 | user + admin (split backend, shared DB) |
| 총 경과 시간 (wall-clock) | 약 50 분 |
| 순수 작업 시간 | 약 50 분 |
| 총 토큰 사용량 (추정) | 입력 ~600K / 출력 ~150K |
| 백엔드 파일 수 | ~146 개 (user 73, admin 73) |
| 프론트엔드 파일 수 | ~98 개 (user 41, admin 57) |
| 검증 재시도 횟수 | 4 회 (user gradle 1회 + admin gradle 1회 + user tsc 1회 + visibility 수정 후 재빌드 1회) |
| 하네스 피드백 후보 | 3 건 (#21, #22, #23) |
| 사용 스킬 | precheck, init-backend, init-frontend, crud-page, build-log |
| 참조 하네스 | spec-format, stack, structure, naming, coding, architecture, files, common-code, template-user, template-admin, ux, style-guide |

---

## 다음 단계 권장

- **bootRun 통합 테스트**: 사용자 회원가입 → 메인 검색 → 객실 상세(다박 일자별 요금) → 예약 2-step → 마이페이지 → admin 로그인 → 대시보드 → 예약 취소(재고 복원) 플로우 수동 확인
- **객실 이미지 실제 업로드**: 현재는 PlaceholderImage(그라디언트) 사용. admin /rooms/:id/edit 에서 썸네일/갤러리 업로드 후 user 화면 확인
- **공지 추가/수정 후 user 측 노출 확인**
- **lessons-learned 에 #21~23 추가 결정**
