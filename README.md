# Harness Studio — 하네스 기반 풀스택 생성 프로젝트

고객 요구사항을 받아 **하네스 규칙에 맞는 풀스택 코드** 를 일관된 품질로 생성하는 예제 프로젝트.

요구사항 원문(`spec-requests/`) → **브레인스토밍(Claude + 사용자)** → YML 명세(`specs/`) → 코드 생성(`projects/`).

**하나의 워크스페이스에서 여러 프로젝트를 동시에 관리**할 수 있다 (프로젝트마다 포트/DB 격리).

---

## 전체 흐름

```
1. FDE 가 현업 담당자에게 요구사항 수집
2. spec-requests/{projectId}/ 에 요구사항 원문 작성 (MD) + 디자인 자료 첨부 (PDF/HTML/스크린샷, 선택)
3. skills/discovery.md — Claude 와 브레인스토밍
   - 모듈 구성 (user only / user+admin / admin only)
   - 멀티 모듈이면 백엔드 전략 (unified / split)
   - split 백엔드면 DB 전략 (shared / split)
   - UI 소스 (자료 / 템플릿 자동)
4. specs/{projectId}/{projectId}.v1.yml 생성 (구조화 명세)
5. 코드 자동 생성: backend(단일/멀티) + frontend(단일/멀티), module 별 배치
6. 빌드·검증 → log/{date}_{projectId}_v{n}.md 에 빌드 로그 기록
```

## 핵심 원칙

- **YML = Source of Truth**. 코드는 YML 에서 파생. 수동 수정 금지.
- **Discovery 선행**. 요구사항 원문 + 자료 + 사용자 대화로 전략 확정 → YML.
- **프로젝트마다 포트·DB 격리**. 각 YML 에 명시.
- **버전 관리**: `{name}.v{n}.{md|yml}` 파일에 버전. `log.md` 가 최신을 가리킴.
- **생성된 코드는 버전관리 제외** (`projects/` → `.gitignore`). 재생성 가능한 산출물이므로 소스는 YML + 하네스가 유일.

---

## 4가지 프로젝트 구조 케이스

Discovery 단계에서 확정. 상세: [harness/structure.md](harness/structure.md)

| 케이스 | frontend | backend | database | 언제 |
|--------|---------|---------|----------|------|
| **Case 1** | user 하나 | 단일 앱 | 단일 | 단순 사용자 사이트 |
| **Case 2** | user + admin | unified (단일 앱, path 분리) | 공유 | 운영자 기능이 작을 때 |
| **Case 3** | user + admin | split (2 앱 분리) | shared (공유 DB) | **실무 표준** |
| **Case 4** | user + admin | split | split (독립 DB) | 데이터가 완전 별개 |

---

## 디렉토리 구조

```
harness-studio/
├── harness/                       # 하네스 규칙 (공용, 버전관리)
│   ├── spec-format.md             #   YML 명세 포맷 (modules / strategy / role)
│   ├── stack.md                   #   기술 스택 및 의존성
│   ├── structure.md               #   4가지 케이스별 폴더 구조
│   ├── architecture.md            #   레이어 경계, API 표준, role 체크
│   ├── coding.md                  #   코딩 컨벤션 (엔티티 @Lob 규칙 포함)
│   ├── style-guide.md             #   공통 디자인 토큰
│   ├── template-user.md           #   사용자용 템플릿 (Header + Footer)
│   ├── template-admin.md          #   어드민용 템플릿 (Sidebar + Topbar, 공통 컴포넌트 세트 규정)
│   ├── ux.md                      #   UX 패턴
│   ├── naming.md                  #   테이블/컬럼 명명 규칙
│   ├── schema.md                  #   프로젝트별 schema.md 기록 규칙
│   ├── files.md                   #   파일 업로드 공통 (StoredFile 자동 주입)
│   └── common-code.md             #   공통 코드 공통 (CodeGroup / CodeItem 자동 주입)
│
├── skills/                        # 스킬 (생성/관리 레시피, 버전관리)
│   ├── discovery.md               #   요구사항 브레인스토밍 → YML 확정 (필수 선행)
│   ├── precheck.md                #   사전 환경 체크 (Java/Node 버전)
│   ├── init-backend.md            #   백엔드 초기 셋팅 (strategy 분기)
│   ├── init-frontend.md           #   프론트엔드 초기 셋팅 (template 분기)
│   ├── crud-page.md               #   기능별 CRUD 풀스택 생성
│   ├── regenerate.md              #   완전 재생성 (옵션 1)
│   ├── update-incremental.md      #   증분 수정 (옵션 2)
│   ├── reset-project.md           #   프로젝트 단위 초기화
│   ├── lessons-learned.md         #   이전 셋팅 경험 (하네스 개선의 씨앗)
│   └── build-log.md               #   빌드 로그 생성 (시간/토큰 측정 룰 포함)
│
├── spec-requests/                 # 요구사항 원문 (FDE 수집, 버전관리)
│   └── {projectId}/
│       ├── {projectId}.v1.md
│       ├── {projectId}.v2.md      #   증분 / 재생성 시 새 버전 추가
│       └── assets/                #   디자인/HTML/스크린샷/PDF (선택)
│
├── specs/                         # 구조화 기능 명세 (YML, source of truth, 버전관리)
│   └── {projectId}/
│       ├── {projectId}.v1.yml
│       ├── {projectId}.v2.yml
│       └── log.md                 #   현재 최신 버전 + changelog + 재생성 진행 상태 (세션 인계)
│
├── projects/                      # 생성된 실제 코드 (.gitignore — 재생성 산출물)
│   └── {projectId}/               #   4가지 케이스 중 하나의 폴더 구조
│
├── log/                           # 빌드 로그 (보존, 버전관리)
│   └── {YYYY-MM-DD}_{projectId}_v{n}.md
│
├── CLAUDE.md                      # 프로젝트 설정 및 자동 실행 규칙 (Claude 진입점)
└── README.md
```

---

## 사용 방법

### 1. 요구사항 작성

FDE 가 수집한 요구사항을 `spec-requests/{projectId}/{projectId}.v1.md` 에 작성.
디자인 자료가 있으면 `spec-requests/{projectId}/assets/` (또는 같은 폴더 내) 에 첨부.

### 2. Discovery (브레인스토밍)

Claude 에게 "명세 만들자" 혹은 "yml 뽑아줘" 요청.
[skills/discovery.md](skills/discovery.md) 가 실행되어:

1. 원문 / 자료 / 키워드 자동 분석
2. 모듈 / 백엔드 / DB / UI 전략 초안 제시
3. 사용자 확인을 받아 확정
4. `specs/{projectId}/{projectId}.v1.yml` 생성

### 3. 코드 생성

YML 확정 후 "만들어줘" 요청 시 자동 진행:

```
환경 체크 → modules 해석 → 각 backend 셋팅 → 각 frontend 셋팅 →
CRUD 구현(module 별 배치) → 빌드 검증 → 스키마·로그 업데이트
```

### 4. 업데이트 / 재생성

동일 프로젝트에 기능 추가/수정 시:

1. Discovery 다시 실행하거나 직접 `specs/{projectId}/{projectId}.v{N+1}.yml` 작성
2. Claude 에게 요청 → 이미 존재하는 프로젝트 감지 시:

```
[1] 완전 재생성  —  projects/{id}/ 전체 삭제 후 v{N+1} 로 재생성
[2] 증분 수정    —  v{N} 과 diff 계산해서 변경된 부분만 수정
```

---

## 큰 프로젝트의 세션 분할 (실무 패턴)

요구사항이 크면 한 세션에 생성이 끝나지 않는다 (FE user + FE admin + BE 2개 = 300+ 파일, 1M 컨텍스트도 초과 가능). 이때 **섹션 단위로 세션을 분할** 한다:

```
세션 1: BE 초기 셋팅 (엔티티/Repository/공통 global/File/Code 모듈) → compileJava 통과
세션 2: BE 도메인 API 완성 + Seed → build -x test BUILD SUCCESSFUL
세션 3: FE user (template=custom 또는 user)                → tsc -b + vite build 통과
세션 4: FE admin (공통 컴포넌트 세트 + 페이지 N개)          → tsc -b + vite build 통과
세션 5: schema.md + build log + 4개 서버 기동 스모크 테스트
```

세션 간 상태 인계는 `specs/{projectId}/log.md` 의 **"재생성 진행 상태"** 섹션에 기록:

- 완료된 섹션 체크리스트 (실제 생성된 파일·검증 결과)
- **"다음 세션 이어서 (`projectId v2 재생성 섹션 N 이어서`)"** 앵커 + 남은 할 일

새 세션에서 위 트리거 문구를 그대로 쓰면 Claude 가 log.md 를 읽고 이어서 진행한다.

실제 예시: [specs/prototype/log.md](specs/prototype/log.md) 의 "재생성 진행 상태" 및 [log/2026-04-19_prototype_v2.md](log/2026-04-19_prototype_v2.md) 빌드 로그.

---

## 생성된 프로젝트 실행

생성이 끝나면 각 앱을 별도 터미널에서 기동 (Case 3 기준 4개):

```bash
# BE user (port 8082, shared DB owner)
cd projects/{projectId}/backend/user && ./gradlew bootRun

# BE admin (port 8083, ddl-auto=validate — user BE 가 스키마 생성 후 기동)
cd projects/{projectId}/backend/admin && ./gradlew bootRun

# FE user (port 5177)
cd projects/{projectId}/frontend/user && npm install && npm run dev

# FE admin (port 5178)
cd projects/{projectId}/frontend/admin && npm install && npm run dev
```

접속:

- 사용자 화면: `http://localhost:5177/`
- 관리자: `http://localhost:5178/login` (seed 계정: `admin / admin123` — YML 의 `seed_data.Member` 로 주입)
- H2 콘솔 (디버깅): `http://localhost:{user BE port}/h2-console`

**포트는 프로젝트마다 다르다.** 각 YML 의 `modules.frontend[].port`, `modules.backend.apps[].port` 참조.

---

## 기술 스택

| 구분 | 스택 |
|------|------|
| 프론트엔드 | React 19 + TypeScript + Tailwind CSS v4 + Vite 7 (dev) |
| 백엔드 | Spring Boot 3.5 + **Java 17+** + JPA (Hibernate) + Gradle Kotlin DSL |
| DB | H2 (파일 모드, 프로젝트별 `data/` 격리, 필요 시 앱 간 `AUTO_SERVER=TRUE` 공유) |
| 인증 | 세션 기반 (HttpSession, BCrypt 비밀번호 해시) |

> **JDK 정책**: Spring Boot 3.x 는 Java 17 이 최저 요구사항. [skills/precheck.md](skills/precheck.md) 가
> `java --version` 으로 이를 검증한다. `build.gradle.kts` 의 `toolchain` 은 **생성 시점의 로컬 JDK
> 버전(17 또는 21)에 맞춰 동적 설정** 되므로 17/21 양쪽 모두 그대로 빌드된다
> ([skills/lessons-learned.md](skills/lessons-learned.md) #12 — toolchain 불일치 회피).

---

## 예시 프로젝트

| projectId | 버전 | 케이스 | 설명 |
|-----------|------|--------|------|
| [resort-reservation](specs/resort-reservation/) | v1 (2026-04-16) | Case 1 | 리조트 객실 예약 시스템 — 단일 user 모듈 |
| [prototype](specs/prototype/) | **v2 (2026-04-19 재생성 완료)** | **Case 3** | Moyza 모바일 OTT/드라마 탐색 앱 — split BE + shared DB + 관리자 페이지. HTML 프로토타입 (`ui_source=prototype_claude.html`) 포팅 + 관리자 공통 컴포넌트 세트. 전량 재생성 사이클이 v2 기준으로 끝까지 검증된 레퍼런스 프로젝트 |

---

## Claude 에게 요청할 때

자주 쓰는 트리거 문구 (전체 목록은 [CLAUDE.md](CLAUDE.md) 참조):

| 문구 | 동작 |
|------|------|
| "{projectId} 명세 만들어줘" / "yml 뽑아줘" | discovery 실행 → YML 생성 |
| "{projectId} 만들어줘" (YML 있음) | 신규 생성 또는 [1/2] 선택지 제시 |
| "섹션 N 이어서" / "다음 섹션 진행" | 세션 분할 시 log.md 읽고 이어서 |
| "{projectId} 초기화 해줘" | 해당 프로젝트만 삭제 (`projects/{id}/`) |
| "초기화 해줘" (미지정) | `reset all` 확인 후 `projects/` 전체 삭제 |
