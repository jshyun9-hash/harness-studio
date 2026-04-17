# Example — 하네스 기반 풀스택 생성 프로젝트

고객 요구사항을 받아 **하네스 규칙에 맞는 풀스택 코드**를 일관된 품질로 생성하는 예제 프로젝트.

**하나의 example/ 안에서 여러 프로젝트를 동시에 관리**할 수 있다 (프로젝트마다 포트/DB 격리).

---

## 전체 흐름

```
1. FDE가 현업 담당자에게 요구사항 수집
2. spec-requests/{projectId}/ 에 요구사항 원문 작성 (MD, 버전별)
3. Claude와 대화하며 specs/{projectId}/ 에 구조화된 명세 생성 (YML, 버전별)
4. YML 명세 기반으로 projects/{projectId}/ 에 백엔드 → 프론트엔드 코드 자동 생성
5. 빌드·검증 완료 후 log/{date}_{projectId}_v{n}.md 에 빌드 로그 기록
```

## 핵심 원칙

- **YML = Source of Truth**. 코드는 YML에서 파생된 결과물. 수동 수정 금지.
- **프로젝트마다 포트·DB 이름이 다름**. 각 YML에 명시, 충돌 시 생성기가 자동 할당.
- **버전 관리**: `{name}.v{n}.yml` 로 파일 자체에 버전 접미사, `log.md` 가 현재 최신 버전 가리킴.

---

## 디렉토리 구조

```
example/
├── harness/                       # 하네스 규칙 (공용)
│   ├── stack.md                   #   기술 스택 및 의존성
│   ├── structure.md               #   프론트/백엔드 폴더 구조
│   ├── architecture.md            #   아키텍처 규칙, 레이어 경계
│   ├── coding.md                  #   코딩 컨벤션
│   ├── style-guide.md             #   스타일 가이드
│   ├── naming.md                  #   테이블/컬럼 명명 규칙
│   ├── schema.md                  #   프로젝트별 schema.md 기록 규칙
│   ├── spec-format.md             #   YML 명세 포맷 정의
│   └── ux.md                      #   UX 패턴 (로딩, 빈상태, 에러, 반응형)
│
├── skills/                        # 스킬 (생성/관리 레시피, 공용)
│   ├── precheck.md                #   사전 환경 체크
│   ├── init-backend.md            #   백엔드 초기 셋팅
│   ├── init-frontend.md           #   프론트엔드 초기 셋팅
│   ├── crud-page.md               #   기능별 CRUD 풀스택 생성
│   ├── regenerate.md              #   완전 재생성 (옵션 1)
│   ├── update-incremental.md      #   증분 수정 (옵션 2)
│   ├── build-log.md               #   빌드 로그 생성
│   ├── lessons-learned.md         #   이전 셋팅 경험 기록
│   └── reset-project.md           #   프로젝트 단위 초기화
│
├── spec-requests/                 # 요구사항 원문 (FDE 수집)
│   └── {projectId}/
│       ├── {projectId}.v1.md
│       └── {projectId}.v2.md
│
├── specs/                         # 구조화된 기능 명세 (YML, source of truth)
│   └── {projectId}/
│       ├── {projectId}.v1.yml
│       ├── {projectId}.v2.yml
│       └── log.md                 # 현재 최신 버전 + changelog
│
├── projects/                      # 생성된 실제 코드 (재생성 시 초기화됨)
│   └── {projectId}/
│       ├── backend/               # Spring Boot
│       ├── frontend/              # React + Vite
│       ├── data/                  # H2 파일 DB (프로젝트별)
│       └── schema.md              # 이 프로젝트의 DB 스키마
│
├── log/                           # 빌드 로그 (보존)
│   └── {YYYY-MM-DD}_{projectId}_v{n}.md
│
└── CLAUDE.md                      # 프로젝트 설정 및 자동 실행 규칙
```

---

## 사용 방법

### 1. 요구사항 작성

FDE가 현업 담당자에게 받은 요구사항을 `spec-requests/{projectId}/{projectId}.v1.md` 에 작성.

### 2. 명세(YML) 생성

Claude와 대화하며 `harness/spec-format.md` 포맷에 맞게 YML 명세 생성.
`project.id`, `project.version`, `project.ports`, `project.database` 를 포함해야 한다.

### 3. 코드 생성

YML 명세를 Claude에게 전달하면 다음이 자동으로 진행된다.

```
환경 체크 → 백엔드 셋팅 → 프론트엔드 셋팅 → CRUD 구현 → 빌드 검증 → 스키마·로그 업데이트
```

### 4. 업데이트 / 재생성

동일 프로젝트에 기능을 추가하거나 수정하고 싶으면:

1. `specs/{projectId}/{projectId}.v{N+1}.yml` 새 버전 생성
2. Claude에게 요청 → **이미 존재하는 프로젝트 감지** 시 아래 선택지 제시

```
[1] 완전 재생성  —  projects/{id}/ 전체 삭제 후 v{N+1} yml로 처음부터 재생성
                   (YML과 100% 일치, 오래 걸림, DB 초기화)

[2] 증분 수정    —  v{N} 과 diff 계산해서 변경된 부분만 코드 수정
                   (빠름, DB 보존, 복잡한 변경은 불완전할 수 있음)
```

신규 프로젝트면 묻지 않고 바로 생성.

---

## 기술 스택

| 구분 | 스택 |
|------|------|
| 프론트엔드 | React 19 + TypeScript + Tailwind CSS + Vite |
| 백엔드 | Spring Boot 3 + Java 17 + JPA (Hibernate) |
| DB | H2 (파일 모드, 프로젝트별 data/ 격리) |

---

## 예시 프로젝트

- [resort-reservation](specs/resort-reservation/) — 리조트 객실 예약 시스템 (v1, 2026-04-16)
