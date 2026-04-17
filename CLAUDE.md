# Harness Studio 프로젝트

## 개요
하네스 엔지니어링 기반으로 **사용자용 / 관리자용 / 사용자+관리자 혼합 웹사이트** 를 일관된 품질로 생성하는 프로젝트.

요구사항 원문(`spec-requests/`) → **브레인스토밍(discovery)** → YML 명세(`specs/`) → 코드 생성(`projects/`).

**하나의 워크스페이스에서 여러 프로젝트를 동시에 관리한다** (포트 / DB 격리).

## 폴더 구조

```
harness-studio/
├── harness/                       # 하네스 규칙 (공용)
├── skills/                        # 스킬 레시피 (공용, discovery 포함)
├── spec-requests/                 # 요구사항 원문 + 첨부 자료 (FDE 수집)
│   └── {projectId}/
│       ├── {projectId}.v1.md
│       ├── {projectId}.v2.md
│       └── assets/                # 디자인/HTML/스크린샷 (선택)
├── specs/                         # YML 명세 (source of truth)
│   └── {projectId}/
│       ├── {projectId}.v1.yml
│       ├── {projectId}.v2.yml
│       └── log.md                 # 현재 최신 버전 + changelog
├── projects/                      # 생성된 코드 (재생성 시 초기화)
│   └── {projectId}/               # 4가지 구조 케이스 중 하나 (harness/structure.md)
└── log/                           # 빌드 로그 (보존)
    └── {YYYY-MM-DD}_{projectId}_v{n}.md
```

## 핵심 원칙

- **YML = Source of Truth**. 코드는 YML 에서 파생된 결과물. 수동 수정 금지.
- **브레인스토밍 선행**. 요구사항 원문과 사용자 대화로 모듈/전략/UI 소스 확정 → YML.
- **프로젝트마다 포트·DB 이름이 다름**. 각 YML 에 명시, 생성 시 다른 프로젝트 YML 스캔으로 충돌 방지.
- **버전 관리**: `spec-requests/{id}/{id}.v{n}.md`, `specs/{id}/{id}.v{n}.yml` 로 파일 자체에 버전.
  `specs/{id}/log.md` 가 현재 최신 버전을 가리킨다.

## 4가지 프로젝트 구조 케이스

브레인스토밍 결과로 아래 중 하나가 확정된다. 상세: [harness/structure.md](harness/structure.md)

| 케이스 | frontend | backend | database |
|--------|---------|---------|----------|
| **Case 1** | user 1개 | 단일 | 단일 |
| **Case 2** | user + admin | unified (단일 앱) | 공유 |
| **Case 3** | user + admin | split (2 앱) | shared (1 파일 공유) |
| **Case 4** | user + admin | split | split (2 파일) |

## 기술 스택
- 프론트엔드: React 19 + TypeScript + Tailwind CSS + Vite
- 백엔드: Spring Boot 3 + Java 17 + JPA (Hibernate)
- DB: H2 (파일 모드, 프로젝트별 data/ 격리)
- 빌드: Gradle Kotlin DSL (backend), npm (frontend)

## 하네스 규칙 (공용, 반드시 준수)
- [harness/spec-format.md](harness/spec-format.md) — YML 명세 포맷 정의 (modules / strategy / role 포함)
- [harness/stack.md](harness/stack.md) — 기술 스택 및 의존성
- [harness/structure.md](harness/structure.md) — 4가지 케이스별 폴더 구조
- [harness/coding.md](harness/coding.md) — 코딩 컨벤션
- [harness/architecture.md](harness/architecture.md) — 레이어 경계, API 표준, role 체크
- [harness/style-guide.md](harness/style-guide.md) — 공통 디자인 토큰
- [harness/template-user.md](harness/template-user.md) — 사용자용 템플릿 (Header + Footer)
- [harness/template-admin.md](harness/template-admin.md) — 어드민용 템플릿 (Sidebar + Topbar)
- [harness/ux.md](harness/ux.md) — UX 패턴 (로딩/빈상태/에러/반응형)
- [harness/naming.md](harness/naming.md) — 테이블/컬럼 명명 규칙
- [harness/schema.md](harness/schema.md) — 프로젝트별 schema.md 기록 규칙
- [harness/files.md](harness/files.md) — 파일 업로드 공통 규칙 (StoredFile 자동 주입)
- [harness/common-code.md](harness/common-code.md) — 공통 코드 규칙 (CodeGroup / CodeItem 자동 주입)

## 스킬 (생성·관리 레시피)
- [skills/discovery.md](skills/discovery.md) — **요구사항 브레인스토밍 → YML 확정 (필수 선행)**
- [skills/precheck.md](skills/precheck.md) — 사전 환경 체크
- [skills/init-backend.md](skills/init-backend.md) — 백엔드 초기 셋팅 (strategy 분기)
- [skills/init-frontend.md](skills/init-frontend.md) — 프론트엔드 초기 셋팅 (template 분기)
- [skills/crud-page.md](skills/crud-page.md) — 기능별 CRUD 풀스택 생성
- [skills/regenerate.md](skills/regenerate.md) — 완전 재생성 (옵션 1)
- [skills/update-incremental.md](skills/update-incremental.md) — 증분 수정 (옵션 2)
- [skills/reset-project.md](skills/reset-project.md) — 프로젝트 초기화
- [skills/lessons-learned.md](skills/lessons-learned.md) — 이전 셋팅 경험 기록
- [skills/build-log.md](skills/build-log.md) — 빌드 로그 생성 (필수 후행)

---

## 사용자 입력 처리 규칙

### 명세 기반 생성/업데이트 자동 흐름

사용자가 **"만들어줘" / "업데이트해줘" / "재생성해줘"** 등을 요청하면:

```
[Step 0] projectId 식별
  - 사용자가 지정했거나 spec 파일명에서 식별 가능하면 그 값 사용
  - 없으면 새 projectId 부여 (spec 제목에서 kebab-case 로 추출)

[Step 0.5] 명세(YML) 존재 확인
  - specs/{id}/{id}.v{n}.yml 이 있음 → Step 1 로
  - 없음 (spec-requests 만 있음) → skills/discovery.md 실행 → 최종 YML 생성 후 Step 1 로

[Step 1] projects/{projectId}/ 존재 여부로 분기

  ┌─ 없음 → 묻지 않고 "신규 생성 흐름" 진행
  │
  └─ 있음 → 사용자에게 선택지 제시:

            기존 projects/{projectId}/ 를 감지했습니다.
            현재 최신: v{N}  →  v{N+1} 업데이트 요청으로 판단됩니다.

            [1] 완전 재생성
                - projects/{id}/ 전체 삭제 후 v{N+1} yml 로 처음부터 재생성
                - 장점: YML 과 100% 일치 보장
                - 단점: 오래 걸림, DB 데이터 초기화 (seed_data 만 복원)

            [2] 증분 수정
                - 기존 v{N} 과 비교하여 변경점만 코드 수정
                - 장점: 빠름, DB 데이터 보존
                - 단점: 복잡한 변경(필드 삭제/타입 변경/모듈 추가)은 불완전할 수 있음

            번호를 선택해주세요 (1 / 2):

            → 1 선택: skills/regenerate.md 실행
            → 2 선택: skills/update-incremental.md 실행
```

### 명세 확정 흐름 (discovery)

명세가 아직 없으면 **반드시 먼저** skills/discovery.md 로 진행:

```
1. spec-requests/{id}/{id}.v{n}.md + assets/ 읽기
2. 자동 판단:
   - 모듈 구성 (user only / user+admin / admin only)
   - UI 자료 첨부 여부 (assets 확인)
3. 애매한 부분 사용자에게 질문 (배치 질문):
   - 멀티 모듈이면 백엔드 전략 (unified / split)
   - split 이면 DB 전략 (shared / split)
   - UI 자료가 다른 프레임워크면 Tailwind 변환 동의 여부
4. 확정된 내용으로 specs/{id}/{id}.v{n}.yml 생성
5. spec-requests/{id}/{id}.v{n}.md 말미에 "브레인스토밍 결정 사항" 섹션 추가
6. specs/{id}/log.md 생성/업데이트
```

### 신규 생성 흐름

YML 확정 후:

```
1. skills/precheck.md (환경 체크, 이미 통과했으면 스킵)
2. YML 의 project.modules 해석 → 생성할 frontend/backend 앱 목록 확정
3. 각 backend 앱마다 → skills/init-backend.md (strategy 분기)
4. 각 frontend 앱마다 → skills/init-frontend.md (template 분기)
5. skills/crud-page.md 실행 (엔티티/API/페이지 생성, module 별 배치)
6. 검증:
   - 각 backend: ./gradlew build
   - 각 frontend: npx tsc -b && npx vite build
   - 실패 시 수정 + 반복 가능한 문제는 하네스/lessons-learned 에 피드백
7. projects/{id}/schema.md 업데이트
8. 완료 보고 (실행 방법: 각 앱의 포트 / 접속 URL 안내)
9. skills/build-log.md 실행 (log/{date}_{id}_v1.md 기록, "생성 방식: 신규 생성" 명시)
```

### 주의사항
- 초기 셋팅 시 **하네스 규칙 파일을 먼저 읽고** 파악한 후 생성
- **레이아웃 컴포넌트는 template 에 따라 빠짐없이 생성** — user(Header/Footer) / admin(Sidebar/Topbar)
- 백엔드 공통 클래스(ApiResponse, PageResponse, CorsConfig, GlobalExceptionHandler) 를 **먼저 생성**
- admin 모듈 있으면 `SessionRoleFilter` 생성
- 생성된 모든 파일은 **harness/ 규칙 준수**
- **모바일 반응형** 항상 고려 (user: 햄버거, admin: Sidebar drawer)
- **생성된 코드를 수동 수정 금지** — 필요하면 YML 또는 하네스 규칙을 수정하고 재생성
- `ui_source` 가 지정된 페이지는 해당 자료를 우선 구현

### "초기화 해줘" / "리셋 해줘" 요청 시
- skills/reset-project.md 실행
- 분기:
  - **projectId 명시** (예: "resort-reservation 초기화 해줘") → 해당 프로젝트만 삭제
  - **projectId 미지정** (예: "초기화 해줘") → `projects/` 아래 **전체** 프로젝트 삭제
- 공통 보존 대상: harness/, skills/, spec-requests/, specs/, log/, CLAUDE.md, README.md
- 삭제 전 사용자 확인 필수
  - 단일: `yes / no`
  - 전체: `reset all` 리터럴 확인 (오조작 방지)

### 명세 없이 "프론트/백 셋팅만 해줘" 요청 시
- projectId 필요. 없으면 물어봄.
- modules 구성이 없으면 단일 user 모듈로 해석 → 각각 skills/init-frontend.md, skills/init-backend.md 실행
- 기능은 빈 상태로 유지
