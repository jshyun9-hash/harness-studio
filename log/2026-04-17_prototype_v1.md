# 빌드 로그 — prototype v1

- **일시**: 2026-04-17 (세션 1 ~ 세션 5)
- **명세 파일**: [specs/prototype/prototype.v1.yml](../specs/prototype/prototype.v1.yml)
- **원문**: [spec-requests/prototype/prototype.v1.md](../spec-requests/prototype/prototype.v1.md)
- **UI 자료**: `spec-requests/prototype/prototype_claude.html` (모바일 HTML 프로토타입), `spec-requests/prototype/프로토타입_ux.pdf`
- **생성 방식**: 신규 생성 (세션 5회 분할)
- **이전 버전**: 없음 (신규)
- **구조 케이스**: **Case 3** — split backend + shared DB
- **총 소요시간 (세션 합산 추정)**: 약 3시간
- **총 토큰 사용량 (추정)**: 입력: ~650K / 출력: ~280K

---

## 세션 분할 개요

| 세션 | 범위 | 결과 |
|------|------|------|
| 세션 1 | 백엔드 기반 (양쪽 스캐폴딩, 엔티티 13개, Repository, 공통 클래스, File/Code 모듈) | 양쪽 `compileJava` 통과 |
| 세션 2 | 백엔드 도메인 API 완성 (Home/Title/Auth/Banner/Section/Cast/SiteSetting/Code-Admin) + Seed | 양쪽 `./gradlew build -x test` **BUILD SUCCESSFUL** |
| 세션 3 | Frontend user (모바일 custom UI, 3 페이지) | `tsc -b` ✓ / `vite build` ✓ (260 KB) |
| 세션 4 | Frontend admin (12 페이지 + 공통 컴포넌트 세트) | `tsc -b` ✓ / `vite build` ✓ (293 KB) |
| 세션 5 | schema.md + build log + lessons-learned (이 세션) | 문서 산출물 |

---

## 단계별 실행 기록

### Step 0: 사전 환경 체크 & 브레인스토밍
- **사용 스킬**: [skills/discovery.md](../skills/discovery.md) (v1 요구사항 → YML 확정)
- **참조 하네스**: spec-format.md, structure.md
- **판단/행동**:
  - 요구사항(PDF + HTML) 분석 → **Case 3** (사용자 + 관리자 분리, H2 공유)
  - 포트 배정: user FE 5177 / admin FE 5178 / user BE 8082 / admin BE 8083 (resort-reservation 8081/5176 과 충돌 회피)
  - UI 자료: `prototype_claude.html` → user 모듈에 `ui_source` 로 지정 (Tailwind v4 로 포팅)
  - 관리자는 별도 UI 자료 없음 → admin 템플릿 기본값 사용
  - 선행 세션(resort-reservation)의 precheck 결과(Java 21, Node 22.12, npm 10.9) 재사용 → 환경 체크 스킵
- **소요시간**: 약 10분

### Step 1: 백엔드 초기 셋팅 (세션 1)
- **사용 스킬**: [skills/init-backend.md](../skills/init-backend.md)
- **참조 하네스**: stack.md, structure.md, naming.md, coding.md, architecture.md, files.md, common-code.md
- **참조 교훈**: #2 (bootVersion 생략), #4 (properties→yml), #5 (GlobalExceptionHandler), #6 (127.0.0.1 proxy), #12 (toolchain 21), #14 (Spring Boot 버전 고정), #17 (StoredFile 자동 주입)
- **판단/행동**:
  - Spring Initializr 양쪽 (user 8082 / admin 8083) → Spring Boot 3.5.4 + Java 21 로 고정 (#14)
  - application.yml 양쪽 (세션 쿠키 이름 분리 `PROTOTYPE_USER_SID` / `PROTOTYPE_ADMIN_SID`, H2 AUTO_SERVER)
  - 공통 클래스 양쪽 복제: `ApiResponse`, `PageResponse`, `BaseEntity`, `CorsConfig`, `GlobalExceptionHandler`
  - admin 전용: `SessionRoleFilter` (비인증 경로 3개 화이트리스트 외 전부 ADMIN 강제)
  - 엔티티 13개 양쪽 복제 (StoredFile / CodeGroup / CodeItem 포함, Member~TitleCast)
  - **신규 교훈 #15 발생**: `cast` 가 SQL 예약어 → `@Table(name = "cast_member")` 로 회피
  - File 모듈 (FileRefDto, FileUploadResponse, FileService, FileController — user: GET / admin: POST+GET)
  - Code 모듈 공용 조회 (`/api/codes/{groupKey}`)
- **생성 파일**: 양쪽 각 ~45개 = 약 90개 (Repository 13×2 + Entity 13×2 + 공통 8×2 + File/Code 모듈)
- **검증**: 양쪽 `compileJava` 통과
- **소요시간**: 약 25분

### Step 2: 백엔드 도메인 API 완성 (세션 2)
- **사용 스킬**: [skills/crud-page.md](../skills/crud-page.md) (백엔드 파트만)
- **참조 하네스**: architecture.md (API 표준/role 체크), spec-format.md
- **참조 교훈**: #13 (record factory method 이름 충돌 → `ofAvailable()`), #16 (CodeItem FK 컬럼명 관례 `{의미}_code_id`)
- **판단/행동**:
  - user 백엔드
    - `HomeService` + `HomeController` + `HomeResponse` — `GET /api/home` (배너 + 섹션 3종 자동 로직 + siteSetting 한 번에)
    - 섹션 자동 로직 하드코딩: `NEW_RELEASE`(created DESC), `TRENDS`(rating DESC NULLS LAST, created DESC), `KOREA_PICK`(KR + created DESC)
    - `TitleQueryService` + `TitleController` — 검색/필터/정렬/페이지네이션 (JpaSpecificationExecutor)
    - `SeedRunner` (CommandLineRunner) — CodeGroup 3 / CodeItem 13 / Section 3 / SiteSetting(id=1) / admin 계정 seed
  - admin 백엔드
    - `AuthService`+`AuthController` (signup role=ADMIN 자동, 성공 시 세션 저장. login/logout/me/check-id)
    - Banner / Section / Cast / SiteSetting / Code-Admin CRUD
    - Title Admin CRUD + 4개 매핑 일괄 갱신 엔드포인트 (genres/platforms/similar/cast) — 기존 매핑 삭제 후 재생성 패턴
- **생성 파일**: user 측 9개 (Home 3 + Title 6), admin 측 약 35개 (Auth 6 + Banner 4 + Section 3 + Cast 4 + Title 5 + Code 7 + SiteSetting 3 + etc.)
- **검증**: 양쪽 `./gradlew build -x test` **BUILD SUCCESSFUL**
- **소요시간**: 약 50분

### Step 3: Frontend user (세션 3)
- **사용 스킬**: [skills/init-frontend.md](../skills/init-frontend.md) (template: custom) + [skills/crud-page.md](../skills/crud-page.md) (프론트 파트)
- **참조 하네스**: template-user.md (custom 분기), style-guide.md, ux.md
- **참조 교훈**: #8 (제네릭 느슨하게), #11 (현재 페이지 활성 표시)
- **판단/행동**:
  - Vite + React 19 + TS + Tailwind v4 스캐폴딩 (port 5177, proxy → 127.0.0.1:8082)
  - `prototype_claude.html` 구조를 React 컴포넌트로 포팅 (다크 테마 #05070b/#0a0c10, primary #3b9eff)
  - 레이아웃: `PhoneFrame` (desktop 390×844 / 모바일 풀스크린) + `StatusBar` + `BottomNav` (Home/Event/Board 3 탭) + `ScreenShell` (flex-col + bottom slot)
  - **신규 교훈 #18 발생**: HTML 단일 파일 프로토타입의 show/hide state machine 을 그대로 복제하지 말고 React Router 로 분할
  - 페이지 3개: `/` HomePage (로고+검색+배너+Survey+섹션3), `/search` SearchPage (키워드+pill+platform 텍스트+정렬+3열 그리드), `/titles/:id` TitleDetailPage (Hero+Tabs+Accordion+PlatformRow+WatchBar)
  - Board 탭 동작: `/api/home` 재조회 → `siteSetting.boardSurveyUrl` 있으면 새 창, 없으면 alert
  - 비노출 정책 준수 (공유/하트/Account/Cast.role_label/Cast.profile 모두 렌더링 안 함)
- **생성 파일**: 약 25개 (types 4 + api 4 + hooks 4 + components 13: layout 4 / home 5 / search 3 / detail 7)
- **검증**: `tsc -b` ✓ / `vite build` ✓ (260 KB / gzip 81 KB, 54 modules)
- **소요시간**: 약 35분

### Step 4: Frontend admin (세션 4)
- **사용 스킬**: [skills/init-frontend.md](../skills/init-frontend.md) (template: admin) + [skills/crud-page.md](../skills/crud-page.md)
- **참조 하네스**: template-admin.md (공통 컴포넌트 세트 사전 생성 필수), style-guide.md, ux.md, architecture.md
- **참조 교훈**: #9 (authLoading 체크), #10 (모바일 메뉴 Drawer), #11 (활성 메뉴 표시)
- **판단/행동**:
  - Vite 스캐폴딩 (port 5178, proxy → 127.0.0.1:8083)
  - **공통 컴포넌트 세트 사전 생성** (template-admin.md 준수):
    - `table/` DataTable + Pagination + Toolbar
    - `form/` FormSection + FormField + TextInput/TextareaInput/NumberInput/SelectBox/MultiSelectBox/Checkbox/Switch/DatePicker/FileUploader
    - `feedback/` Dialog + ConfirmDialog + Toast(+ToastProvider+useToast) + LoadingSpinner + ErrorAlert + EmptyState
    - `search/` SearchFilter
    - `code/` CodeSelect + CodeMultiSelect
  - 레이아웃: Layout + Sidebar (운영/컨텐츠/시스템 3 그룹) + SidebarDrawer + Topbar
  - 인증: `SessionProvider` + `useSession()` + `ProtectedRoute` (authLoading 완료 후에만 리다이렉트 — #9)
  - 페이지 12개:
    - `/login` + `/signup` (PublicOnly 래핑)
    - `/` Dashboard (통계 카드 + 최근 작품 5건)
    - Banner: list / new / :id (FormPage `mode` 분기)
    - Section: list (Switch 토글 + NumberInput blur 자동 저장)
    - Title: list / new / :id (기본정보 + 4 매핑 편집기: Genre/Platform/Similar/Cast)
    - Cast: list / new / :id
    - `/codes` (그룹 사이드바 + 아이템 테이블 + Dialog 편집기)
    - `/settings` (로고 업로더 + Board 설문 URL)
  - 원시 요소 직접 사용 없음 (<table>/<input>/alert/window.confirm 금지 준수, 모두 공통 컴포넌트 경유)
- **생성 파일**: 약 55개 (types 7 + api 8 + common components 18 + layout 5 + pages 15 + app/main/css)
- **검증**: `tsc -b` ✓ / `vite build` ✓ (293 KB / gzip 87 KB, 75 modules)
- **소요시간**: 약 55분

### Step 5: 하네스 피드백
- **세션 1 (init-backend)**: 신규 교훈 2건 발생
  - #14 Spring Boot 4.0 Milestone 회피 → 3.5.x 고정 + starter 이름 표준화
  - #15 SQL 예약어 테이블명 회피 (`cast` → `cast_member`)
- **세션 2 (crud-page backend)**: 신규 교훈 2건 발생
  - #13 Java record static factory method 이름 충돌 (`available()` → `ofAvailable()`)
  - #16 CodeItem FK 컬럼명 관례 `{의미}_code_id` (예: `country_code_id`, `genre_code_id`)
- **세션 3 (frontend user)**: 신규 교훈 1건 발생
  - #18 HTML 프로토타입은 screen visibility state machine 대신 React Router 로 분할
- **세션 4 (frontend admin)**: 신규 교훈 없음 (기존 #9, #10, #11 재확인)
- **harness 신설**: files.md (StoredFile 자동 주입), common-code.md (CodeGroup/CodeItem 자동 주입) — 이번 v1 에서 공통 규칙으로 승격
- **재검증**: 모든 수정 후 빌드 재통과 확인

### Step 6: projects/prototype/schema.md 업데이트 (세션 5)
- **생성 테이블**: 14개 (공통 자동 3 + 도메인 11)
  - 자동 주입: `stored_file`, `code_group`, `code_item`
  - 도메인: `member`, `section`, `banner`, `site_setting`, `title`, `title_genre`, `title_platform`, `title_similar`, `cast_member`, `title_cast`
- **관계도**: StoredFile 허브 + CodeItem 허브 + title 도메인 3개 그룹
- **인덱스/UNIQUE**: 9개 (stored_file_key, code_group_key, code_item(group+key), member.login_id, section.section_key, 4×title_* 매핑 복합 UNIQUE)
- **소요시간**: 약 10분

### Step 7: specs/prototype/log.md 갱신
- **판단/행동**: v1 최신 표시 + 세션 5 완료 마킹 + "생성 방식: 신규 생성 (진행 완료)"

### Step 8: 완료 보고
- **생성 파일 총 수**:
  - 백엔드 user ~60개 + 백엔드 admin ~65개 + 프론트 user ~25개 + 프론트 admin ~55개 = **약 205개** (정확 수치는 git 기준)
- **실행 방법**:
  - user backend: `cd projects/prototype/backend/user && ./gradlew bootRun` → http://localhost:8082
    - H2 콘솔: http://localhost:8082/h2-console (jdbc:h2:file:../../data/prototypedb)
  - admin backend: `cd projects/prototype/backend/admin && ./gradlew bootRun` → http://localhost:8083
  - user frontend: `cd projects/prototype/frontend/user && npm run dev` → http://localhost:5177 (모바일 커스텀 UI)
  - admin frontend: `cd projects/prototype/frontend/admin && npm run dev` → http://localhost:5178/login (seed: admin / admin123)
- **접속 순서**: user backend 먼저 (shared_owner, schema update) → admin backend (validate)

---

## 요약

| 항목 | 값 |
|------|-----|
| 프로젝트 ID | prototype (Moyza) |
| 버전 | v1 |
| 생성 방식 | 신규 생성 (세션 5회 분할) |
| 구조 케이스 | Case 3 — split backend + shared DB |
| 총 소요시간 | 약 3시간 (세션 합산) |
| 총 토큰 사용량 (추정) | 입력: ~650K / 출력: ~280K |
| 백엔드 파일 수 | 약 125개 (user ~60 + admin ~65, 엔티티/Repository 복제 포함) |
| 프론트엔드 파일 수 | 약 80개 (user 25 + admin 55) |
| 테이블 수 | 14개 (자동 3 + 도메인 11) |
| 엔드포인트 수 | user ~5개 + admin ~25개 + 공용(files/codes) = 약 30개 |
| 검증 재시도 횟수 | 세션별 0~1회 (대부분 1-pass) |
| 하네스 피드백 | 5건 (lessons-learned #13 / #14 / #15 / #16 / #18) + harness 신설 2건 (files.md, common-code.md) |
| 사용 스킬 | discovery, init-backend, init-frontend, crud-page, build-log |
| 참조 하네스 | spec-format, structure, naming, coding, architecture, stack, style-guide, ux, schema, template-user, template-admin, files, common-code |
| 특이사항 | UI 자료 HTML 프로토타입(`prototype_claude.html`) Tailwind 로 포팅 · 공통 코드 3그룹 seed · 섹션 자동 로직 하드코딩 · PDF 지시 숨김 요소(공유/하트/Account/role_label/profile) 데이터는 유지하고 사용자 화면에만 비노출 |
