# 명세 포맷 규칙 (Spec Format Convention)

YAML 명세 작성 시 반드시 아래 규칙을 따른다.
이 규칙을 위반한 명세는 코드 생성 전에 수정해야 한다.

명세는 **브레인스토밍 단계(skills/discovery.md)** 를 거쳐 확정된 모듈 구성 / 백엔드 전략 / DB 전략 / UI 소스가 반영되어 있어야 한다.

---

## 1. 필수 섹션

모든 명세 YAML 에는 아래 섹션이 **반드시** 존재해야 한다.

| 섹션 | 필수 | 설명 |
|------|------|------|
| `project` | O | 프로젝트 메타데이터 (id, version, modules, database 등) |
| `changelog` | O | 버전별 변경 이력 (v1은 "초기 버전") |
| `entities` | O | 엔티티 정의 (테이블, 필드, 검증, 관계) |
| `mock_data` | △ | data_source: mock 인 엔티티가 있으면 필수 |
| `seed_data` | △ | 재생성 시 복원할 초기 데이터 (선택) |
| `apis` | O | API 엔드포인트 정의 |
| `pages` | O | 페이지 정의 (메뉴 자동 생성 포함) |
| `auth` | O | 인증/권한 규칙 |
| `business_rules` | O | 핵심 비즈니스 로직 요약 |
| `files` | △ | 파일 업로드 정책 재정의 (선택, [harness/files.md](files.md) 참조) |

---

## 1.1 project 섹션

### 단일 모듈 간이 포맷 (user 하나만)

```yaml
project:
  id: resort-reservation
  name: 리조트 예약 시스템
  description: 리조트 객실 예약 시스템 (회원 유형별 객실/요금 차등)
  version: 1
  ports:
    backend: 8081
    frontend: 5176
  database:
    name: resortdb
```

→ 내부적으로 아래 멀티 포맷의 기본값으로 해석한다. 단일 모듈만 필요한 프로젝트에서 간이 포맷 사용 권장.

### 멀티 모듈 정식 포맷

브레인스토밍을 통해 확정된 전략을 `modules` 에 명시한다.

```yaml
project:
  id: resort-reservation
  name: 리조트 예약 시스템
  description: 리조트 객실 예약 시스템
  version: 1

  modules:
    # 프론트엔드: 모듈(앱) 1개 이상
    frontend:
      - { key: user,  port: 5176, template: user }
      - { key: admin, port: 5177, template: admin, ui_source: spec-requests/resort-reservation/assets/admin-dashboard.html }

    # 백엔드 전략
    backend:
      strategy: split               # unified | split
      apps:                         # strategy: unified 면 app 1개, split 이면 2개 이상
        - { key: user,  port: 8081 }
        - { key: admin, port: 8082 }

    # DB 전략
    database:
      strategy: shared              # shared | split
      shared_owner: user            # strategy: shared + backend.strategy: split 일 때만 필수
      # dbs:                        # strategy: split 일 때만
      #   - { key: user,  name: resortdb_user }
      #   - { key: admin, name: resortdb_admin }

  database:
    name: resortdb                  # strategy: shared 일 때 단일 DB 이름
```

### 속성 정의

#### `modules.frontend[]`

| 속성 | 필수 | 값 |
|------|------|----|
| `key` | O | 소문자 단어 1개 (`user`, `admin`). 같은 프로젝트 내 유일 |
| `port` | O | Vite dev server 포트 (다른 프로젝트와 충돌 금지) |
| `template` | O | `user` (Header+Footer) / `admin` (Sidebar+Topbar) / `custom` (ui_source 필수) |
| `ui_source` | △ | 디자인/HTML/JSX 자료 경로. `template: custom` 이거나 지정 화면이 있을 때 |
| `proxy_target` | △ | 프록시 대상 backend app key. 생략 시 같은 key 의 backend app 으로 자동 매핑 |

#### `modules.backend`

| 속성 | 필수 | 값 |
|------|------|----|
| `strategy` | O | `unified` (단일 앱) / `split` (앱 분리) |
| `apps[].key` | O | 소문자 단어. unified 면 보통 `main`, split 이면 `user` / `admin` |
| `apps[].port` | O | 앱 포트 |
| `apps[].role_scope` | △ | 해당 앱이 허용하는 role 목록. split 일 때 `admin` 앱은 `[ADMIN]`, `user` 앱은 `[USER, ADMIN]` 등 |

**unified 전략**: 단일 앱이 `/api/...` (user) + `/api/admin/...` (admin) 모두 처리.
**split 전략**: 앱마다 독립 실행. 각각 자기 path 범위만 담당.

#### `modules.database`

| 속성 | 필수 | 값 |
|------|------|----|
| `strategy` | O | `shared` (단일 DB) / `split` (앱별 독립 DB) |
| `shared_owner` | △ | `strategy: shared` + `backend.strategy: split` 일 때 필수. 스키마 주도권을 가질 backend app key (해당 앱만 `ddl-auto: update`, 나머지는 `validate`) |
| `dbs[]` | △ | `strategy: split` 일 때 필수. 각 backend app 별 DB 이름 매핑 |

**shared 전략**: H2 `AUTO_SERVER=TRUE` 로 한 파일을 여러 백엔드가 공유.
**split 전략**: 각 backend app 이 독립 DB 파일. 데이터 동기화는 API 호출로 해야 함.

#### 허용 조합 매트릭스

| 조합 | 설명 | 언제 쓰나 |
|------|------|-----------|
| frontend=[user], backend=unified(1 app), db=shared(1 db) | **Case 1: 단일** | 단순 사용자 사이트 |
| frontend=[user, admin], backend=unified, db=shared | **Case 2: 통합 백엔드** | 중소형, 운영자 기능이 간단 |
| frontend=[user, admin], backend=split(2 apps), db=shared | **Case 3: 분리 백엔드 + 공유 DB** | 실무 표준. 운영 배포 분리, 데이터 일관성 유지 |
| frontend=[user, admin], backend=split, db=split | **Case 4: 완전 분리** | 드물게, 운영 데이터와 사용자 데이터가 별개일 때 |

### 모듈 선언 규칙

- 모듈 `key` 는 **소문자 단어 1개** (예: `user`, `admin`). kebab-case 금지.
- 허용 key: `user`, `admin`, `main` (unified 시). 필요 시 확장.
- frontend `key` 와 backend `apps[].key` 가 같으면 프록시/CORS 자동 매핑.

### 포트·DB 이름 할당 규칙

- 신규 프로젝트 생성 시 `specs/` 아래 모든 YML 을 스캔하여 이미 쓰인 포트/DB 이름을 파악
- 충돌하지 않는 값을 자동 할당 후 YML 에 고정 기록
- 한 번 기록된 값은 **변경하지 않는다** (deterministic 보장)

---

## 1.2 changelog 섹션

```yaml
changelog:
  - version: 2
    date: 2026-04-17
    generation: 완전 재생성
    changes:
      - 어드민 모듈 신규 추가 (split backend, shared DB)
      - 객실 재고 관리 기능 추가 (admin)
  - version: 1
    date: 2026-04-16
    generation: 신규 생성
    changes:
      - 초기 버전 (user 모듈, 회원가입, 객실 조회/예약)
```

| 속성 | 필수 | 설명 |
|------|------|------|
| `version` | O | 해당 변경의 버전 번호 |
| `date` | O | 변경 일자 (YYYY-MM-DD) |
| `generation` | O | `신규 생성`, `완전 재생성`, `증분 수정` |
| `changes` | O | 변경 내용 리스트 — **모듈/전략 변경은 반드시 명시** |

changelog 의 최상단 엔트리의 `version` 이 `project.version` 과 같아야 한다.

---

## 1.3 seed_data 섹션 (선택)

재생성 시 DB 초기 데이터를 복원하기 위한 선언적 데이터. 생략 가능.

```yaml
seed_data:
  Member:
    - { login_id: admin, password: admin123, member_name: 관리자, phone: "010-0000-0000", role: ADMIN }
  Room:
    - { room_code: R001, room_name: 디럭스룸, stock_count: 5 }
```

- 키는 엔티티명과 일치
- **어드민 모듈이 있으면 `role: ADMIN` 계정을 최소 1개 포함** 권장
- DB strategy 가 split 인 경우, seed_data 아래 key 로 어느 DB 에 들어가는지 구분 (아래 예)

```yaml
seed_data:
  user_db:
    Member: [...]
  admin_db:
    AdminUser: [...]
```

---

## 2. 엔티티 규칙

### 2.1 필수 속성

```yaml
EntityName:
  table: snake_case_단수형
  description: 설명
  owned_by: user              # split DB 일 때만 필수. 이 엔티티가 속한 backend app key
  fields: [...]
```

| 속성 | 필수 | 설명 |
|------|------|------|
| `table` | O | snake_case, 단수형 |
| `description` | O | 엔티티 설명 |
| `owned_by` | △ | `database.strategy: split` 일 때만 필수. shared 면 생략 |
| `fields` | O | 필드 목록 |

### 2.2 PK 규칙

- 이름: `{테이블명}_id`
- 타입: `Long`
- 속성: `pk: true, auto: true`

### 2.3 FK 규칙

- 이름: `{참조 테이블명}_id`
- `fk` 속성에 참조 엔티티명 명시

```yaml
- { name: room_id, type: Long, fk: Room, required: true }
```

**split DB 주의**: FK 는 **같은 DB 내 엔티티만** 참조 가능. 다른 DB 엔티티 참조가 필요하면 ID 필드만 저장 (fk 생략) + API 호출로 조회.

### 2.4 감사 컬럼 (필수)

```yaml
- { name: created_at, type: Timestamp, auto: true, audit: true }
- { name: updated_at, type: Timestamp, auto: true, audit: true }
```

### 2.5 컬럼 네이밍

| 규칙 | 예시 |
|------|------|
| snake_case | `login_id`, `guest_name` |
| 축약 금지 | `description` (O) / `desc` (X) |
| Boolean `is_` 접두사 | `is_pinned`, `is_deleted` |
| 수량 `_count` 접미사 | `stock_count`, `view_count` |
| 명칭 `_name` 접미사 | `member_name`, `room_name` |

### 2.6 필드 필수 속성

| 속성 | 필수 | 설명 |
|------|------|------|
| `name` | O | snake_case |
| `type` | O | Long, String, Integer, Enum, Boolean, LocalDate, Timestamp |
| `required` | O | 필수 여부 (PK, audit 제외) |
| `label` | O | 한글 라벨 (PK, FK, audit 제외) |

### 2.7 Enum 정의

```yaml
enums:
  MemberType: [GENERAL, PARCEL]
```

### 2.8 StoredFile 엔티티 (공통, 자동 주입)

파일 업로드가 필요한 경우 `StoredFile` 엔티티를 직접 정의하지 **않는다**.
모든 프로젝트에 공통으로 자동 주입됨 — 상세: [harness/files.md](files.md).

다른 엔티티가 파일을 참조할 때:
```yaml
SiteSetting:
  fields:
    - { name: logo_file_id, type: Long, fk: StoredFile, required: false, label: 로고 }
```

컬럼명은 `{역할}_file_id` 형태 (예: `logo_file_id`, `image_file_id`, `attachment_file_id`).

### 2.9 CodeGroup / CodeItem (공통, 자동 주입)

분류·옵션·태그 등 **값의 목록** 은 개별 엔티티를 만들지 않고 공통 `CodeGroup` / `CodeItem` 사용.
모든 프로젝트에 자동 주입 — 상세: [harness/common-code.md](common-code.md).

다른 엔티티가 참조할 때:
```yaml
Title:
  fields:
    - { name: country_code_id, type: Long, fk: CodeItem, required: true, label: 국가, code_group: COUNTRY }
```

- 컬럼명: `{의미}_code_id`
- `code_group` 속성: 어느 CodeGroup 의 값이어야 하는지 힌트 (Service 레이어 검증용)
- 다중 선택이 필요하면 매핑 엔티티 정의 (예: `TitleGenre`, `TitlePlatform`)
- 그룹·아이템 초기값은 `seed_data` 에 기술

### 2.10 role 필드 (어드민 모듈이 있으면 권장)

사용자 엔티티(Member/User 등)에 **role** 필드 추가.

```yaml
- { name: role, type: Enum, enum: Role, required: true, default: USER, label: 권한 }

enums:
  Role: [USER, ADMIN]
```

- 로그인 시 role 을 세션에 저장
- admin 백엔드 / admin path 는 `role == ADMIN` 만 허용

---

## 3. API 규칙

### 3.1 필수 속성

```yaml
- { method: POST, path: /api/..., entity: EntityName, action: create, auth: true, module: user, description: 설명 }
```

| 속성 | 필수 | 값 |
|------|------|-----|
| `method` | O | GET, POST, PUT, DELETE |
| `path` | O | `/api/...` 소문자 |
| `entity` | O | 대상 엔티티명 |
| `action` | O | list, detail, create, update, delete, custom |
| `auth` | O | true/false |
| `module` | △ | 어느 backend app 에 속하는가. 생략 시 `user` |
| `role` | △ | 필요한 role (예: `ADMIN`). `module: admin` 이면 기본 `ADMIN` |
| `description` | O | 한글 설명 |

### 3.2 경로 규칙

**user 모듈 API** — path prefix `/api/`
- 목록: `/api/{엔티티 복수형}` (예: `/api/members`)
- 상세: `/api/{엔티티 복수형}/{id}`
- 커스텀: 동사 허용 (예: `/api/members/login`)

**admin 모듈 API** — path prefix `/api/admin/`
- 목록: `/api/admin/{엔티티 복수형}` (예: `/api/admin/rooms`)
- 상세: `/api/admin/{엔티티 복수형}/{id}`

**unified backend 전략**에서도 위 path 규칙은 동일. 단일 앱이 두 path prefix 모두 서빙.
**split backend 전략**에서는 각 앱이 자신의 path prefix 만 담당.

프론트엔드 코드는 **모듈에 관계없이 `/api/...` 그대로 호출**. Vite 프록시가 자신의 backend 로 라우팅.

---

## 4. 페이지 규칙

### 4.1 필수 속성

```yaml
- name: 페이지명
  path: /url-path
  auth: false
  module: user          # 생략 시 user
```

| 속성 | 필수 | 설명 |
|------|------|------|
| `name` | O | 한글 페이지명 |
| `path` | O | URL 경로 |
| `auth` | O | 인증 필요 여부 |
| `module` | △ | 어느 frontend 모듈에 속하는가. 생략 시 `user` |
| `role` | △ | 필요한 role. `module: admin` 이면 기본 `ADMIN` |
| `api` | △ | 사용하는 API 목록 |
| `ui_source` | △ | 특정 디자인/HTML/스크린샷 참조 경로 (있으면 그 UI 우선 구현) |
| `description` | △ | 페이지 설명 |

### 4.2 메뉴 자동 생성 속성

| 속성 | 기본값 | 설명 |
|------|--------|------|
| `nav` | true | false 면 네비게이션 메뉴에 표시 안함 |
| `nav_order` | 정의 순서 | 작을수록 앞 |
| `nav_group` | null | 같은 그룹끼리 묶음 (admin 사이드바에서 카테고리 헤더) |
| `nav_label` | name 값 | 메뉴 텍스트 |
| `show_when` | always | `always`, `logged_in`, `logged_out` |

**모듈별 메뉴 렌더링**
- `module: user` 페이지만 모아 user 프론트의 **Header 네비게이션** 생성
- `module: admin` 페이지만 모아 admin 프론트의 **Sidebar 메뉴** 생성 (nav_group 으로 카테고리)

### 4.3 폼 페이지 (form_fields)

```yaml
form_fields:
  - { field: 엔티티_필드명, label: 라벨, type: text, required: true }
```

| 속성 | 필수 | 설명 |
|------|------|------|
| `field` | O | 엔티티 필드명과 일치 |
| `label` | O | 한글 라벨 |
| `type` | O | text, password, email, tel, number, select, textarea, date, checkbox |
| `required` | O | 필수 여부 |
| `placeholder` | - | 플레이스홀더 |
| `inline_action` | - | 인라인 버튼 (예: 중복확인) |

### 4.4 리스트/상세 페이지 (display_fields)

```yaml
display_fields:
  - { field: 필드명, label: 라벨 }
```

- **user 모듈 리스트**: 기본 카드 그리드 (harness/template-user.md)
- **admin 모듈 리스트**: 기본 테이블 (harness/template-admin.md)
- `ui_source` 가 지정된 경우 해당 디자인을 우선 따름

---

## 5. 권한(auth) 규칙

### 5.1 멀티 모듈 포맷

```yaml
auth:
  method: session
  roles: [USER, ADMIN]     # 어드민 모듈이 있으면 필수
  user:
    public_pages: [...]
    protected_pages: [...]
    rule: 비로그인 사용자가 protected 페이지 접근 시 /login 으로 리다이렉트
  admin:
    login_path: /login
    protected_pages: ["**"]        # 기본 전부 보호
    public_pages: [/login]
    allowed_roles: [ADMIN]
    rule: 비로그인/비ADMIN 은 /login 으로 리다이렉트
```

### 5.2 단일 모듈 간이 포맷

```yaml
auth:
  method: session
  public_pages: [/, /signup, /login]
  protected_pages: [/my-reservations]
  rule: 비로그인 사용자가 protected 페이지 접근 시 /login 으로 리다이렉트
```

→ 내부적으로 `auth.user.public_pages` 로 해석.

### 5.3 일관성 검증

- 각 모듈의 `protected_pages` 의 모든 경로는 pages 에 `auth: true, module: {해당 모듈}` 로 정의되어야 함
- `public_pages` 는 `auth: false`
- 모든 경로가 public 또는 protected 중 하나에 포함되어야 함
- `auth.roles` 에 정의된 값만 페이지/API 의 `role` 에 사용 가능

---

## 6. 비즈니스 규칙 (business_rules)

- 최소 1개 이상
- 한 줄 자연어 요약

---

## 7. Mock 데이터 규칙

`data_source: mock` 인 엔티티가 있으면 `mock_data` 섹션 필수.

- 엔티티 필드명과 일치하는 키 사용
- 최소 3건 이상

---

## 8. 검증 체크리스트

### 공통
- [ ] `project.id` 가 kebab-case, 폴더명과 일치
- [ ] `project.version`, `database.name` 채워짐
- [ ] 포트·DB 이름이 다른 프로젝트 YML 과 충돌 없음
- [ ] changelog 최상단 version == project.version
- [ ] 모든 엔티티에 `{table}_id` PK
- [ ] 모든 엔티티에 `created_at`, `updated_at`
- [ ] 컬럼명 snake_case + 네이밍 규칙 준수
- [ ] FK 참조 엔티티가 entities 에 존재
- [ ] API 의 entity 가 entities 에 존재
- [ ] form_fields 의 field 가 엔티티 필드명과 일치
- [ ] mock 엔티티에 mock_data 존재

### 멀티 모듈
- [ ] `modules.frontend[].port`, `modules.backend.apps[].port` 모두 고유
- [ ] `modules.backend.strategy` 가 unified/split 중 하나
- [ ] `modules.database.strategy` 가 shared/split 중 하나
- [ ] split backend + shared DB 조합이면 `database.shared_owner` 가 존재하는 backend app key
- [ ] split DB 면 `database.dbs[].key` 가 backend apps[].key 와 1:1 대응
- [ ] split DB 면 모든 엔티티에 `owned_by` 가 존재하는 backend app key
- [ ] 사용자 엔티티에 `role` 필드 + `Role` enum 존재
- [ ] admin 모듈이 있으면 `auth.roles`, `auth.admin` 정의됨
- [ ] `module: admin` API 의 path 가 `/api/admin/` 으로 시작
- [ ] 각 페이지의 `module` 이 선언된 frontend key 중 하나
- [ ] 각 API 의 `module` 이 선언된 backend apps key 중 하나

### UI 소스
- [ ] `template: custom` 이면 `ui_source` 경로가 존재하고 파일이 읽을 수 있는 상태
- [ ] 페이지 `ui_source` 가 지정된 경우 해당 파일이 존재
