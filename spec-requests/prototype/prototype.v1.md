# Prototype (Moyza) — 요구사항 v1

모바일 OTT/드라마·영화 탐색 및 리뷰 앱. 작업 제목은 **Moyza**.
요구사항 원문 자료:

- `프로토타입_ux.pdf` — UX 레퍼런스 + 수정사항 (5페이지)
- `prototype_claude.html` — 다른 팀원이 PDF 기반으로 만든 HTML 프로토타입

> 사용자 화면은 **모바일 전용**, 관리자 화면은 **데스크톱 설정 페이지**.
> 이 문서는 PDF 페이지별 브레인스토밍 결과를 누적 기록한다.

---

## 브레인스토밍 결정 사항 (확정)

### 프로젝트 구성 (skills/discovery.md 기준)

- **projectId**: `prototype`
- **modules**:
  - frontend: `user` (모바일 전용, template=custom, ui_source=prototype_claude.html) + `admin` (template=admin, 데스크톱 설정 페이지)
  - backend strategy: **split** (user 백엔드 / admin 백엔드 분리)
  - database strategy: **shared** (H2 파일 공유, `AUTO_SERVER=TRUE`)
  - shared_owner: `user` (스키마 주도권)

### 공통 하네스 규칙

- **파일 업로드**: [harness/files.md](../../harness/files.md) 를 따름
  - 엔티티: `StoredFile` (자동 주입)
  - 저장 경로: `projects/prototype/storage/uploads/{yyyy}/{MM}/{file_key}` (확장자 **없음**)
  - `file_key`: UUID v4
  - 업로드/다운로드 API: `POST /api/files`, `GET /api/files/{fileKey}`

- **공통 코드**: [harness/common-code.md](../../harness/common-code.md) 를 따름
  - 엔티티: `CodeGroup`, `CodeItem` (자동 주입)
  - 이 프로젝트에서 사용되는 그룹: `COUNTRY`, `GENRE`, `PLATFORM`
  - 다른 엔티티가 참조할 때 컬럼명: `{의미}_code_id`, 속성 `code_group: {그룹키}`

---

## Page 1 — 표지 (5개 화면 개요)

5개 화면의 썸네일. 개별 결정 사항은 페이지 2~5에서 다룬다.

1. 홈 (New Releases / Trends 등 카드 섹션)
2. 탐색/필터 (Country / Genre / Platform)
3. 작품 상세 (상단 — 포스터, 제목, 시놉시스, 플랫폼 바)
4. 작품 상세 (출연진 섹션)
5. 작품 상세 (Synopsis 요약 카드 + Cast)

---

## Page 2 — 홈 화면

### PDF 수정사항

| # | 항목 | 수정 내용 |
|---|------|-----------|
| 1 | 로고 | "Moyza" → 전달드릴 로고 이미지로 교체 |
| 2 | 광고 배너 | 맨 위로 이동 + 설문지 링크용 배너로 변경 |
| 3 | 카드 섹션 순서 | 업데이트된 신작 / 인기작 픽 / 코리아 픽 순으로 배치 |
| 4 | 기타 카드 섹션 | 숨김 처리 (= 섹션별 노출 토글) |
| 5 | 하단 네비 — Account | 숨김 |
| 6 | 하단 네비 — Board | 설문지 아이콘 + 링크 삽입 |
| 7 | 하단 네비 — Event | 탐색 아이콘 + 상세검색 페이지 연결 (Page 3) |

### 사용자 화면 요구사항

- 상단: 로고(이미지) + 언어 아이콘 (언어 전환은 v1 범위 밖)
- 검색 입력 (클릭 시 Page 3 탐색 화면으로 이동)
- **배너 캐러셀 (좌우 스와이프, 최대 5개 노출)** — 관리자가 등록한 것 중 is_visible=true, sort_order
- 섹션 3개 (고정 `NEW_RELEASE`, `TRENDS`, `KOREA_PICK`):
  - 각 섹션의 `is_visible` 이 true 인 것만 렌더링
  - 섹션 내 작품은 관리자가 큐레이션한 순서로 가로 스크롤
  - 카드 클릭 → Page 4 (작품 상세)
- 하단 네비 3개: **Home / Event(탐색) / Board(설문)**
  - Home: 현재 화면
  - Event: Page 3 (탐색/필터) 이동
  - Board: `SiteSetting.board_survey_url` 외부 URL 열기

### 관리자 기능 도출

| 관리 기능 | 엔티티 | 비고 |
|-----------|--------|------|
| 작품 CRUD | `Title` | 상세 필드는 Page 4/5 에서 확정 |
| 섹션 노출 관리 (3개 고정) | `Section` (seed 3건) | **is_visible 토글만** — 내용은 자동 로직 |
| 배너 CRUD | `Banner` | image_file_id, link_url, is_visible, sort_order. 홈 + 작품 상세 공용 |
| 사이트 설정 | `SiteSetting` (singleton) | logo_file_id, board_survey_url |

### 엔티티 초안 (v1)

#### Section (seed 고정 3건, 관리자는 is_visible 만 제어)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| section_id | Long | PK, auto | |
| section_key | String | UNIQUE, NOT NULL | `NEW_RELEASE` / `TRENDS` / `KOREA_PICK` — 로직 분기에 사용 |
| display_name_ko | String | NOT NULL | "업데이트 신작" 등 |
| display_name_en | String | NOT NULL | "New Releases" 등 |
| sub_label | String | nullable | 섹션 위 영문 부제 (예: "What's new on Moyza") |
| sort_order | Integer | NOT NULL | 화면 내 섹션 순서 |
| is_visible | Boolean | NOT NULL, default true | 섹션 노출 여부 (**관리자 제어 대상**) |
| max_count | Integer | NOT NULL, default 20 | 한 섹션 최대 노출 작품 수 |
| created_at, updated_at | Timestamp | audit | |

#### 섹션별 자동 로직 (Service 하드코딩, section_key 분기)

| section_key | 쿼리 조건 | 정렬 |
|------|-----------|------|
| `NEW_RELEASE` | `Title.is_active = true` | `created_at DESC` |
| `TRENDS` | `Title.is_active = true` | `rating DESC NULLS LAST, created_at DESC` |
| `KOREA_PICK` | `Title.is_active = true AND country_code.item_key = 'KR'` | `created_at DESC` |

모두 `LIMIT {Section.max_count}`. `Section.is_visible = false` 이면 응답에서 해당 섹션 제외.

> KOREA_PICK 은 v1 에서 최신순. 평점순이 더 필요하면 v2 에서 Section 에 `sort_strategy` 필드 추가.

#### 홈 API (자동 묶음 조회)

```
GET /api/home

Response.data = {
  banners: [ {bannerId, imageUrl, linkUrl, sortOrder}, ... ],   // is_visible LIMIT 5
  sections: [
    {
      sectionKey: "NEW_RELEASE",
      displayNameKo: "업데이트 신작",
      displayNameEn: "New Releases",
      subLabel: "What's new on Moyza",
      titles: [ {titleId, titleNameKo, posterUrl, rating, episodeCount, representativeGenreKo}, ... ]
    },
    { sectionKey: "TRENDS", ... },
    { sectionKey: "KOREA_PICK", ... }
  ],
  siteSetting: {
    logoUrl: "/api/files/...",
    boardSurveyUrl: "https://..."
  }
}
```

is_visible=true 인 섹션만 포함. 결과적으로 관리자가 섹션을 끄면 응답에서 빠져 프론트에 노출되지 않음.

#### Banner

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| banner_id | Long | PK, auto | |
| image_file_id | Long | FK StoredFile, NOT NULL | 배너 이미지 |
| link_url | String | NOT NULL | 클릭 시 이동 URL (외부/내부) |
| sort_order | Integer | NOT NULL | |
| is_visible | Boolean | NOT NULL, default true | |
| created_at, updated_at | Timestamp | audit | |

노출 규칙: `is_visible=true ORDER BY sort_order ASC LIMIT 5`.

#### SiteSetting (singleton, id=1 고정)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| site_setting_id | Long | PK (1 고정) | |
| logo_file_id | Long | FK StoredFile, nullable | 상단 로고 이미지 |
| board_survey_url | String | nullable | Board 탭 설문지 외부 링크 |
| updated_at | Timestamp | audit | |

> v1 에서는 단일 언어(ko) 우선. 영문 필드는 UI 섹션 서브 라벨 정도에만 사용.

---

## Page 3 — 탐색/필터 화면

### PDF 수정사항

| # | 항목 | 수정 내용 |
|---|------|-----------|
| 1 | Platform 필터 | `A / B / C / D / E` 더미 → 실제 플랫폼명 (공통 코드 `PLATFORM` 아이템) |

### 사용자 화면 요구사항

- 상단: 뒤로가기 + 검색 입력 (제목 LIKE 검색)
- Filter 블록 (접기/펼치기):
  - Country: `COUNTRY` 그룹의 is_active 아이템 칩. 복수 선택 가능
  - Genre: `GENRE` 그룹의 is_active 아이템 칩. 복수 선택 가능
  - Platform: `PLATFORM` 그룹의 is_active 아이템 칩. 복수 선택 가능
- Results 섹션:
  - 포스터 + 제목 그리드 (포스터 이미지는 Title.poster_file_id)
  - 정렬 드롭다운: **최신순 (기본) / 평점순** (v1)
  - 페이지네이션: 20건 단위
- 검색/필터 없이 진입 시: 전체 작품 최신순

### 관리자 기능 도출

| 관리 기능 | 엔티티 | 비고 |
|-----------|--------|------|
| 공통 코드 관리 | `CodeGroup` / `CodeItem` | COUNTRY, GENRE, PLATFORM 아이템 CRUD (is_system=true 그룹은 그룹 삭제 불가) |
| 작품 CRUD (국가/장르/플랫폼 지정) | `Title`, `TitleGenre`, `TitlePlatform` | 장르·플랫폼은 다중 선택 |
| 플랫폼 로고 (선택) | `CodeItem.icon_file_id` | 필요 시 플랫폼 아이템에 로고 이미지 |

### 엔티티 초안 업데이트 (v1)

#### Title (Page 3 초안; Page 4 에서 확장됨 — 아래 Page 4 섹션 최종 정의 참조)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| title_id | Long | PK, auto | |
| title_name_ko | String | NOT NULL | 한글 작품명 |
| title_name_en | String | nullable | 영문 작품명 |
| poster_file_id | Long | FK StoredFile, nullable | **썸네일** (카드/목록용) |
| country_code_id | Long | FK CodeItem, required, code_group: COUNTRY | |
| created_at, updated_at | Timestamp | audit | |

> Page 4 에서 상세 필드(backdrop/synopsis/watch_now_url/rating 등) 가 추가되어 **최종 정의는 Page 4 섹션** 참조.

#### TitleGenre (다대다)

| 필드 | 타입 | 제약 |
|------|------|------|
| title_genre_id | Long | PK, auto |
| title_id | Long | FK Title, NOT NULL |
| genre_code_id | Long | FK CodeItem (code_group: GENRE), NOT NULL |
| sort_order | Integer | default 0 (대표 장르 지정용) |
| created_at, updated_at | Timestamp | audit |

UNIQUE(title_id, genre_code_id). 카드에 표시되는 **대표 장르**는 sort_order=0 의 것.

#### TitlePlatform (다대다 + watch_url)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| title_platform_id | Long | PK, auto | |
| title_id | Long | FK Title, NOT NULL | |
| platform_code_id | Long | FK CodeItem (code_group: PLATFORM), NOT NULL | |
| watch_url | String | NOT NULL | 해당 플랫폼에서 이 작품 시청 링크 (Page 4 Watch Now) |
| sort_order | Integer | default 0 | Page 4 플랫폼 바 순서 |
| created_at, updated_at | Timestamp | audit | |

UNIQUE(title_id, platform_code_id).

### API 초안

| 메서드 | 경로 | 설명 | 모듈 |
|--------|------|------|------|
| GET | /api/codes/{groupKey} | 공통 코드 조회 (COUNTRY/GENRE/PLATFORM) | user |
| GET | /api/titles | 작품 검색/필터 목록 (쿼리: q, countryKeys[], genreKeys[], platformKeys[], sort, page) | user |
| GET | /api/titles/{id} | 작품 상세 | user |
| GET | /api/admin/titles | 관리자 작품 목록 | admin |
| POST | /api/admin/titles | 작품 생성 | admin |
| PUT | /api/admin/titles/{id} | 작품 수정 | admin |
| DELETE | /api/admin/titles/{id} | 작품 삭제 | admin |
| (+공통) | /api/admin/code-items | 공통 코드 아이템 관리 | admin |

### 권장 정렬 옵션 (v1)

- `latest` — `created_at DESC` (기본)
- `rating` — `rating DESC NULLS LAST`

---

## Page 4 — 작품 상세 (상단)

### PDF 수정사항

| # | 항목 | 수정 내용 |
|---|------|-----------|
| 1 | 우상단 공유 아이콘 | **숨김 처리** (v1 에서 프론트에 렌더링 안 함) |
| 2 | 플랫폼 바 (NETFLIX/TVING/쿠팡플레이) | 작품에 **플랫폼 링크(watch_url) 가 있는 것만 자동 노출**. 없으면 자연스럽게 숨김 |
| 3 | Watch Now 버튼 | 관리자가 **직접 watch_now_url 을 작품에 입력**. 링크 없으면 버튼 비활성/숨김 |
| 4 | 하트 아이콘 | 숨김 (좋아요 기능 제거) |
| 5 | Watch Now 바 | 좌우 풀 너비 정렬 (하트 제거 후) |

### 사용자 화면 요구사항

- **상단 히어로 영역**: `Title.backdrop_file_id` (16:9 상세 이미지). 뒤로가기 + 검색 아이콘만 (공유 없음)
- **제목 + 별점**: `title_name_ko` + "★ {rating} ({review_count}건 리뷰)"
- **탭**: Synopsis / Cast / Similar
  - Synopsis 탭:
    - 시놉시스 본문: `Title.synopsis` (긴 경우 요약 + "More" 버튼으로 펼침)
    - 메타 칩: `age_rating` / `release_year` / "{episode_count} EP" / 대표 장르(name_ko)
    - **플랫폼 바**: `TitlePlatform` 중 `watch_url IS NOT NULL` 인 것만, sort_order ASC. 아이콘(=CodeItem.icon_file_id) 또는 name_ko 표시
  - Cast 탭: Page 5 에서 상세 정의
  - Similar 탭: `TitleSimilar` 매핑된 작품 카드
- **설문 배너**: 상세 페이지 중간에도 노출 (Page 5 에서 확정 — 홈 Banner 와 동일 테이블 공유 여부 결정)
- **하단 고정 Watch Now 바**: 풀 너비. 클릭 → `Title.watch_now_url` 새 창. URL 없으면 버튼 비활성화.

### Title 엔티티 최종 정의 (v1)

Page 3 초안에 상세 필드 추가.

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| title_id | Long | PK, auto | |
| title_name_ko | String | NOT NULL | 한글 작품명 |
| title_name_en | String | nullable | 영문 작품명 |
| poster_file_id | Long | FK StoredFile, nullable | **썸네일** (홈 카드·필터 결과 그리드) |
| backdrop_file_id | Long | FK StoredFile, nullable | **상세 히어로 이미지** (16:9 권장) |
| country_code_id | Long | FK CodeItem (code_group: COUNTRY), NOT NULL | |
| release_year | Integer | nullable | |
| episode_count | Integer | nullable | 예: 20 |
| age_rating | String | nullable | 자유 텍스트 ("19+", "ALL") |
| rating | Decimal(2,1) | nullable | 별점 (관리자 수동 입력) |
| review_count | Integer | NOT NULL, default 0 | 리뷰 수 (관리자 수동 입력, v1) |
| synopsis | Text | nullable | 시놉시스 (관리자 입력) |
| watch_now_url | String | nullable | Watch Now 버튼 대상 URL (관리자 입력) |
| is_active | Boolean | NOT NULL, default true | 비활성 시 사용자 화면 노출 안됨 |
| created_at, updated_at | Timestamp | audit | |

### TitleSimilar (다대다, 관리자 수동 지정)

| 필드 | 타입 | 제약 |
|------|------|------|
| title_similar_id | Long | PK, auto |
| title_id | Long | FK Title, NOT NULL |
| similar_title_id | Long | FK Title, NOT NULL |
| sort_order | Integer | NOT NULL, default 0 |
| created_at, updated_at | Timestamp | audit |

UNIQUE(title_id, similar_title_id). `title_id != similar_title_id` 검증 (Service 레벨).

### 메타 칩의 "대표 장르"

`TitleGenre` 의 sort_order=0 (가장 앞) 의 CodeItem.name_ko 를 표시.
관리자 작품 편집 화면에서 장르 순서 드래그로 조정.

### API 추가

| 메서드 | 경로 | 설명 | 모듈 |
|--------|------|------|------|
| GET | /api/titles/{id} | 작품 상세 (Genre/Platform/Similar/Cast 포함) | user |
| GET | /api/admin/titles/{id} | 관리자 상세 조회 (편집용) | admin |
| POST | /api/admin/titles/{id}/genres | 작품 장르 매핑 일괄 갱신 | admin |
| POST | /api/admin/titles/{id}/platforms | 작품 플랫폼 매핑 일괄 갱신 (각 watch_url 포함) | admin |
| POST | /api/admin/titles/{id}/similar | 작품 유사작 매핑 일괄 갱신 | admin |

### 권장 응답 구조 (GET /api/titles/{id})

```json
{
  "success": true,
  "data": {
    "titleId": 1,
    "titleNameKo": "레이디 두아",
    "posterUrl": "/api/files/...",
    "backdropUrl": "/api/files/...",
    "rating": 5.0,
    "reviewCount": 207,
    "ageRating": "19+",
    "releaseYear": 2025,
    "episodeCount": 20,
    "country": { "codeItemId": 1, "itemKey": "KR", "nameKo": "한국" },
    "genres": [ { "codeItemId": 10, "itemKey": "DRAMA", "nameKo": "드라마" } ],
    "platforms": [
      { "codeItemId": 20, "itemKey": "NETFLIX", "nameKo": "넷플릭스", "iconUrl": "/api/files/...", "watchUrl": "https://..." }
    ],
    "similar": [ { "titleId": 3, "titleNameKo": "...", "posterUrl": "..." } ],
    "cast": [],
    "synopsis": "...",
    "watchNowUrl": "https://..."
  }
}
```

---

## Page 5 — 작품 상세 (하단 — 배너 + Cast)

### PDF 수정사항

| # | 항목 | 수정 내용 |
|---|------|-----------|
| 1 | 중간 설문 배너 | 링크 삽입. **홈의 `Banner` 테이블을 그대로 공유 노출** |
| 2 | Cast 섹션 | 역할 라벨("Lead Cast" 등) **화면 비노출**. 이름만 표시 |

### 사용자 화면 요구사항

- **배너**: 작품 상세 중간에 홈과 **동일한 Banner 리스트** (is_visible=true, sort_order, LIMIT 5) 를 표시. 상세 화면에서는 1개만 보여도 되고 스와이프 가능해도 무방 — 프론트 선택
- **Cast 섹션**:
  - `TitleCast` 매핑된 배우들을 sort_order 순으로 표시
  - 이름만 (`Cast.cast_name_ko`) 노출. 역할(`role_label`), 프로필 이미지는 **데이터 유지 / 화면 비노출** — 이후 노출 전환 쉽게

### 엔티티 정의

#### Cast (배우 마스터, 관리자 CRUD)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| cast_id | Long | PK, auto | |
| cast_name_ko | String | NOT NULL | 한글 이름 |
| cast_name_en | String | nullable | 영문 이름 |
| profile_file_id | Long | FK StoredFile, nullable | 프로필 이미지 (관리자 업로드, v1 화면 비노출) |
| is_active | Boolean | NOT NULL, default true | |
| created_at, updated_at | Timestamp | audit | |

#### TitleCast (작품-배우 매핑)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| title_cast_id | Long | PK, auto | |
| title_id | Long | FK Title, NOT NULL | |
| cast_id | Long | FK Cast, NOT NULL | |
| role_label | String | nullable | 역할명 (관리자 수동 입력, v1 화면 비노출) |
| sort_order | Integer | NOT NULL, default 0 | 작품 내 표시 순서 |
| created_at, updated_at | Timestamp | audit | |

UNIQUE(title_id, cast_id).

### API 추가

| 메서드 | 경로 | 설명 | 모듈 |
|--------|------|------|------|
| GET | /api/admin/casts | 배우 목록 | admin |
| GET | /api/admin/casts/{id} | 배우 상세 | admin |
| POST | /api/admin/casts | 배우 생성 | admin |
| PUT | /api/admin/casts/{id} | 배우 수정 | admin |
| DELETE | /api/admin/casts/{id} | 배우 삭제 (TitleCast 참조 없을 때만) | admin |
| POST | /api/admin/titles/{id}/cast | 작품 배우 매핑 일괄 갱신 (cast_id 선택 + role_label 입력 + 순서) | admin |

Cast 는 사용자 화면에서 검색/노출 대상이 아니므로 `/api/casts` 공용 엔드포인트는 **생성하지 않음**. 작품 상세 응답(`GET /api/titles/{id}.cast[]`)에 포함되어 함께 전송.

---

## 최종 엔티티 요약 (v1)

### 공통 (자동 주입, YML 의 entities 에 명시 불필요)

- `StoredFile` — 파일 공통 ([harness/files.md](../../harness/files.md))
- `CodeGroup` / `CodeItem` — 공통 코드 ([harness/common-code.md](../../harness/common-code.md))

### 프로젝트 도메인

| 엔티티 | 역할 | 주요 관계 |
|--------|------|-----------|
| Member | 관리자 계정 (role=ADMIN). v1 에서 사용자 회원은 없음 | - |
| Section | 홈 섹션 3건 (seed 고정), is_visible 만 제어 | - |
| Banner | 홈 + 작품 상세 공용 배너 | image_file_id → StoredFile |
| SiteSetting | 로고 + Board 설문 URL (singleton) | logo_file_id → StoredFile |
| Title | 작품 | poster_file_id / backdrop_file_id → StoredFile, country_code_id → CodeItem |
| TitleGenre | 작품-장르 매핑 (다대다) | genre_code_id → CodeItem |
| TitlePlatform | 작품-플랫폼 매핑 + watch_url | platform_code_id → CodeItem |
| TitleSimilar | 작품-유사작 매핑 | - |
| Cast | 배우 마스터 | profile_file_id → StoredFile |
| TitleCast | 작품-배우 매핑 + role_label | - |

### 공통 코드 seed (3 그룹)

| group_key | 아이템 | 용도 |
|-----------|--------|------|
| COUNTRY | KR / US / CN / JP | 작품 국가, 필터 |
| GENRE | ROMANCE / HORROR / ACTION / COMEDY / BL / DRAMA | 작품 장르, 필터 |
| PLATFORM | NETFLIX / TVING / COUPANG | 작품 플랫폼, 필터 |

### 주요 API 요약

#### user 모듈 (/api/...)

- `GET /api/home` — 홈 전체 묶음 (배너 + 섹션 3종 + siteSetting)
- `GET /api/codes/{groupKey}` — COUNTRY/GENRE/PLATFORM 조회 (필터용)
- `GET /api/titles` — 탐색/필터 (q, countryKeys, genreKeys, platformKeys, sort, page)
- `GET /api/titles/{id}` — 작품 상세 (genre/platform/similar/cast 포함)
- `POST /api/files` — 업로드 (v1 에선 관리자 업로드가 주)
- `GET /api/files/{fileKey}` — 파일 다운로드 (공개)

#### admin 모듈 (/api/admin/...)

- 인증: `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/me`
- 공통 코드: `GET/POST/PUT/DELETE /api/admin/code-groups|code-items`
- 사이트 설정: `GET/PUT /api/admin/site-setting`
- 배너: `GET/POST/PUT/DELETE /api/admin/banners`
- 섹션: `GET/PUT /api/admin/sections` (is_visible 토글만)
- 작품: `GET/POST/PUT/DELETE /api/admin/titles` + `POST /api/admin/titles/{id}/{genres|platforms|similar|cast}`
- 배우: `GET/POST/PUT/DELETE /api/admin/casts`
- 파일: 공용 `/api/files` 재사용

### 사용자 페이지 (user 프론트)

| 페이지 | 경로 | auth |
|--------|------|------|
| 홈 | / | false |
| 탐색/필터 | /search | false |
| 작품 상세 | /titles/:id | false |
| Board (외부 링크 이동) | (SiteSetting.board_survey_url) | - |

### 관리자 페이지 (admin 프론트)

| 페이지 | 경로 | 메뉴 그룹 |
|--------|------|-----------|
| 로그인 | /login | - (비로그인 접근) |
| 회원가입 | /signup | - (비로그인 접근, 성공 시 role=ADMIN 자동 + 자동 로그인) |
| 대시보드 | / | 운영 |
| 배너 관리 | /banners | 컨텐츠 |
| 섹션 노출 관리 | /sections | 컨텐츠 |
| 작품 목록/등록/수정 | /titles, /titles/new, /titles/:id | 컨텐츠 |
| 배우 목록/등록/수정 | /casts, /casts/new, /casts/:id | 컨텐츠 |
| 공통 코드 관리 | /codes | 시스템 |
| 사이트 설정 | /settings | 시스템 |

### admin 공통 컴포넌트 (하네스 규칙 준수)

admin 프론트는 `src/components/common/` 공통 컴포넌트 세트를 사전 생성하여 **모든 페이지에서 사용**.
(user 프론트는 공통 컴포넌트 사전 생성하지 않음 — 페이지별 자체 구성)

| 카테고리 | 컴포넌트 |
|----------|----------|
| 테이블 | `DataTable`, `Pagination`, `Toolbar` |
| 폼 | `FormSection`, `FormField`, `TextInput`, `TextareaInput`, `NumberInput`, `SelectBox`, `MultiSelectBox`, `Checkbox`, `Switch`, `DatePicker`, `FileUploader` |
| 피드백 | `Dialog`, `ConfirmDialog`, `Toast` (+`ToastProvider`/`useToast`), `EmptyState`, `LoadingSpinner`, `ErrorAlert` |
| 검색 | `SearchFilter` |
| 공통 코드 | `CodeSelect`, `CodeMultiSelect` |

페이지 내 원시 요소(`<table>`, `<input>`, `window.confirm`, `alert`, 자체 모달) 사용 **금지**.
자세한 인터페이스: [harness/template-admin.md](../../harness/template-admin.md) 공통 컴포넌트 섹션.

### 파일 업로드 정책 (이 프로젝트)

```yaml
files:
  max_size_mb: 10
  allowed_mime: ["image/png", "image/jpeg", "image/webp"]
  upload_auth: true            # 로그인 필수 (관리자)
  download_auth: false         # 공개
```

### 권한

- admin 백엔드 비인증 허용: `/api/admin/auth/signup`, `/api/admin/auth/login`, `/api/admin/auth/check-id/**`
- 그 외 모든 admin 경로: role=ADMIN 필수 (세션 기반, SessionRoleFilter)
- 관리자 회원가입: 누구나 가능 + role=ADMIN 자동 부여 + 성공 시 자동 로그인 + 대시보드 이동
- admin 프론트 비로그인 상태: `/login` 과 `/signup` 만 접근. 그 외 경로 → `/login` 리다이렉트
- user 경로: 비인증 공개
- user 백엔드는 로그인 API 없음 (v1). admin 백엔드만 인증 관련 API 제공

