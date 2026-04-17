# 공통 코드 (Common Code) 규칙

분류·옵션·태그 등 **값의 목록** 이 필요한 경우 개별 엔티티를 만들지 않고 공통 `CodeGroup` / `CodeItem` 으로 처리한다.
모든 프로젝트에 자동 주입되는 공통 엔티티.

YML 에 명시하지 않아도 생성기는 이 규칙에 따라 두 엔티티 + 관련 API 를 프로젝트에 주입한다.

---

## 1. 언제 쓰는가

| 쓴다 | 쓰지 않는다 |
|------|-------------|
| Country, Genre, Platform 같은 **선택지 목록** | 고유 속성이 많은 도메인 엔티티 (Title, Member, Order 등) |
| 관리자가 값 추가·삭제·수정 해야 하는 분류 | 값이 변하지 않는 Enum (Role, MemberType 같은 소수 고정값) |
| 여러 엔티티가 같은 값 리스트를 공유 | 한 엔티티만의 고유 필드 |
| 드롭다운·필터·태그 등 | 관계성이 있는 본격 도메인 |

### Enum vs Common Code

- **Enum**: 코드 레벨 의미 (Role: USER/ADMIN). 변경 불가 + 분기 로직에 직접 사용
- **Common Code**: 데이터 레벨 값 (Genre: 로맨스/액션/...). 관리자가 자유롭게 CRUD

---

## 2. 엔티티 정의

### CodeGroup

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `code_group_id` | Long | PK, auto | |
| `group_key` | String | UNIQUE, NOT NULL | 대문자 단어/언더스코어 (예: `COUNTRY`, `GENRE`, `PLATFORM`) |
| `group_name_ko` | String | NOT NULL | 한글 그룹명 |
| `group_name_en` | String | nullable | 영문 그룹명 |
| `description` | String | nullable | 설명 |
| `is_system` | Boolean | NOT NULL, default false | true 면 관리자가 그룹을 삭제 불가 |
| `sort_order` | Integer | NOT NULL, default 0 | 관리자 화면에서 그룹 정렬 |
| `created_at`, `updated_at` | Timestamp | audit | |

### CodeItem

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `code_item_id` | Long | PK, auto | |
| `code_group_id` | Long | FK CodeGroup, NOT NULL | |
| `item_key` | String | NOT NULL | 그룹 내 UNIQUE. 대문자 단어/언더스코어 (예: `KR`, `ROMANCE`, `NETFLIX`) |
| `name_ko` | String | NOT NULL | 한글 표시명 |
| `name_en` | String | nullable | 영문 표시명 |
| `sort_order` | Integer | NOT NULL, default 0 | 그룹 내 정렬 |
| `is_active` | Boolean | NOT NULL, default true | 비활성 시 드롭다운·필터에 노출 안됨 |
| `icon_file_id` | Long | FK StoredFile, nullable | 아이콘·로고 (예: 플랫폼 로고) |
| `extra_json` | String | nullable | 자유 메타 JSON (예: 외부 ID, 색상 등) |
| `created_at`, `updated_at` | Timestamp | audit | |

UNIQUE(code_group_id, item_key).

---

## 3. 참조 규칙 (다른 엔티티에서)

### 3.1 단일 선택 — 직접 FK

```yaml
Title:
  fields:
    - { name: country_code_id, type: Long, fk: CodeItem, required: true, label: 국가, code_group: COUNTRY }
```

- 컬럼명 규칙: **`{의미}_code_id`** — 컬럼 이름에서 어느 그룹인지 드러남
- `code_group` 속성: 검증용 힌트. Service 레이어에서 해당 그룹의 CodeItem 인지 확인

### 3.2 다중 선택 — 매핑 테이블

```yaml
TitleGenre:
  table: title_genre
  description: 작품-장르 다대다 매핑 (Genre 는 공통 코드)
  fields:
    - { name: title_genre_id, type: Long, pk: true, auto: true }
    - { name: title_id,       type: Long, fk: Title, required: true }
    - { name: genre_code_id,  type: Long, fk: CodeItem, required: true, label: 장르, code_group: GENRE }
    - { name: created_at,     type: Timestamp, auto: true, audit: true }
    - { name: updated_at,     type: Timestamp, auto: true, audit: true }
```

UNIQUE(title_id, genre_code_id) 권장.

### 3.3 다중 선택 + 매핑 고유 속성

예: 작품-플랫폼 매핑에 시청 URL 보관.

```yaml
TitlePlatform:
  table: title_platform
  fields:
    - { name: title_platform_id, type: Long, pk: true, auto: true }
    - { name: title_id,          type: Long, fk: Title, required: true }
    - { name: platform_code_id,  type: Long, fk: CodeItem, required: true, label: 플랫폼, code_group: PLATFORM }
    - { name: watch_url,         type: String, required: true, label: 시청 URL }
    - { name: created_at,        type: Timestamp, auto: true, audit: true }
    - { name: updated_at,        type: Timestamp, auto: true, audit: true }
```

---

## 4. 공통 API

모든 프로젝트의 backend 에 자동 포함. split backend 이면 user/admin 양쪽에 생성.

### 사용자·공용 API (조회)

```
GET /api/codes/{groupKey}
  → 해당 그룹의 is_active=true 인 CodeItem 목록 (sort_order ASC)

Response:
  {
    "success": true,
    "data": [
      { "codeItemId": 1, "itemKey": "KR", "nameKo": "한국", "nameEn": "Korea",
        "sortOrder": 1, "iconUrl": null, "extraJson": null },
      ...
    ]
  }
```

`iconUrl` 은 `icon_file_id` 가 있으면 `/api/files/{file_key}`.

### 관리자 API (CRUD)

admin 백엔드 (split) 또는 unified 의 `/api/admin/**` 에서 제공:

```
GET    /api/admin/code-groups              — 그룹 목록
GET    /api/admin/code-groups/{id}         — 그룹 상세 + 아이템 포함
POST   /api/admin/code-groups              — 그룹 생성 (is_system=false 만)
PUT    /api/admin/code-groups/{id}         — 그룹 수정
DELETE /api/admin/code-groups/{id}         — 그룹 삭제 (is_system=false, 참조 없을 때)

GET    /api/admin/code-items?groupKey=GENRE — 그룹별 아이템 목록
POST   /api/admin/code-items               — 아이템 생성
PUT    /api/admin/code-items/{id}          — 아이템 수정
DELETE /api/admin/code-items/{id}          — 아이템 삭제 (참조 없을 때)
```

### 인증

- 조회(`GET /api/codes/...`): 공개
- 관리자 CRUD: ADMIN 세션 필수 (다른 admin API 와 동일)

---

## 5. seed_data 에서 그룹·아이템 지정

프로젝트 YML 에 사용될 그룹과 아이템은 `seed_data` 에서 초기화.

```yaml
seed_data:
  CodeGroup:
    - { group_key: COUNTRY,  group_name_ko: 국가,    group_name_en: Country,  is_system: true,  sort_order: 10 }
    - { group_key: GENRE,    group_name_ko: 장르,    group_name_en: Genre,    is_system: true,  sort_order: 20 }
    - { group_key: PLATFORM, group_name_ko: 플랫폼,  group_name_en: Platform, is_system: true,  sort_order: 30 }

  CodeItem:
    - { group_key: COUNTRY,  item_key: KR,       name_ko: 한국,    name_en: Korea,   sort_order: 1 }
    - { group_key: COUNTRY,  item_key: US,       name_ko: 미국,    name_en: USA,     sort_order: 2 }
    - { group_key: COUNTRY,  item_key: CN,       name_ko: 중국,    name_en: China,   sort_order: 3 }
    - { group_key: COUNTRY,  item_key: JP,       name_ko: 일본,    name_en: Japan,   sort_order: 4 }

    - { group_key: GENRE,    item_key: ROMANCE,  name_ko: 로맨스,  name_en: Romance, sort_order: 1 }
    - { group_key: GENRE,    item_key: HORROR,   name_ko: 공포,    name_en: Horror,  sort_order: 2 }
    - { group_key: GENRE,    item_key: ACTION,   name_ko: 액션,    name_en: Action,  sort_order: 3 }
    - { group_key: GENRE,    item_key: COMEDY,   name_ko: 코미디,  name_en: Comedy,  sort_order: 4 }
    - { group_key: GENRE,    item_key: BL,       name_ko: B/L,     name_en: B/L,     sort_order: 5 }

    - { group_key: PLATFORM, item_key: NETFLIX,  name_ko: 넷플릭스, name_en: NETFLIX, sort_order: 1 }
    - { group_key: PLATFORM, item_key: TVING,    name_ko: 티빙,    name_en: TVING,    sort_order: 2 }
    - { group_key: PLATFORM, item_key: COUPANG,  name_ko: 쿠팡플레이, name_en: Coupang Play, sort_order: 3 }
```

- 생성기는 seed 시 `group_key` 로 CodeGroup 을 먼저 만들고, CodeItem 은 `group_key` 로 FK 를 해결
- `is_system: true` 인 그룹은 관리자 화면에서 삭제 불가 (수정은 가능)

---

## 6. 백엔드 구현 규칙

### 패키지 위치

- `domain/code/`
  - `entity/CodeGroup.java`, `entity/CodeItem.java`
  - `repository/CodeGroupRepository.java`, `repository/CodeItemRepository.java`
  - `controller/CodeController.java` — 공용 조회
  - `controller/CodeAdminController.java` — 관리자 CRUD (unified) 또는 admin 백엔드 (split)
  - `service/CodeService.java`
  - `dto/CodeGroupRequest/Response.java`, `CodeItemRequest/Response.java`

### 서비스 메서드

- `getItemsByGroup(String groupKey)` — 드롭다운·필터용 조회 (is_active=true)
- `validateBelongs(Long codeItemId, String expectedGroupKey)` — 다른 엔티티 저장 시 그룹 검증
  - 일치하지 않으면 `IllegalArgumentException("선택한 코드가 {expectedGroupKey} 그룹이 아닙니다")`

### 검증 (code_group 힌트 활용)

다른 엔티티의 Service 에서 `code_group: GENRE` 속성이 명시된 FK 필드를 저장할 때,
`CodeService.validateBelongs(..., "GENRE")` 를 호출하여 그룹 소속 확인.

---

## 7. 프론트엔드 구현 규칙

### API / 타입

- `api/codeApi.ts`
  - `fetchCodeItems(groupKey: string): Promise<CodeItem[]>`
- `types/code.ts`
  ```typescript
  export interface CodeItem {
    codeItemId: number;
    itemKey: string;
    nameKo: string;
    nameEn: string | null;
    sortOrder: number;
    iconUrl: string | null;
    extraJson: string | null;
  }
  ```

### 캐시

- 공통 코드는 변동이 적음 → `sessionStorage` 캐시 권장 (groupKey 별)
- 관리자가 수정 시 사용자 화면은 새로고침 시 반영

### 공통 훅

- `hooks/useCodes.ts` — `useCodes(groupKey)` 로 드롭다운 옵션 가져오기

```typescript
export function useCodes(groupKey: string) {
  const [items, setItems] = useState<CodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchCodeItems(groupKey).then(setItems).finally(() => setLoading(false));
  }, [groupKey]);
  return { items, loading };
}
```

---

## 8. 적용 체크리스트

각 프로젝트 생성 시 자동 수행:

- [ ] `CodeGroup`, `CodeItem` 엔티티 + Repository + Service + Controller 생성
  - split backend (shared DB) 면 **양쪽 백엔드에 엔티티 복제**
- [ ] `CodeAdminController` 생성 (admin 백엔드 또는 unified)
- [ ] 프론트: `api/codeApi.ts`, `types/code.ts`, `hooks/useCodes.ts` 생성 (각 frontend app)
- [ ] seed_data 의 CodeGroup/CodeItem 을 프로젝트 시작 시 반영
- [ ] 관리자 화면에 "공통 코드 관리" 메뉴 자동 추가 (메뉴 그룹: 시스템)

---

## 9. 주의

- **enum vs common code** 를 혼동하지 말 것. 분기 로직에 쓰는 소수 고정값은 enum 으로, 사용자·관리자가 값 목록을 주무르는 것은 common code 로.
- `code_group` 힌트는 **서비스 레이어에서만** 검증 — DB 제약으로 강제하지 않음 (성능/유연성)
- 다국어가 본격 필요하면 name 필드를 확장하지 말고 별도 i18n 엔티티 도입 (하네스 범위 밖)
