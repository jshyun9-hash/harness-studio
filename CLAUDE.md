# Harness Example 프로젝트

## 개요
하네스 엔지니어링 기반으로 일관된 품질의 **사용자용 웹사이트**를 생성하는 프로젝트.
YML 명세를 입력하면, 하네스 규칙에 따라 백엔드 → 프론트엔드 코드를 생성한다.

**하나의 example/ 안에서 여러 프로젝트를 동시에 관리할 수 있다.**
각 프로젝트는 `projects/{projectId}/` 하위에 독립 격리된다 (포트 / DB 모두 분리).

> studio(어드민)와 다른 점: 사이드바 레이아웃이 아닌 **Header + Content + Footer** 반응형 레이아웃.

## 폴더 구조

```
example/
├── harness/                       # 하네스 규칙 (공용)
├── skills/                        # 스킬 레시피 (공용)
├── spec-requests/                 # 요구사항 원문 (FDE 수집)
│   └── {projectId}/
│       ├── {projectId}.v1.md
│       └── {projectId}.v2.md
├── specs/                         # YML 명세 (source of truth)
│   └── {projectId}/
│       ├── {projectId}.v1.yml
│       ├── {projectId}.v2.yml
│       └── log.md                 # 현재 최신 버전 + changelog
├── projects/                      # 생성된 코드 (재생성 시 초기화)
│   └── {projectId}/
│       ├── backend/
│       ├── frontend/
│       ├── data/                  # H2 파일 DB
│       └── schema.md              # 이 프로젝트의 DB 스키마
└── log/                           # 빌드 로그 (보존)
    └── {YYYY-MM-DD}_{projectId}_v{n}.md
```

## 핵심 원칙

- **YML = Source of Truth**. 코드는 YML에서 파생된 결과물. 수동 수정 금지.
- **프로젝트마다 포트·DB 이름 다름**. 각 YML에 명시, 생성 시 다른 프로젝트 YML 스캔으로 충돌 방지.
- **버전 관리**: `spec-requests/{id}/{id}.v{n}.md`, `specs/{id}/{id}.v{n}.yml` 로 파일 자체에 버전.
  `specs/{id}/log.md` 가 현재 최신 버전을 가리킨다.

## 기술 스택
- 프론트엔드: React 19 + TypeScript + Tailwind CSS + Vite
- 백엔드: Spring Boot 3 + Java 17 + JPA (Hibernate)
- DB: H2 (파일 모드, 프로젝트별 data/ 안에 격리)
- 빌드: Gradle (backend), npm (frontend)

## 하네스 규칙 (공용, 반드시 준수)
- harness/spec-format.md — YML 명세 포맷 정의
- harness/stack.md — 기술 스택 및 의존성
- harness/structure.md — 프론트/백엔드 폴더 구조
- harness/coding.md — 코딩 컨벤션
- harness/architecture.md — 레이어 경계, API 표준
- harness/style-guide.md — 스타일 가이드 (사용자용 클린 테마)
- harness/ux.md — UX 패턴 (로딩, 빈상태, 에러, 반응형)
- harness/naming.md — 테이블/컬럼 명명 규칙
- harness/schema.md — 프로젝트별 schema.md 기록 규칙 / 템플릿

## 스킬 (생성·관리 레시피)
- skills/precheck.md — 사전 환경 체크 (필수 선행)
- skills/init-backend.md — 백엔드 초기 셋팅
- skills/init-frontend.md — 프론트엔드 초기 셋팅
- skills/crud-page.md — 기능별 CRUD 풀스택 생성
- skills/regenerate.md — **완전 재생성** (옵션 1)
- skills/update-incremental.md — **증분 수정** (옵션 2)
- skills/reset-project.md — 프로젝트 초기화
- skills/lessons-learned.md — 이전 셋팅 경험 기록 (반드시 먼저 읽을 것)
- skills/build-log.md — 빌드 로그 생성 (필수 후행)

---

## 사용자 입력 처리 규칙

### 명세 기반 생성/업데이트 자동 흐름

사용자가 **"만들어줘" / "업데이트해줘" / "재생성해줘"** 등을 요청하면:

```
[Step 0] projectId 식별
  - 사용자가 지정했거나 spec 파일명에서 식별 가능하면 그 값 사용
  - 없으면 새 projectId 부여 (spec 제목에서 kebab-case로 추출)

[Step 1] projects/{projectId}/ 존재 여부로 분기

  ┌─ 없음 → 묻지 않고 "신규 생성 흐름" 진행
  │
  └─ 있음 → 사용자에게 선택지 제시:
            
            기존 projects/{projectId}/ 를 감지했습니다.
            현재 최신: v{N}  →  v{N+1}로 업데이트 요청으로 판단됩니다.
            
            [1] 완전 재생성
                - projects/{id}/ 전체 삭제 후 v{N+1} yml로 처음부터 재생성
                - 장점: YML과 100% 일치 보장
                - 단점: 오래 걸림, DB 데이터 초기화 (seed_data만 복원)
            
            [2] 증분 수정
                - 기존 v{N}과 비교하여 변경점만 코드 수정
                - 장점: 빠름, DB 데이터 보존
                - 단점: 복잡한 변경(필드 삭제/타입 변경)은 불완전할 수 있음
            
            번호를 선택해주세요 (1 / 2):
            
            → 1 선택: skills/regenerate.md 실행
            → 2 선택: skills/update-incremental.md 실행
```

### 신규 생성 흐름

```
1. skills/precheck.md (사전 환경 체크, 이미 통과했으면 스킵 가능)
2. spec-requests/{id}/{id}.v1.md 작성 (원문 그대로)
3. specs/{id}/{id}.v1.yml 생성 (harness/spec-format.md 기준)
   - project.id, project.version: 1, project.ports, project.database 명시
   - 포트/DB 이름은 projects/ 다른 프로젝트 YML 스캔 후 미사용 값으로 할당
4. specs/{id}/log.md 생성 (v1 changelog + "생성 방식: 신규 생성")
5. projects/{id}/backend/ 생성 → skills/init-backend.md
6. projects/{id}/frontend/ 생성 → skills/init-frontend.md
7. skills/crud-page.md 실행 (기능별 CRUD)
8. 검증 (backend ./gradlew build, frontend npx tsc -b && npx vite build)
   - 실패 시 수정 + 반복 가능한 문제는 하네스/lessons-learned에 피드백
9. projects/{id}/schema.md 업데이트
10. 완료 보고 (실행 방법 안내: 포트/DB는 해당 프로젝트 YML 참조)
11. skills/build-log.md 실행 (log/{date}_{id}_v1.md 기록, "생성 방식: 신규 생성" 명시)
```

### 주의사항
- 초기 셋팅 시 **하네스 규칙 파일을 먼저 읽고** 파악한 후 생성
- 프론트 레이아웃 컴포넌트(Header, Footer)는 **빠짐없이 생성**
- 백엔드 공통 클래스(ApiResponse, PageResponse)를 **먼저 생성**
- 생성된 모든 파일은 **harness/ 규칙 준수**
- **모바일 반응형** 항상 고려
- **생성된 코드를 수동 수정 금지** — 필요하면 YML 또는 하네스 규칙을 수정하고 재생성

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
- 각각 skills/init-frontend.md, skills/init-backend.md 실행
- 기능은 빈 상태로 유지
