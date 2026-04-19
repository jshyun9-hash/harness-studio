# 빌드 로그 — prototype v2 (완전 재생성)

- **일시**: 2026-04-19 (세션 5회 분할)
- **명세 파일**: [specs/prototype/prototype.v2.yml](../specs/prototype/prototype.v2.yml)
- **원문**: [spec-requests/prototype/prototype.v2.md](../spec-requests/prototype/prototype.v2.md)
- **UI 자료**: `spec-requests/prototype/prototype_claude.html`, `spec-requests/prototype/프로토타입_ux.pdf`
- **생성 방식**: **완전 재생성 (옵션 1)** — v1 `projects/prototype/` 전체 삭제 후 v2 yml 기준 재생성
- **이전 버전**: v1 (2026-04-17 신규 생성)
- **구조 케이스**: **Case 3** — split backend + shared H2 DB
- **총 경과 시간 (wall-clock, 파일 mtime 측정)**: **1시간 47분** (2026-04-19 16:57:19 → 18:44:02)
- **순수 작업 시간 (세션 경계 공백 제외)**: 약 **60–65분**
  - 16:57–17:22 섹션 1+2 BE (~25분) / 17:54–18:01 섹션 3 FE user (~7분) / 18:15–18:44 섹션 4+5 FE admin + 마감 (~29분)
  - 세션 간 공백: 17:22–17:54 (32분), 18:01–18:15 (14분) — 사용자 턴 + BE build 대기
- **총 토큰 사용량 (추정, 정확한 카운터 없음)**: 입력 ~1.3M / 출력 ~380K (1M 컨텍스트 Opus 세션 분할)

---

## 왜 v2 재생성이었나

v2 는 원래 "증분 수정 (버그 패치)" 트랙이었고 v1 코드에 수동으로 정정 반영되어 있었음. 하지만 하네스 규칙·lessons-learned 를 갱신한 뒤, **"같은 YML 을 깨끗한 재생성으로 돌렸을 때 동일 결과가 나오는지"** 를 검증하는 앵커 역할이 필요했음. 따라서 2026-04-19 에 **전량 재생성** 으로 착수.

---

## 세션 분할 개요

| 세션 | 범위 | 결과 |
|------|------|------|
| 세션 1 | 양쪽 BE 초기화 (스캐폴딩, 엔티티 13 × 2, Repository, 공통 global, File/Code 모듈) | 양쪽 `compileJava` ✓ |
| 세션 2 | 양쪽 BE 도메인 API (Home/Title/Auth/Banner/Section/Cast/SiteSetting/Code) + Seed | 양쪽 `./gradlew build -x test` **BUILD SUCCESSFUL** |
| 세션 3 | FE user (모바일 custom UI, 3 페이지) | `tsc -b` ✓ / `vite build` 73 modules, 255 KB (gzip 80 KB) |
| 세션 4 | FE admin (공통 컴포넌트 세트 + 12 페이지) | `tsc -b` ✓ / `vite build` 97 modules, 290 KB (gzip 88 KB) |
| 세션 5 | schema.md / 이 빌드 로그 / 4 BE 스모크 테스트 (이 세션) | 문서 산출물 + 실행 검증 ✓ |

---

## v1 대비 반영된 v2 변경사항 (재생성 시 자동 반영되었는지)

| # | 변경 내용 | v2 재생성 반영 방식 | 확인 |
|---|----------|-------------------|------|
| 1 | `Title.synopsis` 매핑 `@Lob` 단독 (columnDefinition 제거) | `harness/coding.md` 샘플 + lessons-learned #19 를 보고 생성 | **admin BE `ddl-auto=validate` 기동 성공** (섹션 5 스모크) |
| 2 | `replace{Genres,Platforms,Similar,Cast}` 에 `repository.flush()` 강제 | lessons-learned #20 을 보고 생성 | 코드 확인: `TitleAdminService.replaceGenres()` 등 4개 메서드 |
| 3 | SurveyBanner 전면 삭제 + 사용자 배너 단일화 | v2 yml 명시 + FE user 에서 컴포넌트 자체 생성 안 함 | FE user `dist` 번들에 SurveyBanner 코드 없음 |
| 4 | 작품 상세에 관리자 배너 공유 노출 (`GET /api/banners` 공개 + useBanners 훅) | v2 yml 명시 | BE: `BannerController.list()` ✓ / FE: `bannerApi.list() + useBanners()` ✓ |
| 5 | admin 리스트 표준 `SearchFilter + DataTable + Pagination + RowActionChip` | `template-admin.md` 리스트 표준 + 공통 컴포넌트 세트 | admin FE 5개 리스트 페이지 (Banner/Cast/Title/Code/Section) 모두 공통 컴포넌트로만 조립 |
| 6 | 섹션 노출 관리에 `display_name_ko/en/sub_label` 편집 | v2 yml 에 필드 editable 표기 + admin BE DTO 확장 | `SectionListPage` 인라인 TextInput × 3 + `SectionUpdateRequest` 3 필드 확장 ✓ |
| 7 | admin 레이아웃 — Sidebar 하단 카드 로그아웃 제거, Topbar 우측 아이콘 로그아웃만 | `template-admin.md` Sidebar/Topbar 규칙 업데이트 | admin FE `Sidebar.tsx` (이름 + 로그인 ID 만) / `Topbar.tsx` (아이콘 버튼만) ✓ |

---

## 스모크 테스트 (섹션 5, 4 BE 중 BE 2개)

양쪽 BE 만 띄워 REST 계약을 확인 (FE 는 `vite build` 로 검증). H2 DB 는 v1 재생성 때 삭제 후 새로 생성된 상태 — 배너/작품/배우 모두 0건, Seed 만 있음.

### user BE (port 8082)

| 엔드포인트 | 결과 |
|----------|------|
| `GET /api/home` | 200 — banners[] 0 / sections[] 3 (NEW_RELEASE/TRENDS/KOREA_PICK, v2 display_name 복원) / siteSetting nullable |
| `GET /api/banners` | 200 — `[]` |
| `GET /api/titles?page=1&size=5` | 200 — `{items:[], totalCount:0, page:1, size:5}` |
| `GET /api/codes/COUNTRY` | 200 — 4건 (KR/US/CN/JP) |

### admin BE (port 8083, ddl-auto=validate)

| 엔드포인트 | 결과 |
|----------|------|
| `POST /api/admin/auth/login` (`admin/admin123`) | 200 — `{role:"ADMIN"}` + 세션 쿠키 `PROTOTYPE_ADMIN_SESSION` |
| `GET /api/admin/auth/me` | 200 — `{loginId:"admin", memberName:"관리자", role:"ADMIN"}` |
| `GET /api/admin/banners?page=1&size=20` | 200 — `{items:[], totalCount:0}` |
| `GET /api/admin/sections` | 200 — 3건 (v2 신규 display_name_en/sub_label 포함) |
| `GET /api/admin/titles?page=1&size=5` | 200 — `{items:[], totalCount:0}` |

**결정적 관찰**: admin BE (ddl-auto=**validate**) 가 user BE 가 만든 스키마로 기동 성공. 즉 `title.synopsis` 컬럼이 CLOB 로 생성됨 = `@Lob` 단독 매핑이 재생성 결과에도 반영됨 = lessons-learned #19 가 하네스 규칙으로 승격되었음이 실증됨.

기동 시간: user BE 3.48s / admin BE 3.43s (Spring Boot 3.5.4 + Java 21 + AUTO_SERVER=TRUE).

---

## 최종 산출물

| 항목 | 경로 | 비고 |
|------|------|------|
| BE user | [projects/prototype/backend/user/](../projects/prototype/backend/user/) | Spring Boot 3.5.4 + Java 21, port 8082 |
| BE admin | [projects/prototype/backend/admin/](../projects/prototype/backend/admin/) | 동일 스택, port 8083 |
| FE user | [projects/prototype/frontend/user/](../projects/prototype/frontend/user/) | Vite 7.3 + React 19.2 + TS 5.9 + Tailwind v4, port 5177 |
| FE admin | [projects/prototype/frontend/admin/](../projects/prototype/frontend/admin/) | 동일 스택, port 5178 |
| DB | [projects/prototype/data/](../projects/prototype/data/) | H2 파일 `prototypedb`, shared |
| Storage | [projects/prototype/storage/uploads/](../projects/prototype/storage/uploads/) | 빈 상태 |
| 스키마 | [projects/prototype/schema.md](../projects/prototype/schema.md) | 14 테이블 |
| 명세 YML | [specs/prototype/prototype.v2.yml](../specs/prototype/prototype.v2.yml) | source of truth |
| 명세 로그 | [specs/prototype/log.md](../specs/prototype/log.md) | v1/v2 changelog + 재생성 진척 |

### FE 빌드 번들

| 앱 | modules | JS (gzip) | CSS (gzip) |
|----|---------|-----------|------------|
| user | 73 | 255 KB (80 KB) | 19 KB (5 KB) |
| admin | 97 | 290 KB (88 KB) | 24 KB (5.3 KB) |

---

## 실행 방법

```bash
# 4개 앱 각각 별도 터미널에서
cd projects/prototype/backend/user  && ./gradlew bootRun   # 8082
cd projects/prototype/backend/admin && ./gradlew bootRun   # 8083 (user BE 가 먼저 DB 파일 생성 필요)
cd projects/prototype/frontend/user  && npm install && npm run dev  # 5177
cd projects/prototype/frontend/admin && npm install && npm run dev  # 5178
```

접속 URL:

- 사용자 모바일: http://localhost:5177/
- 관리자: http://localhost:5178/login — `admin / admin123` (user BE SeedRunner 가 주입)
- user H2 콘솔: http://localhost:8082/h2-console (url `jdbc:h2:file:./data/prototypedb;AUTO_SERVER=TRUE`)

---

## 신규 하네스 교훈 (이번 재생성에서 새로 발견)

없음. v2 는 v1 때 발견한 #19/#20 을 하네스 규칙으로 승격시키는 것이 목표였고, 재생성 결과가 그 승격이 올바른지 검증한 세션. 새 이슈는 나오지 않음.

---

## 남은 개선 거리 (v3 후보)

- v1 에서 지적된 "리뷰 기능 없음" — rating/review_count 는 수동 관리자 입력. 사용자 리뷰 CRUD 가 필요하면 v3.
- PDF 의 숨김 지시 요소 (공유/하트/Account/Cast.role_label/Cast.profile_file_id) 는 데이터는 유지 중 — 향후 노출 토글 가능.
- Board 탭은 현재 `siteSetting.board_survey_url` 이 비어있으면 `alert` 만 띄움. 전용 설문 페이지 내장이 필요하면 v3.
