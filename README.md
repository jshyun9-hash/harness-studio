# Harness Studio — 하네스 기반 풀스택 생성 프로젝트

고객 요구사항을 받아 **하네스 규칙에 맞는 풀스택 코드** 를 일관된 품질로 생성하는 예제 프로젝트.

요구사항 원문(`spec-requests/`) → **브레인스토밍(Claude + 사용자)** → YML 명세(`specs/`) → 코드 생성(`projects/`).

**하나의 워크스페이스에서 여러 프로젝트를 동시에 관리**할 수 있다 (프로젝트마다 포트/DB 격리).

---

## 전체 흐름

```
1. FDE 가 현업 담당자에게 요구사항 수집
2. spec-requests/{projectId}/ 에 요구사항 원문 작성 (MD) + 디자인 자료(assets/) 첨부 (선택)
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
├── harness/                       # 하네스 규칙 (공용)
│   ├── spec-format.md             #   YML 명세 포맷 (modules / strategy / role)
│   ├── stack.md                   #   기술 스택 및 의존성
│   ├── structure.md               #   4가지 케이스별 폴더 구조
│   ├── architecture.md            #   레이어 경계, API 표준, role 체크
│   ├── coding.md                  #   코딩 컨벤션
│   ├── style-guide.md             #   공통 디자인 토큰
│   ├── template-user.md           #   사용자용 템플릿 (Header + Footer)
│   ├── template-admin.md          #   어드민용 템플릿 (Sidebar + Topbar)
│   ├── ux.md                      #   UX 패턴
│   ├── naming.md                  #   테이블/컬럼 명명 규칙
│   └── schema.md                  #   프로젝트별 schema.md 기록 규칙
│
├── skills/                        # 스킬 (생성/관리 레시피)
│   ├── discovery.md               #   요구사항 브레인스토밍 → YML 확정 (필수 선행)
│   ├── precheck.md                #   사전 환경 체크
│   ├── init-backend.md            #   백엔드 초기 셋팅 (strategy 분기)
│   ├── init-frontend.md           #   프론트엔드 초기 셋팅 (template 분기)
│   ├── crud-page.md               #   기능별 CRUD 풀스택 생성
│   ├── regenerate.md              #   완전 재생성
│   ├── update-incremental.md      #   증분 수정
│   ├── build-log.md               #   빌드 로그 생성
│   ├── lessons-learned.md         #   이전 셋팅 경험 기록
│   └── reset-project.md           #   프로젝트 단위 초기화
│
├── spec-requests/                 # 요구사항 원문 (FDE 수집)
│   └── {projectId}/
│       ├── {projectId}.v1.md
│       └── assets/                #   디자인/HTML/스크린샷 (선택)
│
├── specs/                         # 구조화된 기능 명세 (YML, source of truth)
│   └── {projectId}/
│       ├── {projectId}.v1.yml
│       └── log.md                 #   현재 최신 버전 + changelog
│
├── projects/                      # 생성된 실제 코드 (재생성 시 초기화)
│   └── {projectId}/               #   4가지 케이스 중 하나의 폴더 구조
│
├── log/                           # 빌드 로그 (보존)
│   └── {YYYY-MM-DD}_{projectId}_v{n}.md
│
├── CLAUDE.md                      # 프로젝트 설정 및 자동 실행 규칙
└── README.md
```

---

## 사용 방법

### 1. 요구사항 작성

FDE 가 수집한 요구사항을 `spec-requests/{projectId}/{projectId}.v1.md` 에 작성.
디자인 자료가 있으면 `spec-requests/{projectId}/assets/` 에 첨부.

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

## 기술 스택

| 구분 | 스택 |
|------|------|
| 프론트엔드 | React 19 + TypeScript + Tailwind CSS + Vite |
| 백엔드 | Spring Boot 3 + Java 17 + JPA (Hibernate) |
| DB | H2 (파일 모드, 프로젝트별 data/ 격리, 필요 시 앱 간 AUTO_SERVER 공유) |

---

## 예시 프로젝트

- [resort-reservation](specs/resort-reservation/) — 리조트 객실 예약 시스템 (v1, Case 1: 단일 user 모듈, 2026-04-16)
