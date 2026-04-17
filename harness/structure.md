# 폴더 구조 규칙

## 전체 구조

하나의 `example/` 안에 여러 프로젝트가 `projects/{projectId}/` 하위에 격리되어 공존한다.
각 프로젝트는 브레인스토밍으로 결정된 **4가지 케이스** 중 하나의 구조를 갖는다.

```
example/
├── harness/                           # 하네스 규칙 (공용)
├── skills/                            # 스킬 레시피 (공용)
├── spec-requests/{projectId}/
│   ├── {projectId}.v{n}.md            # 요구사항 원문
│   └── assets/                        # 첨부된 디자인/HTML/스크린샷 (선택)
├── specs/{projectId}/
│   ├── {projectId}.v{n}.yml           # YML 명세
│   └── log.md                         # 현재 최신 버전 + changelog
├── log/{date}_{projectId}_v{n}.md     # 빌드 로그
└── projects/
    └── {projectId}/                   # ← 아래 4가지 케이스 중 하나
```

## 4가지 프로젝트 구조 케이스

어느 케이스인지는 `specs/{id}/{id}.v{n}.yml` 의 `project.modules` 로 결정된다.
선택 기준은 [skills/discovery.md](../skills/discovery.md) 참조.

### Case 1: 단일 (user 만)

```yaml
# YML 간이 포맷
ports: { backend: 8081, frontend: 5176 }
database: { name: resortdb }
```

```
projects/{projectId}/
├── frontend/                          # Vite 앱 (user 템플릿)
│   └── src/...
├── backend/                           # Spring Boot 앱
│   └── src/main/...
├── data/
│   └── {dbName}.mv.db
└── schema.md
```

- 가장 단순. 사용자용 사이트만 만들 때.
- 실행: `backend && ./gradlew bootRun`, `frontend && npm run dev`

---

### Case 2: 멀티 + 통합 백엔드 + 공유 DB

```yaml
modules:
  frontend:
    - { key: user,  port: 5176, template: user }
    - { key: admin, port: 5177, template: admin }
  backend:
    strategy: unified
    apps:
      - { key: main, port: 8081 }
  database:
    strategy: shared
database: { name: resortdb }
```

```
projects/{projectId}/
├── frontend/
│   ├── user/                          # user 템플릿 (Header + Footer)
│   └── admin/                         # admin 템플릿 (Sidebar + Topbar)
├── backend/                           # 단일 Spring Boot 앱
│   └── src/main/...                   # /api/... + /api/admin/... 모두 서빙
├── data/
│   └── {dbName}.mv.db
└── schema.md
```

- 백엔드가 작고 운영 부담이 적을 때. 배포 1개.
- admin API 는 path prefix `/api/admin/` + role 체크 필터로 구분.
- 두 프론트 모두 Vite 프록시 target 은 `http://localhost:{main port}`.

---

### Case 3: 멀티 + 분리 백엔드 + 공유 DB (실무 표준)

```yaml
modules:
  frontend:
    - { key: user,  port: 5176, template: user }
    - { key: admin, port: 5177, template: admin }
  backend:
    strategy: split
    apps:
      - { key: user,  port: 8081 }
      - { key: admin, port: 8082 }
  database:
    strategy: shared
    shared_owner: user
database: { name: resortdb }
```

```
projects/{projectId}/
├── frontend/
│   ├── user/                          # 포트 5176, 프록시 → localhost:8081
│   └── admin/                         # 포트 5177, 프록시 → localhost:8082
├── backend/
│   ├── user/                          # 포트 8081, ddl-auto: update (shared_owner)
│   │   └── src/main/java/com/harness/{camel}/user/...
│   └── admin/                         # 포트 8082, ddl-auto: validate
│       └── src/main/java/com/harness/{camel}/admin/...
├── data/
│   └── {dbName}.mv.db                 # H2 AUTO_SERVER=TRUE 로 두 앱이 공유
└── schema.md
```

- 가장 실무적. 운영/사용자 앱의 배포·스케일·장애 격리.
- DB 파일은 하나. 데이터 일관성 유지.
- **스키마 주도권**: `database.shared_owner` 가 지정한 앱만 `ddl-auto: update`. 나머지는 `validate` (스키마 불일치 시 기동 실패).
- 엔티티 클래스는 두 앱이 **각자 자기 복제본** 을 보유 (내용 동일). YML 하나에서 양쪽 모두 생성됨.

---

### Case 4: 멀티 + 분리 백엔드 + 분리 DB

```yaml
modules:
  frontend:
    - { key: user,  port: 5176, template: user }
    - { key: admin, port: 5177, template: admin }
  backend:
    strategy: split
    apps:
      - { key: user,  port: 8081 }
      - { key: admin, port: 8082 }
  database:
    strategy: split
    dbs:
      - { key: user,  name: resortdb_user }
      - { key: admin, name: resortdb_admin }
```

```
projects/{projectId}/
├── frontend/
│   ├── user/
│   └── admin/
├── backend/
│   ├── user/                          # DB: ../data/resortdb_user.mv.db
│   └── admin/                         # DB: ../data/resortdb_admin.mv.db
├── data/
│   ├── resortdb_user.mv.db
│   └── resortdb_admin.mv.db
└── schema.md
```

- 드문 케이스. 두 서비스의 데이터가 **완전히 별개** 일 때.
- 엔티티는 `owned_by` 로 어느 DB 에 속하는지 명시.
- 크로스 DB 참조는 FK 불가 — API 호출로만 조회.

---

## 모듈 내부 구조

### frontend (모듈 앱 내부)

```
<frontend 앱 루트>/                     # projects/{id}/frontend/ 또는 projects/{id}/frontend/{moduleKey}/
├── src/
│   ├── components/
│   │   ├── layout/                    # 템플릿에 따라 다름
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx             # user 템플릿
│   │   │   ├── Footer.tsx             # user 템플릿
│   │   │   ├── Sidebar.tsx            # admin 템플릿
│   │   │   └── Topbar.tsx             # admin 템플릿
│   │   └── {기능명}/
│   │       ├── {기능명}Card.tsx       # user 리스트 아이템
│   │       ├── {기능명}Row.tsx        # admin 테이블 행
│   │       └── {기능명}Form.tsx
│   ├── pages/{기능명}/...
│   ├── hooks/use{기능명}.ts
│   ├── types/{기능명}.ts
│   ├── api/{기능명}Api.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── vite.config.ts                     # port = 모듈의 port, proxy /api → 대응 backend
```

### backend (모듈 앱 내부)

```
<backend 앱 루트>/                      # projects/{id}/backend/ 또는 projects/{id}/backend/{moduleKey}/
└── src/main/
    ├── java/com/harness/{projectIdCamel}[.{moduleKey}]/
    │   ├── {ProjectIdPascal}[{ModuleKeyPascal}]Application.java
    │   ├── domain/
    │   │   └── {기능명}/
    │   │       ├── entity/{기능명}.java
    │   │       ├── repository/{기능명}Repository.java
    │   │       ├── controller/{기능명}Controller.java
    │   │       ├── service/{기능명}Service.java
    │   │       └── dto/
    │   └── global/
    │       ├── common/
    │       │   ├── ApiResponse.java
    │       │   └── PageResponse.java
    │       └── config/
    │           ├── CorsConfig.java
    │           ├── SessionRoleFilter.java             # admin 모듈 또는 /api/admin/ path
    │           └── GlobalExceptionHandler.java
    └── resources/
        └── application.yml
```

### 패키지 네이밍

| 케이스 | 루트 패키지 |
|--------|-----------|
| Case 1 (단일) | `com.harness.{projectIdCamel}` |
| Case 2 (unified) | `com.harness.{projectIdCamel}` |
| Case 3/4 (split) — user | `com.harness.{projectIdCamel}.user` |
| Case 3/4 (split) — admin | `com.harness.{projectIdCamel}.admin` |

### Application 클래스 이름

| 케이스 | 파일명 |
|--------|-------|
| 단일 / unified | `{ProjectIdPascal}Application.java` |
| split — user | `{ProjectIdPascal}UserApplication.java` |
| split — admin | `{ProjectIdPascal}AdminApplication.java` |

예: `ResortReservationUserApplication`, `ResortReservationAdminApplication`

### controller 내 path 규칙

- user API 담당 컨트롤러: `@RequestMapping("/api/{리소스}")`
- admin API 담당 컨트롤러: `@RequestMapping("/api/admin/{리소스}")`

Case 2 (unified) 에서는 한 앱에 두 종류 컨트롤러가 공존 — 도메인 패키지 내에서 관례적으로 파일명 구분:
- `NoticeController.java` (user)
- `NoticeAdminController.java` (admin)

Case 3/4 (split) 에서는 각 앱이 자기 prefix 의 컨트롤러만 보유.

### 엔티티 중복 (Case 3: shared DB + split backend)

- 같은 테이블을 user/admin 백엔드가 **각자 Entity 클래스로 보유**
- 내용은 반드시 일치 (컬럼 매핑 동일)
- 한 YML 에서 두 복제본이 자동 생성됨
- admin 은 `ddl-auto: validate` 이므로 user 기동 후 스키마가 준비된 뒤 기동 가능
  (개발 편의상 둘 다 `update` 로 열어도 동작하지만 레이스 가능성 있음)

---

## DB 파일 위치 규칙

| 전략 | 경로 |
|------|------|
| shared | `projects/{id}/data/{database.name}.mv.db` |
| split | `projects/{id}/data/{database.dbs[].name}.mv.db` (앱 key 별 파일) |

각 backend 앱의 `application.yml` 에서 상대경로로 이 파일을 가리킨다:
- 단일 모드: `url: jdbc:h2:file:../data/{dbName};AUTO_SERVER=TRUE`
- 멀티 모드 (backend 가 `backend/{key}/` 에 있음): `url: jdbc:h2:file:../../data/{dbName};AUTO_SERVER=TRUE`

H2 `AUTO_SERVER=TRUE` 는 shared DB 에서 필수 (multi-process access).

---

## 프로젝트 격리 원칙

- 프로젝트별 폴더는 완전 독립
- 포트 / DB 이름: YML 에 명시, 다른 프로젝트와 충돌 금지
- 패키지: `com.harness.{projectIdCamel}[.{moduleKey}]`
- 프로젝트 통째 복사·삭제해도 다른 프로젝트에 영향 없음

---

## 레이아웃 템플릿 (2종)

- [harness/template-user.md](template-user.md) — 사용자용 (Header + Content + Footer)
- [harness/template-admin.md](template-admin.md) — 어드민용 (Sidebar + Topbar + Content)
- [harness/style-guide.md](style-guide.md) — 공통 디자인 토큰

> **UI 자료가 첨부된 경우** (`ui_source` / `spec-requests/{id}/assets/`): 해당 디자인을 우선하여 구현. 템플릿은 레이아웃 베이스만 제공.

---

## 네이밍 규칙

### 프론트엔드
| 대상 | 규칙 | 예시 |
|------|------|------|
| 페이지 | {기능명}{역할}Page.tsx | NoticeListPage.tsx |
| 컴포넌트 | {기능명}{역할}.tsx | NoticeCard.tsx (user) / NoticeRow.tsx (admin) |
| 훅 | use{기능명}.ts | useNotice.ts |
| API | {기능명}Api.ts | noticeApi.ts |
| 타입 | {기능명}.ts | Notice.ts |

### 백엔드
| 대상 | 규칙 | 예시 |
|------|------|------|
| Entity | {기능명}.java | Notice.java |
| Repository | {기능명}Repository.java | NoticeRepository.java |
| Controller (user) | {기능명}Controller.java | NoticeController.java |
| Controller (admin, unified) | {기능명}AdminController.java | NoticeAdminController.java |
| Service | {기능명}Service.java | NoticeService.java |
| DTO | {기능명}Request/Response.java | NoticeRequest.java |

### DB
| 대상 | 규칙 | 예시 |
|------|------|------|
| 테이블명 | snake_case (@Table) | notice |
| 컬럼명 | snake_case (@Column) | created_at |
| PK | {테이블}_id | notice_id |
