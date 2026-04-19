# Prototype (Moyza) — 명세 로그

## 현재 최신 버전

**v2** — 2026-04-19 (재생성 완료)

- 파일: [prototype.v2.yml](prototype.v2.yml)
- 원문: [spec-requests/prototype/prototype.v2.md](../../spec-requests/prototype/prototype.v2.md)
- 자료:
  - `spec-requests/prototype/프로토타입_ux.pdf` — PDF 레퍼런스 (5페이지)
  - `spec-requests/prototype/prototype_claude.html` — HTML 프로토타입 (ui_source)
- 스키마: [projects/prototype/schema.md](../../projects/prototype/schema.md)
- 빌드 로그: [log/2026-04-19_prototype_v2.md](../../log/2026-04-19_prototype_v2.md)

> v1 코드에는 이미 `Title.synopsis` 매핑 정정이 수동 반영되어 있었으나, 하네스 규칙 승격(lessons-learned #19/#20)의 실증을 위해 2026-04-19 에 **전량 재생성**. 섹션 1~5 모두 완료, 2 BE 스모크 테스트 통과 (admin BE validate 기동 성공 = @Lob 단독 매핑 재생성 반영 확인).

---

## 재생성 진행 상태 (2026-04-19 완료)

**착수**: 2026-04-19. 방식: 완전 재생성 (옵션 1). 기존 DB/storage/코드 모두 삭제 후 재생성. **섹션 1~5 모두 완료**, 최종 산출물 + 스모크 테스트 완료.

### 완료
- 4개 서버 종료 (8082/8083/5177/5178) + 자식 Java/Node 프로세스 kill.
- `projects/prototype/` 디렉토리 통째 삭제 후 `backend/{user,admin}` + `frontend` + `data` + `storage/uploads` 재생성.
- 양쪽 BE Spring Initializr 스캐폴딩 (Spring Boot 3.5.4 + Java 21 + Gradle 8.14.4 + web/data-jpa/h2/validation/lombok).
- `application.properties` 삭제 후 `application.yml` 작성 (양쪽). HELP.md 제거.
  * user: port 8082, ddl-auto=update, 세션쿠키 `PROTOTYPE_USER_SESSION`, H2 AUTO_SERVER, 파일 루트 `../../storage/uploads`
  * admin: port 8083, ddl-auto=validate, 세션쿠키 `PROTOTYPE_ADMIN_SESSION`, 동일 DB 공유
- **섹션 1 완료** (2026-04-19): Application 클래스 `@EnableJpaAuditing` / 공통 global (ApiResponse, PageResponse, BaseEntity, CorsConfig, GlobalExceptionHandler) × 2 / admin SessionRoleFilter / 엔티티 13 × 2 (Title.synopsis `@Lob` 단독, Cast → `cast_member`) / Repository 13 × 2 (Banner/Cast/Title `JpaSpecificationExecutor` 포함) / File 모듈 (user: 다운로드, admin: 업로드+다운로드) / Code 모듈 (공개 조회). **`./gradlew compileJava` 양쪽 BUILD SUCCESSFUL**.
- **섹션 2 완료** (2026-04-19):
  - build.gradle.kts 에 `org.springframework.security:spring-security-crypto` 의존성 추가 (양쪽, BCryptPasswordEncoder 사용).
  - user: SeedRunner (admin 계정 + COUNTRY/GENRE/PLATFORM 3그룹 + 섹션 3건 + SiteSetting singleton), HomeResponse DTO, HomeService (getBanners 분리), HomeController, BannerController(`/api/banners` 공개), Title DTO(Search/Summary/Detail), TitleQueryService(JpaSpec + 장르/플랫폼 subquery 필터 + 정렬), TitleController.
  - admin: PasswordConfig (BCryptPasswordEncoder Bean), Auth DTO/Service/Controller (signup/login/logout/me/check-id, 세션 기록, role=ADMIN 강제), SiteSetting DTO/Service/Controller, Banner DTO/Service/Controller (JpaSpec + PageResponse, `?linkUrl&visible&page&size`), Cast DTO/Service/Controller (`?name&active&page&size`, 양쪽 이름 OR 검색), Section DTO/Service/Controller (노출명/EN/서브라벨 편집 확장), Code DTO/Service/Controller (CRUD), Title DTO (Request/MappingRequests/AdminResponse)/Service (`?q&active&page&size` + replace\* 에 `flush()`)/Controller.
  - **`./gradlew build -x test` 양쪽 BUILD SUCCESSFUL**.
- **섹션 4 완료** (2026-04-19) — Frontend admin (port 5178, template=admin):
  - Vite 7.3 + React 19.2 + TS 5.9 + Tailwind v4 스캐폴딩. `vite.config.ts` port 5178 strictPort + proxy `/api` → `http://127.0.0.1:8083`.
  - API 레이어: `http.ts` (get/post/put/delete/upload, credentials:include, ApiResponse 언래핑, ApiError status 보존, 배열 params 반복) + 7 개 모듈 (`authApi`, `bannerApi`, `sectionApi`, `titleApi`, `castApi`, `codeApi`, `siteSettingApi`, `fileApi`).
  - 세션: `SessionProvider` + `useSession()` (me 부팅 로드, 401/403 시 null). `ProtectedRoute` (authLoading 끝난 뒤 role=ADMIN 확인, 아니면 `/login` Navigate — lessons-learned #9 준수) / `PublicOnly` (로그인 상태에서 `/login`·`/signup` 접근 시 `/` 로 리다이렉트).
  - 공통 컴포넌트 (src/components/common/ 사전 생성, 페이지에서 raw `<table>`/`<input>`/`alert`/`window.confirm` 금지):
    * feedback: `LoadingSpinner`, `ErrorAlert`, `EmptyState`, `Dialog`(ESC 닫기 + body overflow lock), `ConfirmDialog`(variant default|danger), `Toast`+`ToastProvider`+`useToast()`.
    * table: `DataTable<T>`(columns/rows/rowKey/loading/empty/onRowClick/rowActions/sort), `Pagination`(page/size/totalCount/onChange), `Toolbar`, `RowActionChip`(variant default|danger, pill).
    * form: `FormSection`(title/description/footer), `FormField`(label/required/error/helpText), `TextInput`/`TextareaInput`/`NumberInput`/`SelectBox<V>`(제네릭 value 타입 보존)/`MultiSelectBox<V>`(선택 순서 숫자 표시)/`Checkbox`/`Switch`/`DatePicker`/`FileUploader`(fileApi.upload 내장, 이미지 미리보기 + 제거 버튼).
    * search: `SearchFilter`(fields + values draft + onApply/onReset — draft vs applied 분리, 검색 클릭 시에만 page=1 리셋).
    * code: `CodeSelect`/`CodeMultiSelect`(groupKey 주입 → `useCodeItems(groupKey)` 로 `/api/codes/{groupKey}` 자동 로드, active 만 필터).
  - 레이아웃 (`Layout`):
    * `Sidebar` (w-60, bg-slate-900, nav 그룹 3개: 운영/컨텐츠/시스템 × 항목 7건, 활성 경로 `border-l-2 border-white + bg-slate-800`, **하단 카드 = 이름 + 로그인 ID 만, 로그아웃 버튼 없음** — template-admin 규칙).
    * `SidebarDrawer` (<md fixed 슬라이드 + overlay, 메뉴 클릭 시 자동 닫힘).
    * `Topbar` (h-14, 페이지 타이틀 동적 매핑, 우측 **로그아웃 아이콘 버튼만** — 텍스트 라벨 없음, aria-label/title 로 접근성 — template-admin 규칙).
    * 컨텐츠 영역 `bg-slate-50`.
  - 페이지 12개:
    * `/login` `LoginPage` — 카드형, 실패 시 인라인 `ErrorAlert`, 성공 후 `/` 이동.
    * `/signup` `SignupPage` — 중복확인 버튼 (`check-id`) + 비밀번호 확인 검증, 성공 후 자동 로그인 + `/` 이동.
    * `/` `DashboardPage` — 통계 카드 3개 (작품/배너/배우 `totalCount`) + 최근 작품 5건 리스트.
    * `/banners` `BannerListPage` — `SearchFilter(linkUrl,visible) + DataTable + Pagination + RowActionChip + ConfirmDialog(danger)`.
    * `/banners/new` / `/banners/:id` `BannerFormPage(mode)` — `FileUploader`(배너 이미지) + `TextInput`(link) + `NumberInput`(sort) + `Checkbox`(visible).
    * `/sections` `SectionListPage` — Seed 3건 고정 (SearchFilter/Pagination 생략 허용 규칙 적용), `DataTable` + 인라인 TextInput/NumberInput blur 저장 + `Switch`(visible) — section_key read-only, v2 신규 display_name_ko/en/sub_label 편집 포함.
    * `/titles` `TitleListPage` — `SearchFilter(q, active) + DataTable + Pagination + RowActionChip`.
    * `/titles/new` / `/titles/:id` `TitleFormPage(mode)` — 기본정보 2열 그리드 + 이미지 (poster/backdrop) + 장르 `CodeMultiSelect` + `PlatformsEditor`(플랫폼 pill + watchUrl 인풋 + 중복 차단) + `SimilarTitlesEditor`(작품 select + 자기 자신 제외 + 중복 차단) + `CastEditor`(활성 배우 select + roleLabel 인풋). 저장 시 `create/update` 후 4개 매핑 `replace*` 병렬 호출.
    * `/casts` `CastListPage` — 동일 패턴.
    * `/casts/new` / `/casts/:id` `CastFormPage(mode)` — `TextInput` + `FileUploader`(profile) + `Checkbox`(active).
    * `/codes` `CodePage` — 좌측 그룹 사이드바 (system 배지) + 우측 `DataTable` + `Dialog`(아이템 추가/수정) + `ConfirmDialog(danger)`.
    * `/settings` `SettingPage` — `FileUploader`(로고) + `TextInput`(board_survey_url).
  - 비노출 정책: 페이지에서 `<table>`/`<input>`/`alert`/`window.confirm` 직접 사용 없음 — 모두 공통 컴포넌트 경유. 삭제는 `ConfirmDialog(danger)` / 피드백은 `useToast()`.
  - 빌드: `npm install` ✓ / `npx tsc -b` ✓ (에러 0) / `npx vite build` ✓ (97 modules, `dist/assets/index-*.js` 290 KB / gzip 88 KB, CSS 24 KB / gzip 5.3 KB).
- **섹션 3 완료** (2026-04-19) — Frontend user (port 5177, template=custom, ui_source=prototype_claude.html):
  - Vite 7.3 + React 19.2 + TS 5.9 + Tailwind v4 (@tailwindcss/vite) 스캐폴딩. `vite.config.ts` port 5177 strictPort + proxy `/api` → `http://127.0.0.1:8082`.
  - `index.css` Tailwind v4 `@theme` 토큰(moyza-bg/panel/primary/muted/rating/badge/pill-border) + poster gradient 7종 + hero gradient + fade-in 애니메이션.
  - 레이아웃: `PhoneFrame` (데스크톱 390×844 + 노치/인디케이터, <500px 풀스크린) / `StatusBar` / `ScreenShell` (스크롤 영역 + 고정 bottom 슬롯) / `BottomNav` (Home/Event/Board, Board 는 `siteSetting.boardSurveyUrl` 새창).
  - API 레이어: `http.ts` (fetch + credentials:include + ApiResponse 언래핑 + URLSearchParams 배열 직렬화 + `ApiError` status 보존) / `homeApi` / `bannerApi` / `titleApi` / `codeApi`.
  - 훅: `useHome` / `useBanners` / `useTitleList(JSON.stringify 의존성 키)` / `useTitleDetail` / `useCodeList(active만)`.
  - 홈 (`/`): `HomeHeader` (Moyza 필기체 로고 + globe) / 검색 버튼 (readonly, 클릭 시 `/search`) / `BannerCarousel` (관리자 배너, 가로 스냅 스크롤, 없으면 미렌더) / `SectionRow` × N (서버가 `is_visible=true` 섹션만 반환 — HomeService 에서 필터) / `TitleCard` (scroll 모드, 첫 번째 카드 TOP 배지, posterUrl 없으면 `poster-gradient-*` 폴백). **SurveyBanner 제거됨** (v2 정책).
  - 탐색 (`/search`): `SearchHeader` (뒤로가기 + 인풋) / `FilterPanel` (Country pill, Genre pill, Platform 텍스트 토글 — HTML 원본의 PDF 정책 준수) / `ResultsHeader` (count + sort 토글 latest↔rating) / 3열 `TitleCard` 그리드. `/api/codes/{COUNTRY|GENRE|PLATFORM}` 병렬 로드.
  - 상세 (`/titles/:id`): `Hero` (backdropUrl 이 있으면 이미지, 없으면 hero-gradient + 실루엣 / 뒤로가기 + 검색 아이콘 / 제목·별점·리뷰수) / `Tabs` (Synopsis/Cast/Similar, 클릭 시 ref 로 scrollIntoView) / `Accordion` × 3 / `MetaPills` (age/year/EP/대표 장르) / `PlatformRow` (itemKey 기반 NETFLIX/TVING/COUPANG 스타일, 매핑 없으면 미렌더) / `CastList` (role_label 비노출 — v1 정책) / `SimilarList` (3열 그리드 + 자기 자신 제외는 BE 가 보장) / `WatchBar` (watch_now_url 있으면 파란 버튼, 없으면 회색 disabled). 중간에 `BannerCarousel` 공유 노출 — `useBanners()` 로 로드, 없으면 영역 자체 미렌더 (v2 신규).
  - 비노출 정책 준수: 공유/하트/Account/Cast.role_label/Cast.profile_file_id 모두 렌더링 안 함.
  - 빌드: `npm install` ✓ / `npx tsc -b` ✓ (에러 0) / `npx vite build` ✓ (73 modules, `dist/assets/index-*.js` 255 KB / gzip 80 KB, CSS 19 KB / gzip 5 KB).

- **섹션 5 완료** (2026-04-19) — 마감:
  - [projects/prototype/schema.md](../../projects/prototype/schema.md) 작성 — 14개 테이블 (공통 자동 3 + 도메인 11), 관계도, UNIQUE 9건, v2 반영 교훈 (#15/#17/#19/#20) 요약.
  - [log/2026-04-19_prototype_v2.md](../../log/2026-04-19_prototype_v2.md) 빌드 로그 작성 — 5세션 합산 소요 시간/토큰, v1 대비 v2 변경 7건 표, 스모크 결과 테이블, 실행 방법.
  - BE 스모크 (2 BE, FE 는 `vite build` 로 대체):
    * user BE (3.48s 기동) — `/api/home` (sections 3건 seed 복원) / `/api/banners` (`[]`) / `/api/titles?page=1&size=5` (empty page) / `/api/codes/COUNTRY` (4건) 모두 200.
    * admin BE (3.43s 기동, **ddl-auto=validate 통과** = `@Lob` 단독 매핑이 재생성 결과에 정확히 반영) — `POST /api/admin/auth/login (admin/admin123)` 200 + 세션 쿠키 / `/me` 200 / `/api/admin/banners?page=1&size=20` 200 / `/api/admin/sections` 3건 (v2 신규 display_name_ko/en/sub_label 포함) / `/api/admin/titles?page=1&size=5` 200.
    * 스모크 후 양쪽 BE 종료 (포트 8082/8083 freed).
  - 신규 하네스 교훈: 없음 (v2 는 v1 의 #19/#20 을 하네스 규칙으로 승격시키는 검증 사이클이었고, 재생성이 그 승격이 올바름을 실증).

### 재생성 최종 산출물

| 항목 | 경로/비고 |
|------|---------|
| 코드 | [projects/prototype/](../../projects/prototype/) (backend/{user,admin} + frontend/{user,admin} + data + storage) |
| 스키마 | [projects/prototype/schema.md](../../projects/prototype/schema.md) — 14 테이블 |
| 빌드 로그 | [log/2026-04-19_prototype_v2.md](../../log/2026-04-19_prototype_v2.md) |
| BE 빌드 | 양쪽 `./gradlew build -x test` BUILD SUCCESSFUL |
| FE 빌드 | user 73 modules / 255 KB (gzip 80 KB) · admin 97 modules / 290 KB (gzip 88 KB) |
| 스모크 | BE 2개 기동 ✓ / 9 엔드포인트 200 ✓ / admin validate 통과 ✓ |

### 다음 단계

v2 재생성 사이클 종료. 새 작업은:
- v3 요구사항이 들어오면 `spec-requests/prototype/prototype.v3.md` 로 수집 → discovery 스킬 → YML 생성.
- 기존 v2 코드에 긴급 패치가 필요하면 `skills/update-incremental.md`.
- 버전 변경 없이 재생성만 반복하려면 `skills/regenerate.md` 를 이 log.md 의 "재생성 최종 산출물" 을 기준으로 다시 착수.

---

---

## changelog

### v2 — 2026-04-19 (증분 수정 — 버그 패치, 미적용)

**정정 사항**
1. `Title.synopsis` 엔티티 매핑을 `@Lob + columnDefinition="TEXT"` 에서 `@Lob` 단독으로 변경.
   - v1 생성 코드의 조합이 H2 v2 에서 VARCHAR 로 저장되어 admin 백엔드
     (ddl-auto=validate) 기동 시 `expecting [text (Types#CLOB)]` 로 실패.
2. `TitleAdminService.replace{Genres,Platforms,Similar,Cast}` — 파생
   `deleteByTitleId()` 직후 동일 트랜잭션에서 `save()` 호출 시 Hibernate 가
   INSERT 를 DELETE 보다 먼저 flush 하여 UNIQUE 제약 위반(예:
   `UQ_TITLE_GENRE(title_id, genre_code_id)`, `UQ_TITLE_CAST(title_id, cast_id)`)
   → 작품 수정 시 500 에러. 정정: delete 직후 `repository.flush()` 강제.
3. `SurveyBanner` 컴포넌트 **전면 삭제** — 관리자가 이미지/문구를 제어할 수 없는
   반자동 promo UI (원본 HTML 프로토타입 하드코딩) 였음. 사용자 배너는 관리자
   CRUD 를 거친 `Banner` (BannerCarousel) 한 가지로 단일화.
   - [HomePage.tsx](../../projects/prototype/frontend/user/src/pages/HomePage.tsx) — SurveyBanner 사용 제거
   - [TitleDetailPage.tsx](../../projects/prototype/frontend/user/src/pages/TitleDetailPage.tsx) — SurveyBanner 제거
   - `src/components/home/SurveyBanner.tsx` — 파일 삭제

4. **작품 상세 페이지에 관리자 배너 공유 노출** (원본 Page 5 수정사항 실현).
   - user BE: `GET /api/banners` 공개 엔드포인트 신설.
     - [HomeService.getBanners()](../../projects/prototype/backend/user/src/main/java/com/harness/prototype/user/domain/home/service/HomeService.java) 로 로직 분리
     - [BannerController](../../projects/prototype/backend/user/src/main/java/com/harness/prototype/user/domain/home/controller/BannerController.java) 신설 — `/api/home` 내 banners 와 동일 결과 반환
   - user FE: [bannerApi.ts](../../projects/prototype/frontend/user/src/api/bannerApi.ts) + [useBanners.ts](../../projects/prototype/frontend/user/src/hooks/useBanners.ts) 신설.
     [TitleDetailPage](../../projects/prototype/frontend/user/src/pages/TitleDetailPage.tsx) 의 `PlatformRow` 아래에 `BannerCarousel` 재사용으로 노출 (배너 없으면 영역 미렌더).

7. **리스트 행 액션 chip 스타일 통일**.
   - 공통 컴포넌트 신설: [RowActionChip.tsx](../../projects/prototype/frontend/admin/src/components/common/table/RowActionChip.tsx) — `variant: default | danger`, pill 테두리(`rounded-full border`) + 흰 배경 + hover 톤.
   - Title / Banner / Cast / Code 리스트의 raw `<button>` → `RowActionChip` 교체.
   - [harness/template-admin.md](../../harness/template-admin.md) — 공통 컴포넌트 목록 + 리스트 표준 조항에 "rowActions 는 RowActionChip 사용" 추가.

6. **admin 리스트 공통 컴포넌트 일관화** (하네스 리스트 표준 3종 세트 강제).
   - raw `<table>` → `DataTable` 리팩터링: [SectionListPage](../../projects/prototype/frontend/admin/src/pages/section/SectionListPage.tsx), [CodePage](../../projects/prototype/frontend/admin/src/pages/code/CodePage.tsx).
   - **SearchFilter + Pagination 도입**: [BannerListPage](../../projects/prototype/frontend/admin/src/pages/banner/BannerListPage.tsx), [CastListPage](../../projects/prototype/frontend/admin/src/pages/cast/CastListPage.tsx), [TitleListPage](../../projects/prototype/frontend/admin/src/pages/title/TitleListPage.tsx).
   - admin BE 페이징/검색 시그니처 통일 (`JpaSpecificationExecutor` + `PageResponse`):
     * Banner: `?linkUrl&visible&page&size`
     * Cast: `?name&active&page&size`
     * Title: `?q&active&page&size`
   - FE 계약 정비: bannerApi / castApi / titleApi 의 `list*` 가 params 객체 + `PageResponse` 반환. 호출부 일괄 업데이트 (Dashboard / CastEditor / SimilarTitlesEditor).
   - 하네스: [template-admin.md](../../harness/template-admin.md) 에 "리스트 페이지 표준 구성 (SearchFilter + DataTable + Pagination)" 조항 신설. Seed 고정 리스트(Section 등)만 Pagination/SearchFilter 생략 허용.

5. **섹션 노출 관리 — 노출명/서브 라벨 편집 기능 추가**.
   - 관리자에서 섹션의 `display_name_ko`, `display_name_en`, `sub_label` 을 인라인 편집(blur 저장).
   - `section_key` 는 자동 로직 식별자(`NEW_RELEASE`/`TRENDS`/`KOREA_PICK`) 라 read-only 유지.
   - admin BE: [Section.java](../../projects/prototype/backend/admin/src/main/java/com/harness/prototype/admin/domain/section/entity/Section.java) `update()` 시그니처 확장, [SectionUpdateRequest](../../projects/prototype/backend/admin/src/main/java/com/harness/prototype/admin/domain/section/dto/SectionUpdateRequest.java) 에 3개 필드 추가(@NotBlank/@Size).
   - admin FE: [SectionListPage](../../projects/prototype/frontend/admin/src/pages/section/SectionListPage.tsx) 테이블에 KO/EN/서브라벨 `TextInput` 컬럼 추가, [types/section.ts](../../projects/prototype/frontend/admin/src/types/section.ts) `SectionUpdateRequest` 확장.

6. **admin 공통 레이아웃 — 로그아웃 위치 이관 + 관리자 이름 이중 표기 제거** (하네스 공통 규칙 변경).
   - [Sidebar.tsx](../../projects/prototype/frontend/admin/src/components/layout/Sidebar.tsx) — 하단 카드에서 로그아웃 버튼 제거 (이름 + 로그인 ID 만 남김).
   - [Topbar.tsx](../../projects/prototype/frontend/admin/src/components/layout/Topbar.tsx) — 기존 이름 표시 제거, **로그아웃 아이콘 버튼만** 배치 (라벨 없음, aria-label/title 로 접근성). 관리자 이름은 Sidebar 하단 카드로 단일화.
   - [harness/template-admin.md](../../harness/template-admin.md) — Sidebar/Topbar 예시 + 규칙 조문 업데이트 ("관리자 이름은 Topbar 에 표시하지 않음"). 재생성 시 모든 admin 프로젝트에 반영.

**v1 코드 반영 상태**
- 두 `Title.java` — 수동 정정 반영됨.
- [TitleAdminService.java](../../projects/prototype/backend/admin/src/main/java/com/harness/prototype/admin/domain/title/service/TitleAdminService.java) — 4개 replace 메서드에 `flush()` 추가.
- `SurveyBanner.tsx` — 파일 삭제 + HomePage/TitleDetailPage 에서 사용 제거.
- user BE: `/api/banners` 공개 엔드포인트 신설 (HomeService.getBanners + BannerController).
- user FE: bannerApi.ts / useBanners.ts 신설, TitleDetailPage 에서 BannerCarousel 재사용.
- v2 는 동일 결과가 **하네스 규칙**으로 자동 생성되도록 앵커 역할.

**하네스 동반 수정**
- [harness/coding.md](../../harness/coding.md) Entity 패턴 샘플 업데이트 — `@Lob` 단독 예시로.
- [skills/lessons-learned.md](../../skills/lessons-learned.md)
  - #19 추가 — H2 에서 `@Lob(String)` 은 `columnDefinition` 미지정 필수.
  - #20 추가 — derived `deleteByXxx` 이후 같은 tx 에서 `save` 호출하려면 `flush()` 먼저.

**적용 상태**
- YML: 완료 (specs/prototype/prototype.v2.yml)
- 코드: v1 디렉토리에서 이미 수동 정정 반영 (재생성 불필요)
- 재생성 시 동일 결과가 보장되도록 하네스 동기화 완료

**무엇이 변하지 않았나**
- 엔티티 필드 리스트 / API / 페이지 / 권한 / 모듈 구성 / 포트 / DB 전략 — 모두 v1 동일.

---

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
