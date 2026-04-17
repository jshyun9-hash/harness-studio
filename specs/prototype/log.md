# Prototype (Moyza) — 명세 로그

## 현재 최신 버전

**v1** — 2026-04-17

- 파일: [prototype.v1.yml](prototype.v1.yml)
- 원문: [spec-requests/prototype/prototype.v1.md](../../spec-requests/prototype/prototype.v1.md)
- 자료:
  - `spec-requests/prototype/프로토타입_ux.pdf` — PDF 레퍼런스 (5페이지)
  - `spec-requests/prototype/prototype_claude.html` — HTML 프로토타입 (ui_source)

---

## changelog

### v1 — 2026-04-17 (신규 생성)

**구조**
- 프로젝트: `prototype`
- Case: **Case 3** — split backend + shared DB
- frontend 모듈: `user` (template=custom, ui_source=HTML 프로토타입) + `admin` (template=admin)
- backend 모듈: `user` (port 8082), `admin` (port 8083)
- database: 단일 H2 파일 `prototypedb` (shared_owner=user → user: ddl-auto update / admin: validate)

**포트 할당**
- user frontend: 5177
- admin frontend: 5178
- user backend: 8082
- admin backend: 8083

(resort-reservation 의 8081 / 5176 과 충돌 없음)

**주요 엔티티** (11개 + 공통 자동 주입 3개)
- 도메인: Member, Section(seed 3), Banner, SiteSetting, Title, TitleGenre, TitlePlatform, TitleSimilar, Cast, TitleCast
- 공통 자동: StoredFile, CodeGroup, CodeItem

**공통 코드 3그룹 seed**
- COUNTRY: KR / US / CN / JP
- GENRE: ROMANCE / HORROR / ACTION / COMEDY / BL / DRAMA
- PLATFORM: NETFLIX / TVING / COUPANG

**홈 섹션 자동 로직**
- NEW_RELEASE: 최신순 (created_at DESC)
- TRENDS: 평점 내림차순 (rating DESC NULLS LAST)
- KOREA_PICK: 국가=KR + 최신순
- 관리자는 `is_visible` 토글만 제어

**주요 결정 사항** (브레인스토밍 기록: spec-requests/prototype/prototype.v1.md 참조)
- PDF 숨김 지시 요소(공유/하트/Account/Cast 역할/Cast 프로필)는 데이터는 유지, 사용자 화면에만 비노출
- 플랫폼 바는 TitlePlatform 데이터가 있을 때만 자동 노출
- Watch Now URL은 작품 엔티티에 관리자 수동 입력
- 썸네일(poster)과 상세 히어로(backdrop) 이미지 분리
- 배우는 마스터(Cast) + 매핑(TitleCast, role_label) 분리
- 배너는 홈과 작품 상세에서 동일 리스트 공유

**하네스 신설 (이번 버전에서 공통 규칙으로 승격)**
- [harness/files.md](../../harness/files.md) — `StoredFile` 자동 주입, `projects/{id}/storage/uploads/{yyyy}/{MM}/{file_key}` (ext 없음)
- [harness/common-code.md](../../harness/common-code.md) — `CodeGroup` / `CodeItem` 자동 주입

**admin 공통 컴포넌트 (하네스 규칙)**
- admin 프론트는 `src/components/common/` 세트 사전 생성 (DataTable, SearchFilter, Dialog, FormField, FileUploader 등)
- admin 페이지는 공통 컴포넌트를 통해서만 UI 조립 (`<table>`/`<input>`/`alert`/`window.confirm`/자체 모달 금지)
- user 프론트는 공통 컴포넌트 사전 생성 안 함 (기존 방식)

**인증 정책**
- admin 백엔드 비인증 허용: `/api/admin/auth/signup`, `/api/admin/auth/login`, `/api/admin/auth/check-id/**`
- 그 외 모든 admin API: 로그인 필수 + role=ADMIN
- admin 프론트: 비로그인 상태는 `/login` / `/signup` 만 접근 가능
- 회원가입 시 role=ADMIN 자동 부여 + 자동 로그인

**생성 방식**: 신규 생성 (v1) — **완료 (2026-04-17, 세션 5회 분할)**

**최종 산출물**
- 코드: [projects/prototype/](../../projects/prototype/)
- 스키마: [projects/prototype/schema.md](../../projects/prototype/schema.md) — 14개 테이블 (공통 자동 3 + 도메인 11)
- 빌드 로그: [log/2026-04-17_prototype_v1.md](../../log/2026-04-17_prototype_v1.md)
- 신규 하네스 교훈: [skills/lessons-learned.md](../../skills/lessons-learned.md) #13 / #14 / #15 / #16 / #18
- 신규 하네스 규칙: [harness/files.md](../../harness/files.md), [harness/common-code.md](../../harness/common-code.md)

---

## 구현 진척 (세션 단위)

### 세션 5 (2026-04-17) — 문서 마감 (schema + build log + lessons-learned)

**완료**
- [projects/prototype/schema.md](../../projects/prototype/schema.md) 작성 — 14개 테이블 DDL 요약 + 관계도 (StoredFile/CodeItem 허브 + title 도메인) + 인덱스/UNIQUE 9개 요약
- [log/2026-04-17_prototype_v1.md](../../log/2026-04-17_prototype_v1.md) 작성 — 세션 1~5 전체 빌드 로그, 요약 테이블, 실행 방법
- [skills/lessons-learned.md](../../skills/lessons-learned.md) #18 추가 — "HTML 프로토타입은 screen visibility state machine 을 React Router 로 분할" (세션 3 에서 확정된 패턴을 규칙으로 승격)
- 이 `log.md` 의 "생성 방식" 을 **완료** 로 마킹하고 최종 산출물 링크 정리

**v1 최종 집계**

| 항목 | 값 |
|------|-----|
| 구조 케이스 | Case 3 (split backend + shared DB) |
| 테이블 수 | 14개 |
| 엔드포인트 수 | 약 30개 |
| 백엔드 파일 수 | 약 125개 (user ~60 + admin ~65) |
| 프론트 파일 수 | 약 80개 (user 25 + admin 55) |
| 총 빌드 번들 | user 260 KB + admin 293 KB (gzip 81+87) |
| 신규 하네스 교훈 | 5건 (#13/#14/#15/#16/#18) |
| 신규 하네스 규칙 | 2건 (files.md, common-code.md) |

### 세션 4 (2026-04-17) — Frontend admin (Sidebar + Topbar + 공통 컴포넌트)

**완료**

admin 프론트엔드 (port 5178, template=admin):

- Vite + React 19 + TS + Tailwind v4 스캐폴딩 (`projects/prototype/frontend/admin/`)
  - `vite.config.ts`: port 5178, proxy `/api` → `http://127.0.0.1:8083`
  - react-router-dom v7 + session context + protected route
- 공통 컴포넌트 세트 (harness/template-admin.md 준수, **사전 생성**)
  - table: `DataTable` (generic columns/rowKey/rowActions/sort/loading/empty), `Pagination`, `Toolbar`
  - form: `FormSection`, `FormField`, `TextInput`, `TextareaInput`, `NumberInput`, `SelectBox`, `MultiSelectBox`, `Checkbox`, `Switch`, `DatePicker`, `FileUploader` (업로드 + 미리보기 + 제거)
  - feedback: `Dialog`, `ConfirmDialog`, `Toast`+`ToastProvider`+`useToast`, `LoadingSpinner`, `ErrorAlert`, `EmptyState`
  - search: `SearchFilter` (text/select 조합 + 적용/초기화)
  - code: `CodeSelect`, `CodeMultiSelect` (groupKey 주입 → `/api/codes/{groupKey}` 자동 로드)
- 레이아웃
  - `Layout` + `Sidebar` (nav 그룹 3개: 운영/컨텐츠/시스템) + `Topbar` + `SidebarDrawer` (모바일 햄버거)
  - primary = slate, 컨텐츠 배경 `bg-slate-50`, 둥근 모서리 `rounded-md`
- 인증
  - `SessionProvider` + `useSession()` + `ProtectedRoute` (authLoading 완료 후에만 리다이렉트 — lessons-learned #9 준수)
  - `/login`, `/signup` 은 비로그인만 접근 (`PublicOnly`). 로그인 상태에서 접근 시 `/` 로
- 페이지 12개
  - `/login` LoginPage — 카드형, 실패 시 인라인 에러
  - `/signup` SignupPage — 중복확인 버튼 + 비밀번호 확인, 성공 시 자동 로그인 + 대시보드 이동
  - `/` DashboardPage — 통계 카드 3개(작품/배너/배우 수) + 최근 작품 5건 리스트
  - `/banners`, `/banners/new`, `/banners/:id` BannerFormPage (`mode` 분기) — FileUploader 로 배너 이미지, 노출 체크박스
  - `/sections` SectionListPage — Switch(노출 토글) + NumberInput(순서/최대 노출 수) blur 시 자동 저장
  - `/titles`, `/titles/new`, `/titles/:id` TitleFormPage — 기본정보 + 4개 매핑 편집기:
    - `CodeMultiSelect` 로 장르 (순서 = pill 선택 순서 → sortOrder 0..N)
    - `PlatformsEditor` — 플랫폼 dropdown + watchUrl 입력, 중복 차단
    - `SimilarTitlesEditor` — 작품 dropdown, 자기 자신 제외
    - `CastEditor` — 활성 배우만, roleLabel 입력
    - 저장: 타이틀 생성/수정 → 4개 매핑 병렬 replace (기존 삭제 후 재생성)
  - `/casts`, `/casts/new`, `/casts/:id` CastFormPage
  - `/codes` CodePage — 그룹 사이드바 + 선택 그룹의 아이템 테이블, Dialog 로 추가/수정, system 그룹 배지 표시
  - `/settings` SettingPage — 로고 업로더 + Board 설문 URL
- 아키텍처 규칙 준수
  - 페이지에서 `<table>`/`<input>`/`alert`/`window.confirm` 직접 사용 없음 — 모두 공통 컴포넌트 경유
  - 삭제 확인은 `ConfirmDialog(variant=danger)`
  - 성공/실패 피드백은 `useToast` (알림 영역)
  - 보조 입력 모달은 `Dialog` (CodePage 아이템 편집)
- API 레이어
  - `api/http.ts` (credentials: include, ApiResponse 언래핑, ApiError status 보존)
  - `api/fileApi.ts` (FormData upload)
  - `authApi`, `bannerApi`, `castApi`, `sectionApi`, `siteSettingApi`, `codeApi` (public + admin), `titleApi` (+ replace{Genres,Platforms,Similar,Cast})

**빌드 검증 결과**
- `npm install` ✓
- `npx tsc -b` ✓ (에러 0)
- `npx vite build` ✓ (`dist/assets/index-*.js` 293 KB / gzip 87 KB, 75 modules)

**실행 방법**

```bash
# admin 백엔드 (port 8083) — user 백엔드도 함께 띄워야 H2 공유 DB 가동
cd projects/prototype/backend/admin && ./gradlew bootRun

# admin 프론트 (port 5178)
cd projects/prototype/frontend/admin && npm run dev
```

→ `http://localhost:5178/login` — seed 계정 `admin / admin123` (user 백엔드 SeedRunner 로 주입됨)

**다음 세션 (세션 5)**: `projects/prototype/schema.md` 작성 + `log/2026-04-17_prototype_v1.md` 빌드 로그 + lessons-learned 최종 기록

### 세션 3 (2026-04-17) — Frontend user (모바일 custom UI)

**완료**

user 프론트엔드 (port 5177, template=custom, ui_source=prototype_claude.html):

- Vite + React 19 + TypeScript + Tailwind v4 스캐폴딩 (`projects/prototype/frontend/user/`)
  - `vite.config.ts`: port 5177, proxy `/api` → `http://127.0.0.1:8082`
  - react-router-dom v7 라우팅
- 다크 테마 포팅 (`#05070b` 배경, `#0a0c10` 패널, `#3b9eff` primary)
  - `src/index.css`: tailwind import + 포스터 그라데이션(7종) + fade-in 애니메이션
- 레이아웃 (HTML 프로토타입 구조 그대로 포팅)
  - `components/layout/PhoneFrame.tsx` — 데스크톱 390×844 phone frame (노치+인디케이터), < 500px 풀스크린
  - `components/layout/StatusBar.tsx` — 상단 상태바 (시간/신호/배터리)
  - `components/layout/BottomNav.tsx` — 3탭 (Home / Event / Board), 현재 경로 활성 표시
  - `components/layout/ScreenShell.tsx` — 스크롤 영역 + 고정 bottom 슬롯 (Nav/WatchBar 공용)
- 페이지 3종 (+ SPA 라우팅)
  - `/` HomePage — 로고/검색 진입 버튼, Survey 배너, Banner 캐러셀, 섹션 3종 (가로 스크롤 카드)
  - `/search` SearchPage — 키워드 + Country/Genre pill + Platform 텍스트 토글 + Latest/Rating 정렬 + 3열 그리드
  - `/titles/:id` TitleDetailPage — Hero(backdrop) + Synopsis/Cast/Similar 탭 + PlatformRow + 하단 Watch Now 고정 바
- 컴포넌트 세분화
  - home: `HomeHeader`, `BannerCarousel`, `SectionRow`, `TitleCard` (scroll/grid 듀얼 모드), `SurveyBanner`
  - search: `SearchHeader`, `FilterPanel` (pill/텍스트 토글), `ResultsHeader`
  - detail: `Hero`, `Tabs`, `Accordion`, `MetaPills`, `PlatformRow` (NETFLIX/TVING/coupang 로고 스타일), `CastList`, `WatchBar`
- 상태 레이어
  - `api/http.ts` (공통 fetch + ApiResponse 언래핑, credentials: include)
  - `api/homeApi.ts`, `api/titleApi.ts` (URLSearchParams 다중 반복 파라미터 직렬화), `api/codeApi.ts`
  - `hooks/useHome`, `useTitleList`, `useTitleDetail`, `useCodeList`
- Board 탭 동작
  - 버튼 클릭 시 `/api/home` 재조회 → `siteSetting.boardSurveyUrl` 이 있으면 새 창, 없으면 alert (spec 의 "외부 링크 리다이렉트 또는 새 창" 해석)
- 비노출 정책 준수
  - 공유 아이콘 / 하트 / Account / Cast.role_label / Cast.profileUrl 모두 렌더링 안 함
- 반응형
  - 데스크톱: phone frame 중앙 정렬
  - < 500px: 전체 화면, 노치/인디케이터 숨김 (`max-[500px]:` variant)
- Watch Now URL 없으면 버튼 비활성 (`disabled` + 회색)

**빌드 검증 결과**
- `npm install` ✓
- `npx tsc -b` ✓ (에러 0)
- `npx vite build` ✓ (`dist/assets/index-*.js` 260 KB / gzip 81 KB)

**실행 방법**

```bash
# backend user
cd projects/prototype/backend/user && ./gradlew bootRun   # port 8082

# frontend user (이 세션 산출물)
cd projects/prototype/frontend/user && npm run dev        # port 5177
```

→ `http://localhost:5177` 접속 (데스크톱: phone frame 중앙, 모바일: 풀스크린)

**다음 세션 (세션 4)**: Frontend admin (template=admin, port 5178)

### 세션 2 (2026-04-17) — 백엔드 API 완성

**완료 (Backend 완성)**

user 백엔드 (port 8082):
- SeedRunner (CommandLineRunner) — CodeGroup 3개(COUNTRY/GENRE/PLATFORM), CodeItem 13개, Section 3건(NEW_RELEASE/TRENDS/KOREA_PICK), SiteSetting 싱글톤, 관리자 계정(admin/admin123) seed
- Home: HomeService + HomeController + HomeResponse DTO
  - `GET /api/home` → banners(is_visible, LIMIT 5) + sections(3종 자동 로직) + siteSetting 한 번에
  - 섹션별 하드코딩 로직: NEW_RELEASE(최신순) / TRENDS(평점 DESC, NULLS LAST) / KOREA_PICK(KR + 최신순)
- Title: TitleQueryService + TitleController + DTO(Search/Summary/Detail)
  - `GET /api/titles` (검색/필터/정렬/페이지네이션, JpaSpecificationExecutor 사용)
  - `GET /api/titles/{id}` (genres/platforms/similar/cast 포함 풀 상세)

admin 백엔드 (port 8083):
- Auth: AuthService + AuthController + DTO
  - `POST /api/admin/auth/signup` (role=ADMIN 자동, 성공 시 세션 저장)
  - `POST /api/admin/auth/login` / `POST /logout` / `GET /me` / `GET /check-id/{loginId}`
- Code Admin: CodeAdminService + CodeAdminController
  - code-groups / code-items CRUD
- SiteSetting: `GET/PUT /api/admin/site-setting`
- Banner: `GET/POST/PUT/DELETE /api/admin/banners` + `GET/{id}`
- Section: `GET /api/admin/sections`, `PUT /{id}` (visible/sortOrder/maxCount)
- Cast: `GET/POST/PUT/DELETE /api/admin/casts` + `GET/{id}`
- Title: `GET/POST/PUT/DELETE /api/admin/titles` + 매핑 일괄 갱신:
  - `POST /api/admin/titles/{id}/genres`
  - `POST /api/admin/titles/{id}/platforms`
  - `POST /api/admin/titles/{id}/similar`
  - `POST /api/admin/titles/{id}/cast`

**빌드 검증 결과**
- `./gradlew build -x test` 양쪽 모두 **BUILD SUCCESSFUL** (bootJar 생성)
- 테스트는 아직 작성하지 않았으므로 `-x test` 스킵

**다음 세션 (세션 3)**: Frontend user (모바일, custom UI)

### 세션 1 (2026-04-17) — 백엔드 기반 완료

**완료**
- `projects/prototype/` 디렉토리 (backend/user, backend/admin, frontend, data, storage/uploads)
- Spring Initializr 스캐폴딩 양쪽 (Application 클래스명 `PrototypeUserApplication` / `PrototypeAdminApplication` 로 수정)
- `build.gradle.kts` 양쪽 — **Spring Boot 3.5.4 + Java 21** 로 고정 (Initializr 기본값 Spring Boot 4.0.5 Milestone 회피. lessons-learned #14)
- `application.yml` 양쪽 (user: port 8082 / admin: port 8083, 세션 쿠키 이름 분리, H2 AUTO_SERVER, 파일 저장 root)
- 공통 클래스 양쪽: ApiResponse, PageResponse, BaseEntity, CorsConfig, GlobalExceptionHandler + admin 전용 SessionRoleFilter
- 엔티티 13개 양쪽 복제: StoredFile, Member, CodeGroup, CodeItem, Section, Banner, SiteSetting, Title, TitleGenre, TitlePlatform, TitleSimilar, Cast (**table: cast_member — 예약어 회피, lessons-learned #15**), TitleCast
- Repository 13개 양쪽 복제
- File 모듈: FileRefDto, FileUploadResponse, FileService (양쪽) / FileController (user: GET / admin: 업로드+다운로드)
- Code 모듈: CodeItemResponse, CodeService, CodeController (양쪽 공용 조회)
- **양쪽 백엔드 `compileJava` 통과 확인** ✓

**남은 작업 (다음 세션들)**

세션 2 (백엔드 완성):
- admin CodeAdminController + Code CRUD DTO
- user 도메인 API: HomeService/Controller (`GET /api/home`), TitleService/Controller (list/detail, 필터·검색·정렬)
- admin 도메인 API: Auth (signup/login/logout/me/check-id) + Banner/Section/Title/Cast/SiteSetting CRUD
- Seed 로더 (user 백엔드 CommandLineRunner — Member 관리자 계정, CodeGroup/CodeItem, Section 3건, SiteSetting singleton)
- `./gradlew build` 양쪽 최종 검증

세션 3 (Frontend user):
- Vite 스캐폴딩 (custom template, port 5177)
- `prototype_claude.html` 구조를 React 컴포넌트로 포팅 (다크 테마, 모바일 고정 프레임)
- 페이지 3개: 홈 / 탐색/필터 / 작품 상세
- Board 탭은 외부 URL 리다이렉트

세션 4 (Frontend admin):
- Vite 스캐폴딩 (admin template, port 5178)
- 공통 컴포넌트 세트 사전 생성 (harness/template-admin.md 준수): DataTable, Toolbar, Pagination, SearchFilter, FormSection, FormField + 입력들, Dialog, ConfirmDialog, Toast, EmptyState/Loading/ErrorAlert, CodeSelect/CodeMultiSelect, FileUploader
- Layout (Sidebar + Topbar + SidebarDrawer)
- 페이지 12개: 로그인, 회원가입, 대시보드, 배너 관리(목록/등록/수정), 섹션 노출 관리, 작품 (목록/등록/수정), 배우 (목록/등록/수정), 공통 코드 관리, 사이트 설정

세션 5 (마무리):
- `projects/prototype/schema.md` 작성
- `log/2026-04-17_prototype_v1.md` 빌드 로그
- lessons-learned 추가 기록 (이미 일부 반영됨)

---

## 이어서 시작하는 방법

새 세션에서 아래와 같이 요청:

> "prototype 프로젝트 백엔드 이어서 진행" (세션 2)
>
> "prototype 프로젝트 frontend user 생성" (세션 3)
>
> "prototype 프로젝트 frontend admin 생성" (세션 4)

Claude 는 `CLAUDE.md`, `specs/prototype/prototype.v1.yml`, 이 `log.md` 를 읽고 진척을 파악한 뒤 이어서 시작합니다.
