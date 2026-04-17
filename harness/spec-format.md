# 명세 포맷 규칙 (Spec Format Convention)

YAML 명세 작성 시 반드시 아래 규칙을 따른다.
이 규칙을 위반한 명세는 코드 생성 전에 수정해야 한다.

---

## 1. 필수 섹션

모든 명세 YAML에는 아래 섹션이 **반드시** 존재해야 한다.

| 섹션 | 필수 | 설명 |
|------|------|------|
| `project` | O | 프로젝트 메타데이터 (id, version, ports, database 등) |
| `changelog` | O | 버전별 변경 이력 (v1은 "초기 버전") |
| `entities` | O | 엔티티 정의 (테이블, 필드, 검증, 관계) |
| `mock_data` | △ | data_source: mock인 엔티티가 있으면 필수 |
| `seed_data` | △ | 재생성 시 복원할 초기 데이터 (선택) |
| `apis` | O | API 엔드포인트 정의 |
| `pages` | O | 페이지 정의 (메뉴 자동 생성 포함) |
| `auth` | O | 인증/권한 규칙 |
| `business_rules` | O | 핵심 비즈니스 로직 요약 |

---

## 1.1 project 섹션

```yaml
project:
  id: resort-reservation          # kebab-case, 폴더명과 동일
  name: 리조트 예약 시스템          # 한글 표시명
  description: 리조트 객실 예약 시스템 (회원 유형별 객실/요금 차등)
  version: 1                      # 현재 YML 버전 (업데이트 시 +1)
  ports:
    backend: 8081                 # 신규 생성 시 다른 프로젝트 YML과 충돌하지 않도록 할당
    frontend: 5176
  database:
    name: resortdb                # H2 파일명 (projects/{id}/data/{name}.mv.db)
```

| 속성 | 필수 | 설명 |
|------|------|------|
| `id` | O | 프로젝트 식별자 (kebab-case). `projects/{id}/` 폴더명과 일치해야 함 |
| `name` | O | 한글 표시명 |
| `description` | O | 프로젝트 설명 |
| `version` | O | YML 버전 번호 (정수, 업데이트마다 +1) |
| `ports.backend` | O | 백엔드 포트 (다른 프로젝트와 충돌 금지) |
| `ports.frontend` | O | 프론트엔드 포트 (다른 프로젝트와 충돌 금지) |
| `database.name` | O | H2 DB 파일명 (다른 프로젝트와 충돌 금지) |

**포트·DB 이름 할당 규칙**
- 신규 프로젝트 생성 시 `specs/` 아래 모든 YML을 스캔하여 이미 쓰인 값을 파악
- 충돌하지 않는 값을 자동 할당 후 YML에 고정 기록
- 한 번 기록된 값은 **변경하지 않는다** (deterministic 보장)

## 1.2 changelog 섹션

```yaml
changelog:
  - version: 2
    date: 2026-04-17
    generation: 완전 재생성         # 또는 "증분 수정", "신규 생성"
    changes:
      - 예약 취소 기능 추가
      - 객실 요금 구조 변경 (평일/주말 분리)
  - version: 1
    date: 2026-04-16
    generation: 신규 생성
    changes:
      - 초기 버전 (회원가입, 객실 조회/예약)
```

| 속성 | 필수 | 설명 |
|------|------|------|
| `version` | O | 해당 변경의 버전 번호 |
| `date` | O | 변경 일자 (YYYY-MM-DD) |
| `generation` | O | 생성 방식: `신규 생성`, `완전 재생성`, `증분 수정` |
| `changes` | O | 변경 내용 리스트 (한 줄 요약) |

changelog의 최상단 엔트리의 `version` 이 `project.version` 과 같아야 한다.

## 1.3 seed_data 섹션 (선택)

재생성 시 DB 초기 데이터를 복원하기 위한 선언적 데이터. 생략 가능.

```yaml
seed_data:
  Member:
    - { login_id: admin, password: admin123, member_name: 관리자, phone: "010-0000-0000", parcel_member_no: null }
  Room:
    - { room_code: R001, room_name: 디럭스룸, stock_count: 5 }
```

- 키는 엔티티명과 일치
- 리스트 항목은 해당 엔티티 필드와 일치
- 재생성 시 이 데이터로 DB 초기화

---

## 2. 엔티티 규칙

### 2.1 필수 속성

```yaml
EntityName:
  table: snake_case_단수형    # 필수
  description: 설명           # 필수
  fields: [...]               # 필수
```

### 2.2 PK 규칙

- 이름: `{테이블명}_id` (예: `member_id`, `room_id`)
- 타입: `Long`
- 속성: `pk: true, auto: true`

```yaml
# O
- { name: member_id, type: Long, pk: true, auto: true }

# X — id 단독 사용 금지
- { name: id, type: Long, pk: true, auto: true }
```

### 2.3 FK 규칙

- 이름: `{참조 테이블명}_id` (예: `room_id`, `member_id`)
- `fk` 속성에 참조 엔티티명 명시

```yaml
- { name: room_id, type: Long, fk: Room, required: true }
```

### 2.4 감사 컬럼 (필수)

모든 엔티티에 아래 두 컬럼을 **반드시** 포함한다.

```yaml
- { name: created_at, type: Timestamp, auto: true, audit: true }
- { name: updated_at, type: Timestamp, auto: true, audit: true }
```

### 2.5 컬럼 네이밍

| 규칙 | 예시 |
|------|------|
| snake_case | `login_id`, `guest_name` |
| 축약 금지, 풀네임 사용 | `description` (O) / `desc` (X) |
| Boolean: `is_` 접두사 | `is_pinned`, `is_deleted` |
| 수량/횟수: `_count` 접미사 | `stock_count`, `view_count` |
| 명칭: `_name` 접미사 | `member_name`, `room_name` |

### 2.6 필드 필수 속성

모든 필드에 아래 속성을 명시한다 (audit 컬럼 제외).

| 속성 | 필수 | 설명 |
|------|------|------|
| `name` | O | 컬럼명 (snake_case) |
| `type` | O | 타입 (Long, String, Integer, Enum, Boolean, LocalDate, Timestamp) |
| `required` | O | 필수 여부 (PK, audit 제외) |
| `label` | O | 한글 라벨 (PK, FK, audit 제외) |

### 2.7 Enum 정의

엔티티 내부에 `enums` 블록으로 정의한다. 값은 UPPER_SNAKE_CASE.

```yaml
enums:
  MemberType: [GENERAL, PARCEL]
```

### 2.8 테이블 네이밍

- snake_case, 단수형
- 접미사 `_board`, `_table` 금지
- 조인 테이블: 두 테이블명 조합 (예: `room_permission`)

---

## 3. API 규칙

### 3.1 필수 속성

```yaml
- { method: POST, path: /api/..., entity: EntityName, action: create, auth: true, description: 설명 }
```

| 속성 | 필수 | 값 |
|------|------|-----|
| `method` | O | GET, POST, PUT, DELETE |
| `path` | O | `/api/{도메인}` 형태, 소문자 |
| `entity` | O | 대상 엔티티명 (entities에 존재해야 함) |
| `action` | O | list, detail, create, update, delete, custom |
| `auth` | O | true/false |
| `description` | O | 한글 설명 |

### 3.2 경로 규칙

- 기본: `/api/{엔티티 복수형}` (예: `/api/members`, `/api/rooms`)
- 상세: `/api/{엔티티 복수형}/{id}` (예: `/api/rooms/{id}`)
- 커스텀: 동사 허용 (예: `/api/members/login`)

---

## 4. 페이지 규칙

### 4.1 필수 속성

```yaml
- name: 페이지명
  path: /url-path
  auth: false
```

| 속성 | 필수 | 설명 |
|------|------|------|
| `name` | O | 한글 페이지명 (메뉴 표시에도 사용) |
| `path` | O | URL 경로 |
| `auth` | O | 인증 필요 여부 |
| `api` | △ | 사용하는 API 목록 (폼/리스트 페이지는 필수) |
| `description` | △ | 페이지 설명 (메인, 리스트 등 구조 설명 필요 시) |

### 4.2 메뉴 자동 생성 속성

pages 정의에서 메뉴/네비게이션을 자동 생성한다. 아래 속성으로 제어한다.

| 속성 | 기본값 | 설명 |
|------|--------|------|
| `nav` | true | false면 네비게이션 메뉴에 표시하지 않음 |
| `nav_order` | 정의 순서 | 메뉴 표시 순서 (숫자, 작을수록 앞) |
| `nav_group` | null | 메뉴 그룹명 (같은 그룹끼리 묶음) |
| `nav_label` | name 값 | 메뉴에 표시할 텍스트 (name과 다를 때만 지정) |
| `show_when` | always | `always`, `logged_in`, `logged_out` — 로그인 상태별 메뉴 노출 |

```yaml
# 예시: 객실 상세는 메뉴에 안 보임 (목록에서 진입)
- name: 객실 상세
  path: /rooms/:id
  auth: false
  nav: false

# 예시: 로그인 후에만 메뉴에 보임
- name: 예약 확인
  path: /my-reservations
  auth: true
  show_when: logged_in
  nav_order: 30

# 예시: 비로그인 시에만 보임
- name: 로그인
  path: /login
  auth: false
  show_when: logged_out
  nav_order: 90
```

### 4.3 폼 페이지 (form_fields)

입력 폼이 있는 페이지는 `form_fields`를 정의한다.

```yaml
form_fields:
  - { field: 엔티티_필드명, label: 라벨, type: html_input_type, required: true/false }
```

| 속성 | 필수 | 설명 |
|------|------|------|
| `field` | O | 엔티티 필드명과 일치 |
| `label` | O | 한글 라벨 |
| `type` | O | text, password, email, tel, number, select, textarea |
| `required` | O | 필수 여부 |
| `placeholder` | - | 플레이스홀더 |
| `inline_action` | - | 인라인 버튼 (예: 중복확인) |

### 4.4 리스트/상세 페이지 (display_fields)

데이터를 표시하는 페이지는 `display_fields`를 정의한다.

```yaml
display_fields:
  - { field: 필드명, label: 라벨 }
```

---

## 5. 권한(auth) 규칙

### 5.1 필수 속성

```yaml
auth:
  method: session          # 필수: session 또는 jwt
  public_pages: [...]      # 필수: 비인증 접근 가능 경로
  protected_pages: [...]   # 필수: 인증 필요 경로
  rule: 리다이렉트 규칙     # 필수: 비인증 접근 시 동작
```

### 5.2 일관성 검증

- `protected_pages`의 모든 경로는 pages 섹션에 `auth: true`로 정의되어 있어야 한다
- `public_pages`의 모든 경로는 pages 섹션에 `auth: false`로 정의되어 있어야 한다
- pages에 정의된 모든 경로는 public 또는 protected 중 하나에 포함되어야 한다

---

## 6. 비즈니스 규칙 (business_rules)

- 최소 1개 이상 정의
- 각 규칙은 한 줄로 요약 (자연어 허용)
- 엔티티의 `validations`, `side_effects`와 중복 가능 (요약 목적)

---

## 7. Mock 데이터 규칙

`data_source: mock`인 엔티티가 있으면 `mock_data` 섹션 필수.

- 엔티티 필드명과 일치하는 키 사용
- 관계 데이터(가격, 권한 등)도 함께 정의
- 최소 3건 이상 (다양한 케이스 커버)

---

## 8. 검증 체크리스트

명세 작성 완료 후 아래를 검증한다.

- [ ] project.id 가 kebab-case 이고 폴더명과 일치하는가
- [ ] project.version, project.ports, project.database 가 모두 채워져 있는가
- [ ] ports, database.name 이 다른 프로젝트 YML과 충돌하지 않는가
- [ ] changelog의 최상단 version 이 project.version 과 일치하는가
- [ ] 모든 엔티티에 `{table}_id` PK가 있는가
- [ ] 모든 엔티티에 `created_at`, `updated_at` 감사 컬럼이 있는가
- [ ] 컬럼명이 snake_case이고 네이밍 규칙(_count, _name, is_)을 따르는가
- [ ] FK의 참조 엔티티가 entities에 존재하는가
- [ ] API의 entity가 entities에 존재하는가
- [ ] pages의 auth와 auth 섹션의 public/protected가 일치하는가
- [ ] form_fields의 field가 엔티티 필드명과 일치하는가
- [ ] data_source: mock 엔티티에 mock_data가 있는가
- [ ] 모든 필수 속성이 누락 없이 채워져 있는가
